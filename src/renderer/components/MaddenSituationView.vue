<template>
<div class="playbook-view-wrapper situation-view-wrapper">
  <div class="loader-wrapper" v-if="!fileLoaded">
    <div class="loader"></div>
    <div class="underlay"></div>
  </div>
  <div class="main-header-wrapper">
    <h2 class="main-header">Situation View</h2>
    <div class="back-to-db-editor" v-on:click="onBackToDbEditorClick">Back to DB Editor</div>
  </div>
  <div class="not-playbook-message" v-if="!isPlaybook">The selected file is not a recognized playbook file. To use this view, please open either a team playbook or a custom playbook.
  </div>
  <div class="tables-wrapper" v-if="isPlaybook" ref="wrapper">
    <div class="set-table-wrapper table-wrapper">
      <div class="set-name-table table">
        <div class="set table-item" v-bind:class="{ active: selectedSituation === situation }" v-for="situation in situationNames" 
          v-bind:key="situation.id" v-on:click="selectSituation(situation)">{{situation.name}}</div>
      </div>
    </div>

    <div class="hot-container"> 
      <hot-table :settings="hotSettings" ref="hot"></hot-table>
    </div>
  </div>
</div>
</template>

<style src="../../../node_modules/handsontable/dist/handsontable.full.css"></style>
<style src='../assets/madden-situation-view.scss'></style>

<script>
import fs from 'fs';
import Vue from 'vue';
import path from 'path';
import { ipcRenderer } from 'electron';
import Handsontable from 'handsontable';
import HexReader from '../utils/HexReader';
import formationsTable from '../utils/FORM';
import { HotTable } from '@handsontable/vue';
import TempDbUtil from '../utils/TempDbUtil';
import FieldTypes from '../utils/FieldTypeEnum';
import SituationData from '../utils/SituationData';

