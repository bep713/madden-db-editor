import HexReader from '../../utils/HexReader';
import BitArray from 'node-bitarray';

const state = {
  tableDefinitionSize: 8,
  tableHeaderSize: 40,
  tableFieldSize: 16,
  tables: [],
};

const getters = {
  GET_TABLE_INDEX_BY_NAME: (state) => (name) => {
    return state.tables.findIndex(table => table.definition.name === name)
  },

  GET_TABLE_BY_NAME: (state) => (name) => {
    return state.tables.find(table => table.definition.name === name);
  },

  GET_TABLE_BY_INDEX: (state) => (index) => {
    return state.tables.length <= index ? state.tables[index] : null;
  },

  GET_TABLES: state => {
    return state.tables;
  }
};

const mutations = {
  SET_TABLES: (state, payload) => {
    state.tables = payload.tables;
  },

  SET_RECORD_VALUE: (state, payload) => {
    state.tables[payload.tableIndex].fields[payload.fieldIndex].records[payload.recordIndex].value = payload.value;
  }
};

const actions = {
  async SAVE_RECORD_VALUE ({ commit, state }, payload) {
    commit('SET_RECORD_VALUE', payload);
    return true;
  },

  async SAVE_TABLES ({ commit }, payload) {
    commit('SET_TABLES', payload);
  },

  async READ_TABLES ({ commit, state, rootGetters }, payload) {
    state.tableHeaderSize = 40;
    const TABLE_COUNT = rootGetters.TABLE_COUNT;
    const TABLE_DATA = rootGetters.FILE_TABLE_DATA;

    let currentPosition = 0;

    let tableData = {
      'tables': []
    }

    // TABLE DEFINITION
    for (let i = 0; i < TABLE_COUNT; i++) {
      let tableName = HexReader.readTextAt(currentPosition + 3, 4, TABLE_DATA);
      let offset = HexReader.readDWordAt(currentPosition + 7, TABLE_DATA);
      currentPosition += state.tableDefinitionSize;

      const definition = {
        'name': tableName,
        'offset': offset
      };

      const table = {
        'definition': definition
      }

      tableData.tables.push(table);
    }

    const headerStart = currentPosition;

    // TABLE HEADER
    tableData.tables.forEach((table) => {
      const startingPosition = headerStart + table.definition.offset;
      const endingPosition = startingPosition + state.tableHeaderSize;

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
        'fieldStart': startingPosition + state.tableHeaderSize,
        'dataStart': startingPosition + state.tableHeaderSize + (TABLE_HEADER[28] * state.tableFieldSize)
      };

      table.header = header;
    });

    // TABLE FIELDS
    tableData.tables.forEach((table) => {
      table.fields = [];

      currentPosition = table.header.fieldStart;

      for (let i = 0; i < table.header.numFields; i++) {
        const FIELD_DATA = TABLE_DATA.slice(currentPosition, currentPosition + state.tableFieldSize);
        
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
        currentPosition += state.tableFieldSize;
      }
    });

    const FIELD_TYPE_STRING = 0;
    const FIELD_TYPE_BINARY = 1;
    const FIELD_TYPE_SINT = 2;
    const FIELD_TYPE_UINT = 3;
    const FIELD_TYPE_FLOAT = 4;

    // TABLE RECORD DATA
    tableData.tables.forEach((table) => {
      table.fields.forEach((field) => {
        for (let i = 0; i < table.header.curRecords; i++) {
          const startingPosition = table.header.dataStart + (i * table.header.lenBytes);
          const endingPosition = startingPosition + table.header.lenBytes;
  
          const RECORD_DATA = TABLE_DATA.slice(startingPosition, endingPosition);

          let recordDataReversed  = [];
  
          const reverseByte = (byte) => {
            let r = 0;
  
            for (let i = 0; i < 8; i++) {
              r = r << 1;
              
              if ((byte & 0x01) === 1) {
                r |= 0x01;
              }
  
              byte = byte >> 1;
            }
  
            return r;
          };

          for (let i = 0; i < RECORD_DATA.length; i++) {
            recordDataReversed[i] = reverseByte(RECORD_DATA[i])
          }

          let bitArray = BitArray.fromBuffer(RECORD_DATA);       

          const readString = (recordData) => {
            let str = '';

            for (let i = 0; i < (field.bits/8); i++) {
              let b = recordData[(field.offset/8) + i];

              if (b != 0) {
                str += String.fromCharCode(b);
              }
            }

            return str;
          };

          const readBytes = (recordData) => {
            bytes = [];

            for (let i = 0; i < (field.bits/8); i++) {
              bytes[i] = recordData[(field.offset/8) + i];
            }

            return bytes;
          };

          const readBits = (recordData, offset, bitsToRead) => {
            let ret = 0;
            let mask = 1;

            for (let i = bitsToRead; i > 0; i--) {
              if (recordData.get(i + offset-1) == true) {
                ret = ret | mask;
              }

              mask = mask << 1;
            }

            return ret;
          };

          let recordValue = null;

          switch(field.type) {
            case FIELD_TYPE_STRING:
              recordValue = readString(RECORD_DATA);
              break;
            case FIELD_TYPE_BINARY:
              recordValue = readBytes(RECORD_DATA);
              break;
            case FIELD_TYPE_SINT:
            case FIELD_TYPE_UINT:
            case FIELD_TYPE_FLOAT:
              recordValue = readBits(bitArray, field.offset, field.bits);
              break;
          }

          field.records.push({
            'value': recordValue,
            'recordNumber': i
          });
        }
      });
    });

    commit('SET_TABLES', tableData);
  },

  async RESET_TABLES ({ commit }, payload) {
    commit('SET_TABLES', { tables: [] });
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};