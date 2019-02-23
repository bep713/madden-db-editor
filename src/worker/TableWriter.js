import fs from 'fs';
import CRC from './CRC';
import HexWriter from './HexWriter';
import BitArray from 'node-bitarray';
import { EventEmitter } from 'events';
import TableConstants from './TableConstants';
import HexReader from '../renderer/utils/HexReader';
import FieldTypeEnums from '../renderer/utils/FieldTypeEnum';

class TableWriter extends EventEmitter {
  writeRecordsToFile(data, currentFile) {
    const path = data.filePath;
    const dataStart = data.dataStart;
    const lenBytes = data.lenBytes;
    const changes = data.changes;

    changes.forEach((change) => {
      const fieldType = change.fieldType;
      const fieldOffset = change.fieldOffset;
      const fieldBits = change.fieldBits;
      const record = change.record;

      const recordOffset = dataStart + TableConstants.FILE_HEADER_SIZE + (record.recordNumber * lenBytes);
      let bytes = [...currentFile.buffer.slice(recordOffset, recordOffset + lenBytes)];
      let bitArray = bytes.map((byte) => { return BitArray.factory(byte, 8, true) });

      let allBits = [];

      for (let i = 0; i < bitArray.length; i++) {
        allBits.push(...bitArray[i].__bits);
      }

      let bitarray2 = new BitArray(allBits);

      switch(fieldType) {
        case FieldTypeEnums.STRING:
          writeBytes(record.value, fieldOffset, (fieldBits / 8), bitarray2);
          break;
        case FieldTypeEnums.BINARY:
          break;
        case FieldTypeEnums.SINT:
        case FieldTypeEnums.UINT:
        case FieldTypeEnums.FLOAT:
        default:
          writeBits(record.value, fieldOffset, fieldBits, bitarray2);
      }

      let newBytes = bitarray2.toBuffer();

      for (let i = 0; i < lenBytes; i++) {
        currentFile.buffer[recordOffset + i] = newBytes[i];
      }
    });

    // CALCULATE CHECKSUMS
    let crc = new CRC();
    let calculatedHeaderCRC = HexReader.toUint32(~crc.crc32_be(0, currentFile.buffer, 20, 0));
    let priorCRC = HexReader.toUint32(~crc.crc32_be(0, currentFile.buffer, (currentFile.header.tableCount * 8), 24));

    let start = 0;
    let end = 0;
    const startData = currentFile.header.dataStart;

    for (let i = 0; i < currentFile.header.tableCount - 1; i++) {
      const table = currentFile.tables[i];

      // TABLE HEADER CRC
      start = startData + table.offset + 4;
      table.calcHcrc = HexReader.toUint32(~crc.crc32_be(0, currentFile.buffer, TableConstants.TABLE_HEADER_SIZE - 8, start));
      
      // TABLE DATA CRC
      start = startData + table.offset + TableConstants.TABLE_HEADER_SIZE;
      end = startData + currentFile.tables[i+1].offset;

      table.calcPcrc = priorCRC;
      priorCRC = HexReader.toUint32(~crc.crc32_be(0, currentFile.buffer, (end - start), start));
    }

    // LAST TABLE
    const lastTable = currentFile.tables[currentFile.header.tableCount - 1]
    start = startData + lastTable.offset + 4;
    
    lastTable.calcHcrc = HexReader.toUint32(~crc.crc32_be(0, currentFile.buffer, TableConstants.TABLE_HEADER_SIZE - 8, start));
    lastTable.calcPcrc = priorCRC;

    start = startData + lastTable.offset + TableConstants.TABLE_HEADER_SIZE;
    end = currentFile.header.dbSize - 4;

    let calculatedEOFcrc = HexReader.toUint32(~crc.crc32_be(0, currentFile.buffer, (end - start), start));
    
    HexWriter.writeDWord(calculatedHeaderCRC, currentFile.buffer, 20);

    currentFile.tables.forEach((table) => {
      HexWriter.writeDWord(table.calcPcrc, currentFile.buffer, startData + table.offset);
      HexWriter.writeDWord(table.calcHcrc, currentFile.buffer, startData + table.offset + TableConstants.TABLE_HEADER_SIZE - 4);
    });
    
    HexWriter.writeDWord(calculatedEOFcrc, currentFile.buffer, currentFile.header.dbSize -4);

    fs.writeFileSync(path, currentFile.buffer);
    this.emit('write-done');
  }

