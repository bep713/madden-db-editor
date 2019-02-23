import HexReader from '../renderer/utils/HexReader';

class CRC {
  constructor() {
    this.CRCPOLY_BE = 0x04c11db7;
    let crc = 0x80000000;

    let crcTableBe = [0];

    for (let i = 1; i < 1 << 4; i <<= 1) {
      crc = (crc << 1) ^ (((crc & 0x80000000) != 0) ? this.CRCPOLY_BE : 0);

      for (let j = 0; j < i; j++) {
        crcTableBe[i+j] = crc ^ crcTableBe[j];
      }
    }

    this.crcTable = crcTableBe;
  }

  crc32_be(crc, p, len, start=0) {
    let x = HexReader.toUint32(start);
    crc = HexReader.toUint32(crc);
    len = HexReader.toUint32(len);
    
    crc = HexReader.toUint32(crc ^ 0xFFFFFFFF);

    while (len-- > 0) {
      crc = HexReader.toUint32(crc ^ p[x++] << 24);
      crc = HexReader.toUint32(((crc << 4) >>> 0) ^ this.crcTable[crc >>> 28]);
      crc = HexReader.toUint32(((crc << 4) >>> 0) ^ this.crcTable[crc >>> 28]);
    }

    return HexReader.toUint32(crc ^ 0xFFFFFFFF);
  }
}

export default CRC;