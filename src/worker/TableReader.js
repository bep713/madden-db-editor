import HexReader from '../renderer/utils/HexReader';
import TableConstants from './TableConstants';
import BitArray from 'node-bitarray';
import fs from 'fs';
import { EventEmitter } from 'events';

class TableReader extends EventEmitter {
  readTablesInFile(file) {
    const data = fs.readFileSync(file)
    this.emit('raw-file', data);

    const headerData = data.slice(0, TableConstants.FILE_HEADER_SIZE);

    if (headerData.length >= TableConstants.FILE_HEADER_SIZE) {
      const readWordInHeaderAt = (index) => {
        return HexReader.readWordAt(index, headerData);
      };
  
      const readDWordInHeaderAt = (index) => {
        return HexReader.readDWordAt(index, headerData);
      };
  
      let headers = {
        'digit': readWordInHeaderAt(1),
        'version': readWordInHeaderAt(3),
        'unknown1': readDWordInHeaderAt(7),
        'dbSize': readDWordInHeaderAt(11),
        'zero': readDWordInHeaderAt(15),
        'tableCount': readDWordInHeaderAt(19),
        'unknown2': readDWordInHeaderAt(23)
      };

      const TABLE_COUNT = headers.tableCount;
      const TABLE_DATA = data.slice(TableConstants.FILE_HEADER_SIZE);

      let currentPosition = 0;

      let tableData = {
        'tables': []
      }

      // TABLE DEFINITION
      for (let i = 0; i < TABLE_COUNT; i++) {
        let tableName = HexReader.readTextAt(currentPosition + 3, 4, TABLE_DATA);
        let offset = HexReader.readDWordAt(currentPosition + 7, TABLE_DATA);
        currentPosition += TableConstants.TABLE_DEFINITION_SIZE;

        const definition = {
          'name': tableName,
          'offset': offset
        };

        const table = {
          'definition': definition
        }

        tableData.tables.push(table);
        this.emit('table-definition', definition);
      }

      const headerStart = currentPosition;
      headers.dataStart = headerStart + TableConstants.FILE_HEADER_SIZE;
      
      this.emit('file-header', headers);

      // TABLE HEADER
      tableData.tables.forEach((table) => {
        const startingPosition = headerStart + table.definition.offset;
        const endingPosition = startingPosition + TableConstants.TABLE_HEADER_SIZE;

        const TABLE_HEADER = TABLE_DATA.slice(startingPosition, endingPosition);

        const readWordInTableHeaderAt = (index) => {
          return HexReader.readWordAt(index, TABLE_HEADER);
        };

        const readDWordInTableHeaderAt = (index) => {
          return HexReader.readDWordAt(index, TABLE_HEADER);
        };

        const header = {
          'priorcrc': readDWordInTableHeaderAt(3),
          'unknown2': readDWordInTableHeaderAt(7),
          'lenBytes': readDWordInTableHeaderAt(11),
          'lenBits': readDWordInTableHeaderAt(15),
          'zero': readDWordInTableHeaderAt(19),
          'maxRecords': readWordInTableHeaderAt(21),
          'curRecords': readWordInTableHeaderAt(23),
          'unknown3': readDWordInTableHeaderAt(27),
          'numFields': TABLE_HEADER[28],
          'indexCount': TABLE_HEADER[29],
          'zero2': readWordInTableHeaderAt(31),
          'zero3': readDWordInTableHeaderAt(35),
          'headercrc': readDWordInTableHeaderAt(39),
          'fieldStart': startingPosition + TableConstants.TABLE_HEADER_SIZE,
          'dataStart': startingPosition + TableConstants.TABLE_HEADER_SIZE + (TABLE_HEADER[28] * TableConstants.TABLE_FIELD_SIZE)
        };

        table.header = header;
        table.fields = [];
        this.emit('table-header', table);
      });

      // TABLE FIELDS
      tableData.tables.forEach((table) => {
        table.fields = [];

        currentPosition = table.header.fieldStart;

        for (let i = 0; i < table.header.numFields; i++) {
          const FIELD_DATA = TABLE_DATA.slice(currentPosition, currentPosition + TableConstants.TABLE_FIELD_SIZE);
          
          const readTextInFieldDataAt = (index, length) => {
            return HexReader.readTextAt(index, length, FIELD_DATA);
          };

          const readDWordInFieldDataAt = (index) => {
            return HexReader.readDWordAt(index, FIELD_DATA);
          };

          const field = {
            'type': readDWordInFieldDataAt(3),
            'offset': readDWordInFieldDataAt(7),
            'name': readTextInFieldDataAt(11, 4),
            'bits': readDWordInFieldDataAt(15),
            'records': []
          };

          table.fields.push(field);
          currentPosition += TableConstants.TABLE_FIELD_SIZE;
        }
      });

      const FIELD_TYPE_STRING = 0;
      const FIELD_TYPE_BINARY = 1;
      const FIELD_TYPE_SINT = 2;
      const FIELD_TYPE_UINT = 3;
      const FIELD_TYPE_FLOAT = 4;

      // TABLE RECORD DATA
      for  (let t = 0; t < tableData.tables.length; t++) {
        const table = tableData.tables[t];

        for (let f = 0; f < table.fields.length; f++) {
          const field = table.fields[f];
          
          for (let i = 0; i < table.header.curRecords; i++) {
            const startingPosition = table.header.dataStart + (i * table.header.lenBytes);
            const endingPosition = startingPosition + table.header.lenBytes;

            const RECORD_DATA = TABLE_DATA.slice(startingPosition, endingPosition);

            let recordValue = null;

            switch(field.type) {
              case FIELD_TYPE_STRING:
                recordValue = readString(RECORD_DATA, field);
                break;
              case FIELD_TYPE_BINARY:
                recordValue = readBytes(RECORD_DATA, field);
                break;
              case FIELD_TYPE_SINT:
              case FIELD_TYPE_UINT:
              case FIELD_TYPE_FLOAT:
                let arr = [...RECORD_DATA.slice(Math.floor(field.offset/8), Math.ceil((field.bits + field.offset)/8))];

                let bitArray = arr.map((byte) => { return BitArray.factory(byte, 8, true) });
                let allBits = [];

                for (let i = 0; i < bitArray.length; i++) {
                  allBits.push(...bitArray[i].__bits);
                }

                recordValue = readBits(allBits, field.offset % 8, field.bits);

                break;
            }

            field.records.push({
              'value': recordValue,
              'recordNumber': i
            });
          }

          this.emit('table-field', {
            field: field,
            tableName: table.definition.name
          });
        };

        // this.emit('table', table);
        this.emit('table-done', {
          tableName: table.definition.name,
          tableData: table
        });
      };

      this.emit('read-done');
    }
  }
};

function readString (recordData, field) {
  let str = '';

  for (let i = 0; i < (field.bits/8); i++) {
    let b = recordData[(field.offset/8) + i];

    if (b != 0) {
      str += String.fromCharCode(b);
    }
  }

  return str;
};

function readBytes (recordData, field) {
  let bytes = [];

  for (let i = 0; i < (field.bits/8); i++) {
    bytes[i] = recordData[(field.offset/8) + i];
  }

  return bytes;
};

function readBits (recordData, offset, bitsToRead) {
  let ret = 0;
  let mask = 1;

  for (let i = bitsToRead; i > 0; i--) {
    if (recordData[i + offset-1] == true) {
      ret = ret | mask;
    }

    mask = mask << 1;
  }

  return HexReader.toUint32(ret);
};

export default TableReader;