export default {
  name: 'MaddenSituationView',
  props: ['resetPlaybookView', 'fileLoaded'],
  components: {
    HotTable
  },
  data () {
    return {
      setNames: [],
      width: 0,
      height: 0,
      plays: [],
      filteredPlays: [],
      selectedSituation: null,
      selectedPlay: null,
      selectedPosition: null,
      positions: null,
      plyt: null,
      plrd: null,
      psal: null,
      plrr: null,
      vpos: null,
      artl: null,
      isPlaybook: true,
      isCustomPlaybook: false,
      hotSettings: {
        'manualColumnResize': true,
        'rowHeights': 25,
        'manualRowResize': true,
        'currentRowClassName': 'active-row',
        'columns': [
          { data: 'pbpl', 'readOnly': true },
          { data: 'pbai.setl.name', 'readOnly': true },
          { data: 'name', 'readOnly': true },
          { data: 'pbai.prct' }
        ],
        'colHeaders': ['pbpl', 'formation/set', 'play name', 'prct'],
        'colWidths': [85, 300, 300, 75],
        'afterChange': this.processChanges,
        'width': 780,
        'columnSorting': true
      }
    }
  },

  computed: {
    situationNames: function () {
      return SituationData.map((situation, index) => {
        return {
          'id': index,
          'name': situation.name,
          'aigr': situation.aigr
        }
      });
    }
  },

  mounted() {
    this.hotRef = this.$refs.hot.hotInstance;
    window.addEventListener('resize', this.onResize);
    this.onResize();
  },

  destroyed() {
    window.removeEventListener('resize', this.onResize);

    if (this.$refs.hot) {
      this.$refs.hot.hotInstance.destroy();
    }
  },

  watch: {
    fileLoaded: function (fileLoaded) {
      if (fileLoaded) {
        this.processFile();
      }
    },

    resetPlaybookView: function () {
      this.setNames = [];
      this.plays = [];
      this.selectedSet = null;
      this.selectedPlay = null;
      this.selectedPosition = null;
      this.plyt = null;
      this.plrd = null;
      this.psal = null;
      this.plrr = null;
      this.vpos = null;
      this.artl = null;
    }
  },

  setTable: null,
  formationsTable: formationsTable,
  plysTable: null,
  pbplTable: null,
  plrdTable: null,
  plylTable: null,
  isPlaybook: false,
  isCustomPlaybook: false,

  methods: {
    onResize: function () {
      this.width = this.$refs.wrapper.offsetWidth;
      this.height = this.$refs.wrapper.offsetHeight;

      this.$refs.hot.hotInstance.updateSettings({
        height: this.height - 40
      });
    },

    processFile: function () {
      this.plays = [];
      this.isPlaybook = TempDbUtil.fileIsPlaybook();
      this.isCustomPlaybook = TempDbUtil.fileIsCustomPlaybook();

      if (this.isPlaybook) {
        this.parseTable('SETL', 'setTable');
        this.parseTable('PBPL', 'pbplTable');
        this.parseTable('PBAI', 'pbaiTable');
      // }
        // this.parseTable('PLYS', 'plysTable');
        // this.parseTable('PLRD', 'plrdTable');

        if (!this.isCustomPlaybook) {
          this.parseTable('PLYL', 'plylTable');
        }

        this.parseSetNames();
        this.parsePbplTableNames();
        this.parsePbaiList();

        setTimeout(() => {
          this.selectSituation(this.situationNames[0]);
          this.onResize();
        }, 250);
      }
    },

    parseTable: function (tableAbbreviation, optionsName) {
      this.$options[optionsName] = TempDbUtil.getTable(tableAbbreviation);
    },

    parseTableFromFile: function (file, optionsName) {
      this.$options[optionsName] = FormationData;
    },

    parseSetNames: function () {
      if (!this.$options.setTable || !this.$options.formationsTable) {
        return;
      }

      for(let i = 0; i < this.$options.setTable.fields[0].records.length; i++) {
        const formId = this.$options.setTable.fields[1].records[i].value;
        const setName = this.$options.setTable.fields[7].records[i].value;
        const formRecordNumber = this.$options.formationsTable.fields[0].records.find((formData) => { return formData.value === formId; }).recordNumber;
        const formName = this.$options.formationsTable.fields[2].records[formRecordNumber].value;
        const formationType = this.$options.formationsTable.fields[1].records[formRecordNumber].value;

        const setl = this.$options.setTable.fields[0].records[i].value;
        const setDisplayName = formName + ' ' + setName;
        this.setNames.push({
          'id': i,
          'name': setDisplayName.trim(),
          'setl': setl,
          'type': formationType
        });
      }

      this.setNames.sort((a, b) => { 
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (nameA < nameB)
            return -1 
        if (nameA > nameB)
            return 1

        return 0
      });
    },

    selectSituation: function (situation) {
      this.selectedSituation = situation;
      this.filteredPlays = this.plays.filter((play) => {
        return play.pbaiData.find((pbai) => { return situation.aigr.includes(pbai.aigr); });
      }).map((play) => {
        return {
          'name': play.name,
          'pbpl': play.pbpl,
          'pbplRecord': play.pbplRecord,
          'pbai': play.pbaiData.find((pbai) => { return situation.aigr.includes(pbai.aigr); })
        };
      });

      const hot = this.$refs.hot.hotInstance;

      hot.updateSettings({
        data: this.filteredPlays
      });

      this.filteredPlays.forEach((play, index) => {
        hot.getSettings().columns.forEach((col) => {
          hot.setCellMeta(index, col.data, 'pbplRecord', play.pbplRecord);
          hot.setCellMeta(index, col.data, 'pbaiRecord', play.pbai.pbaiRecord);
        });
      });
    },

    parsePositions: function () {
      if (this.selectedSet.type === 1) {
        this.positions = PositionData.offense;
      } else {
        this.positions = PositionData.defense;
      }
    },

    parsePbplTableNames: function () {
      if (this.isCustomPlaybook) {
        this.parsePbplTableNamesFromCustomPlaybook();
      }
      else {
        this.parsePbplTableNamesFromTeamPlaybook();
      }
    },

    parsePbplTableNamesFromCustomPlaybook: function () {
      if (!this.$options.pbplTable) {
        return;
      }

      for (let i = 0; i < this.$options.pbplTable.fields[0].records.length; i++) {
        const selectedSetl = this.selectedSet.setl;

        const setl = this.$options.pbplTable.fields[1].records[i].value;

        if (setl === selectedSetl) {
          const plyl = this.$options.pbplTable.fields[2].records[i].value;
          const name = this.$options.pbplTable.fields[7].records[i].value;
          
          this.plays.push({
            'name': name.trim(),
            'plyl': plyl,
            'plylRecord': i
          });
        }
      }
    },

    parsePbplTableNamesFromTeamPlaybook: function () {
      if (!this.$options.plylTable || !this.$options.pbplTable) {
        return;
      }

      for (let i = 0; i < this.$options.pbplTable.fields[0].records.length; i++) {
        const name = this.$options.pbplTable.fields[6].records[i].value;
        
        this.plays.push({
          'name': name.trim(),
          'plyl': this.$options.pbplTable.fields[3].records[i].value,
          'pbpl': this.$options.pbplTable.fields[2].records[i].value,
          'pbplRecord': i,
          'pbaiData': [],
        });
      }
    },

    parsePbaiList: function () {
      const pbai = this.$options.pbaiTable;
      if (!pbai) {
        return;
      }

      for (let i = 0; i < pbai.fields[0].records.length; i++) {
        const pbpl = pbai.fields[0].records[i].value;
        const setl = pbai.fields[1].records[i].value;
        const aigr = pbai.fields[2].records[i].value;
        const plyt = pbai.fields[3].records[i].value;
        const prct = pbai.fields[7].records[i].value;

        const play = this.plays.find((play) => {
          return play.pbpl === pbpl;
        });

        play.pbaiData.push({
          'pbaiRecord': i,
          'setl': this.setNames.find((set) => { return set.setl === setl; }),
          'aigr': aigr,
          'plyt': plyt,
          'prct': prct
        });
      }
    },

    selectPlay: function (play) {
      this.selectedPlay = play;

      this.parsePlayData(play);
      this.selectedPosition = null;
      this.psal = null;
      this.artl = null;
      this.plrr = null;
    },

    parsePlayData: function (play) {
      if (this.isCustomPlaybook) {
        this.parsePlayDataFromCustomPlaybook(play);
      } 
      else {
        this.parsePlayDataFromTeamPlaybook(play);
      }
    },

    parsePlayDataFromCustomPlaybook: function (play) {
      const plyl = play.plyl;
      const record = play.plylRecord;
      this.vpos = this.$options.pbplTable.fields[10].records[record].value;
      this.plyt = this.$options.pbplTable.fields[5].records[record].value;

      const plrdIndex = this.$options.plrdTable.fields[0].records.findIndex((plrdPlyl) => { return plrdPlyl.value === plyl; });
      
      if (plrdIndex > -1 ) {
        this.plrd = this.$options.plrdTable.fields[1].records[plrdIndex].value;
      }
      else {
        this.plrd = 'N/A';
      }
    },

    parsePlayDataFromTeamPlaybook: function (play) {
      const plyl = play.plyl;
      const record = play.plylRecord;
      this.vpos = this.$options.plylTable.fields[10].records[record].value;
      this.plyt = this.$options.plylTable.fields[4].records[record].value;

      const plrdIndex = this.$options.plrdTable.fields[0].records.findIndex((plrdPlyl) => { return plrdPlyl.value === plyl; });
      
      if (plrdIndex > -1 ) {
        this.plrd = this.$options.plrdTable.fields[1].records[plrdIndex].value;
      }
      else {
        this.plrd = 'N/A';
      }
    },

    selectPosition: function (position) {
      this.selectedPosition = position.index;

      this.parsePositionData(position, this.selectedPlay);
    },

    parsePositionData: function (position, play) {
      const positionIndex = position.index;
      const plysTableRecords = this.$options.plysTable.fields[2].records.filter((plysData) => { return plysData.value === play.plyl; });
      const plylRecordNumbers = plysTableRecords.map((plysData) => { return plysData.recordNumber; });
      
      const positionPlysData = this.$options.plysTable.fields[4].records.filter((plysData) => { return plysData.value === positionIndex; });
      const positionRecordNumbers = positionPlysData.map((plysData) => { return plysData.recordNumber; });

      const plysRecordNumber = positionRecordNumbers.filter((positionRecord) => { return plylRecordNumbers.includes(positionRecord); });

      if (plysRecordNumber.length !== 1) {
        this.psal = 'N/A';
        this.artl = 'N/A';
        this.plrr = 'N/A';
      }
      else {
        this.psal = this.$options.plysTable.fields[0].records[plysRecordNumber].value;
        this.artl = this.$options.plysTable.fields[1].records[plysRecordNumber].value;
        this.plrr = this.$options.plysTable.fields[3].records[plysRecordNumber].value;
      }
    },

    onBackToDbEditorClick: function () {
      this.$emit('hide-situation-view');
    },

    processChanges: function (changes) {
      if (!changes) { return; }

      const changesWithMeta = changes.map(function ([row, prop, oldValue, newValue]) {
        const meta = this.$refs.hot.hotInstance.getCellMeta(row, prop);
        let column;

        switch (prop) {
          default:
          case 'pbai.prct':
            column = this.$options.pbaiTable.fields.findIndex((field) => { return field.name === 'prct'; })
            break;
        }

        return {
          recordNumber: meta.pbaiRecord,
          column: column,
          value: newValue
        };
      }.bind(this));

      changesWithMeta.forEach((change) => {
        const field = this.$options.pbaiTable.fields[change.column];

        let value;

        switch(field.type) {
          case FieldTypes.SINT:
          case FieldTypes.UINT:
          case FieldTypes.FLOAT:
            value = HexReader.toUint32(change.value);
            break;
          case FieldTypes.STRING:
          case FieldTypes.BINARY:
          default:
            value = change.value; 
            break;
        }

        this.$options.pbaiTable.fields[change.column].records[change.recordNumber].value = value;
      });

      const fileChanges = changesWithMeta.map((change) => {
        return {
          fieldType: this.$options.pbaiTable.fields[change.column].type,
          fieldOffset: this.$options.pbaiTable.fields[change.column].offset,
          fieldBits: this.$options.pbaiTable.fields[change.column].bits,
          record: this.$options.pbaiTable.fields[change.column].records[change.recordNumber]
        }
      });

      ipcRenderer.send('write-records', {
        dataStart: this.$options.pbaiTable.header.dataStart,
        lenBytes: this.$options.pbaiTable.header.lenBytes,
        changes: fileChanges
      });

      TempDbUtil.writeTable('PBAI', this.$options.pbaiTable);
    }
  }
}
</script>