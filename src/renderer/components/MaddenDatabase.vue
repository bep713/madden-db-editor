<template>
  <div id="madden-database">
    <!-- <button v-on:click="readFile">Read File</button> -->
    <!-- <h1 v-for="table in tables" v-bind:key="table.definition.name">{{table.definition.name}}</h1> -->
    <!-- <section class="madden-header-section"> -->
      <!-- <div class="madden-header-controls"> -->
        <!-- <button class="toggle-header-data" v-show="fileCurrentlyLoaded" v-on:click="toggleHeaderData">Toggle header data</button> -->
      <!-- </div> -->
      <!-- <MaddenHeader 
          v-show="showHeaderData"
      ></MaddenHeader> -->
    <!-- </section> -->
    <section class="madden-tables-section">
      <MaddenTable></MaddenTable>
    </section>
  </div>
</template>

<script>
import MaddenTable from './MaddenTable.vue';
// import MaddenHeader from './MaddenHeader.vue';
import path from 'path';
import { mapActions, mapGetters, mapState } from 'vuex';
import { requireTaskPool } from 'electron-remote';
import { ipcRenderer } from 'electron';

import fs from 'fs';

const headerDbValue = 0x4442;
const FILE_HEADER_SIZE = 24,
      tableHeaderSize = 8,
      tableIndexOffset = 0x24;

export default {
  name: 'MaddenDatabase', 
  data () {
    return {
      showHeaderData: false,
      tables: []
    }
  },

  mounted() {
    ipcRenderer.on('file-contents', function (event, arg) {
      console.log('Received contents: ', arg);
    })
  },

  components: {
    // MaddenHeader: MaddenHeader
    MaddenTable: MaddenTable
  },

  computed: {
    ...mapGetters([
      'FILE_DATA',
      'TABLE_COUNT'
    ]),

    fileCurrentlyLoaded: function () {
      return this.FILE_DATA ? this.FILE_DATA.length > 0 : false;
    }
  },

  watch: {
    TABLE_COUNT: function (newCount, oldCount) {
      console.log(newCount);
    }
  },

  methods: {
    ...mapActions([
      'SAVE_FILE_DATA',
      'RESET_FILE_DATA',
      'READ_TABLES',
      'SAVE_TABLES'
    ]),

    toggleHeaderData: function () {
      this.showHeaderData = !this.showHeaderData;
    },

    readFile: async function () {
      ipcRenderer.send('load-file', 'C:\\Projects\\madden-mods\\projects\\playbooks\\madden_browns.db');
      // let tables = await TableReader.readTablesInFile('C:\\Projects\\madden-mods\\projects\\playbooks\\madden_browns.db');
      // fs.writeFileSync('./table.json', JSON.stringify(tables));
      // this.SAVE_TABLES(tables);
      // await this.RESET_FILE_DATA();
      // fs.readFile('C:\\Projects\\madden-mods\\projects\\playbooks\\madden_browns.db', this._processDbFileData);
    },

    _processDbFileData: async function (err, data) {
      if (err) throw err;
      await this.SAVE_FILE_DATA({ fileData: data });
      this.READ_TABLES();
    }
  }
}
</script>