  writeTablesToFile(data, currentFile) {
    console.time('write');
    const path = data.filePath;
    const tables = data.tables;

    tables.forEach((table) => {
      const headerOffset = table.header.fieldStart + TableConstants.FILE_HEADER_SIZE - TableConstants.TABLE_HEADER_SIZE;

      // WRITE TABLE HEADER
      HexWriter.writeDWord(table.header.priorcrc, currentFile, headerOffset);
      HexWriter.writeDWord(table.header.unknown2, currentFile, headerOffset + 0x04);
      HexWriter.writeDWord(table.header.lenBytes, currentFile, headerOffset + 0x08);
      HexWriter.writeDWord(table.header.lenBits, currentFile, headerOffset + 0x0C);
      HexWriter.writeDWord(table.header.zero, currentFile, headerOffset + 0x10);
      HexWriter.writeWord(table.header.maxRecords, currentFile, headerOffset + 0x14);
      HexWriter.writeWord(table.header.curRecords, currentFile, headerOffset + 0x16);
      HexWriter.writeDWord(table.header.unknown3, currentFile, headerOffset + 0x18);
      currentFile[headerOffset + 0x1C] = table.header.numFields;
      currentFile[headerOffset + 0x1D] = table.header.indexCount;
      HexWriter.writeWord(table.header.zero2, currentFile, headerOffset + 0x1E);
      HexWriter.writeDWord(table.header.zero3, currentFile, headerOffset + 0x20);
      HexWriter.writeDWord(table.header.headercrc, currentFile, headerOffset + 0x24);

      // WRITE TABLE FIELDS
      table.fields.forEach((field, index) => {
        const fieldOffset = table.header.fieldStart + TableConstants.FILE_HEADER_SIZE + (index * 16);

        HexWriter.writeDWord(field.type, currentFile, fieldOffset);
        HexWriter.writeDWord(field.offset, currentFile, fieldOffset + 0x04);
        HexWriter.writeText(field.name, currentFile, fieldOffset + 0x08);
        HexWriter.writeDWord(field.bits, currentFile, fieldOffset + 0x0C);

        // WRITE TABLE RECORDS
        field.records.forEach((record, index) => {
          const recordOffset = table.header.dataStart + TableConstants.FILE_HEADER_SIZE + (index * table.header.lenBytes);
          let bytes = [...currentFile.slice(recordOffset, recordOffset + table.header.lenBytes)];
          let bitArray = bytes.map((byte) => { return BitArray.factory(byte, 8, true) });

          let allBits = [];

          for (let i = 0; i < bitArray.length; i++) {
            allBits.push(...bitArray[i].__bits);
          }

          let bitarray2 = new BitArray(allBits);

          switch(field.type) {
            case FieldTypeEnums.STRING:
              writeBytes(record.value, field.offset, (field.bits / 8), bitarray2);
              break;
            case FieldTypeEnums.BINARY:
              break;
            case FieldTypeEnums.SINT:
            case FieldTypeEnums.UINT:
            case FieldTypeEnums.FLOAT:
            default:
              writeBits(record.value, field.offset, field.bits, bitarray2);
          }

          let newBytes = bitarray2.toBuffer();

          for (let i = 0; i < table.header.lenBytes; i++) {
            currentFile[recordOffset + i] = newBytes[i];
          }
        });
      });
    })

    fs.writeFileSync(path, currentFile);
    console.timeEnd('write');
  }
}

function writeBytes (bytes, offset, length, bits) {
  let arr = [...bytes].map((char) => {
    return char.charCodeAt(0);
  });

  for (let i = 0; i < length; i++) {
    writeBits((arr[i] & 0x000000FF), offset + (i * 8), 8, bits);
  }
};

function writeBits (value, offset, length, bits) {
  let mask = 1;

  for (let i = length; i > 0; i--) {
    if ((mask & value) === mask) {
      bits.set(i + offset - 1, 1);
    }
    else {
      bits.set(i + offset - 1, 0);
    }

    mask = mask << 1;
  }
};

export default TableWriter;