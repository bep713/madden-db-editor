<template>
  <div class="madden-header-wrapper">
    <MaddenHeaderList
      v-bind:list="headers">
    </MaddenHeaderList>
  </div>
</template>

<script>
import MaddenHeaderList from './MaddenHeaderList';
import { mapActions, mapGetters } from 'vuex';

const headerDbValue = 0x4442;
const headerSize = 24,
      tableHeaderSize = 8,
      tableIndexOffset = 0x24;

export default {
  name: 'MaddenHeader',
  props: [],
  components: {
    MaddenHeaderList: MaddenHeaderList
  },

  data () {
    return {}
  },

  computed: {
    ...mapGetters([
      'FILE_HEADER_DATA',
      'GET_WORD_AT',
      'GET_DWORD_AT'
    ]),

    headers: function () {
      // if (!this.FILE_HEADER_DATA || this.FILE_HEADER_DATA.length === 0) return;

      // const headerData = this._getHeaderInfo(this.FILE_HEADER_DATA);
      // this._saveHeaders(headerData);
      // return this._parseHeaders(headerData);
    }
  },

  methods: {
    ...mapActions([
      'SAVE_TABLE_COUNT',
      'SAVE_DB_SIZE',
      'SAVE_HEADER_DIGIT'
    ]),

    _parseHeaders: function (headerData) {
      let parsedHeaders = [];

      if (typeof headerData !== 'object' || headerData instanceof Array || headerData === null) {
        throw new Error('Error: argument must be a non-null object.');
      }

      Object.keys(headerData).map((headerKey, index) => {
        parsedHeaders.push({
          'id': index,
          'name': headerKey,
          'value': headerData[headerKey]
        });
      });

      return parsedHeaders;
    },

    _getHeaderInfo: function (data) {
      return {
        'header': this.GET_WORD_AT(1),
        'version': this.GET_WORD_AT(3),
        'unknown1': this.GET_DWORD_AT(7),
        'dbSize': this.GET_DWORD_AT(11),
        'zero': this.GET_DWORD_AT(15),
        'tableCount': this.GET_DWORD_AT(19),
        'unknown2': this.GET_DWORD_AT(23)
      };
    },

    _saveHeaders: function (data) {
      this.SAVE_TABLE_COUNT(data);
      this.SAVE_DB_SIZE(data);
      this.SAVE_HEADER_DIGIT(data);
    }
  }
}
</script>