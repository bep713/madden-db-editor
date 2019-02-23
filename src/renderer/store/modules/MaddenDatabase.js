import HexReader from '../../utils/HexReader';

const state = {
  fileData: [],
  headerData: {
    digit: 0,
    version: 0,
    unknown1: 0,
    dbSize: 0,
    zero: 0,
    tableCount: 0,
    unknown2: 0
  },
  fileHeaderSize: 24
};

const getters = {
  FILE_DATA: state => {
    return state.fileData;
  },
  
  FILE_HEADER_DATA: state => {
    return getHeaderData(state.fileData);
  },

  FILE_TABLE_DATA: state => {
    return getTableData(state.fileData);
  },

  TABLE_COUNT: state => {
    return state.headerData.tableCount;
  },

  DB_SIZE: state => {
    return state.headerData.dbSize;
  },

  HEADER_DIGIT: state => {
    return state.headerData.digit;
  },

  GET_WORD_AT: function (state) {
    return function (index) {
      return this.$readWordAt(index, state.fileData);
    }
  },

  GET_DWORD_AT: function (state) {
    return function (index) {
      return this.$readDWordAt(index, state.fileData);
    }
  }
};

const mutations = {
  SET_FILE_DATA: (state, payload) => {
    state.fileData = payload.fileData;
  },
  SET_HEADER_DIGIT: (state, payload) => {
    state.headerDigit = payload.header;
  },
  SET_VERSION: (state, payload) => {
    state.version = payload.version;
  },
  SET_UNKNOWN1: (state, payload) => {
    state.unknown1 = payload.unknown1;
  },
  SET_DB_SIZE: (state, payload) => {
    state.dbSize = payload.dbSize;
  },
  SET_ZERO: (state, payload) => {
    state.zero = payload.zero;
  },
  SET_TABLE_COUNT: (state, payload) => {
    state.tableCount = payload.tableCount;
  },
  SET_UNKNOWN2: (state, payload) => {
    state.unknown2 = payload.unknown2;
  },
  SET_HEADER_DATA: (state, payload) => {
    state.headerData = payload.headerData;
  }
};

const actions = {
  async SAVE_FILE_DATA ({ commit, state }, payload) {

    const headerData = getHeaderData(payload.fileData);

    if (headerData.length >= state.fileHeaderSize) {
      const readWordInHeaderAt = (index) => {
        return HexReader.readWordAt(index, headerData);
      };
  
      const readDWordInHeaderAt = (index) => {
        return HexReader.readDWordAt(index, headerData);
      };
  
      const headers = {
        'headerData': {
          'digit': readWordInHeaderAt(1),
          'version': readWordInHeaderAt(3),
          'unknown1': readDWordInHeaderAt(7),
          'dbSize': readDWordInHeaderAt(11),
          'zero': readDWordInHeaderAt(15),
          'tableCount': readDWordInHeaderAt(19),
          'unknown2': readDWordInHeaderAt(23)
        }
      };

      commit('SET_FILE_DATA', payload);
      commit('SET_HEADER_DATA', headers);
    }
  },

  async RESET_FILE_DATA ({commit, dispatch}) {
    const resetFileDataPayload = {
      'fileData': null
    };

    const resetHeaderDataPayload = {
      'headerData': {
        'digit': null,
        'version': null,
        'unknown1': null,
        'dbSize': null,
        'zero': null,
        'tableCount': null,
        'unknown2': null
      } 
    };

    commit('SET_FILE_DATA', resetFileDataPayload);
    commit('SET_HEADER_DATA', resetHeaderDataPayload);
    
    dispatch('RESET_TABLES', null, { root: true });
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};

function getHeaderData(fileData) {
  if (fileData && fileData.slice) {
    return fileData.slice(0, state.fileHeaderSize);
  }
  else {
    return [];
  }
};

function getTableData(fileData) {
  if (fileData && fileData.slice) {
    return fileData.slice(state.fileHeaderSize);
  }
  else {
    return []; 
  }
};
