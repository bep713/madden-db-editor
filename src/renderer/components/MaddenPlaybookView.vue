<template>
<div class="playbook-view-wrapper">
  <div class="loader-wrapper" v-if="!fileLoaded">
    <div class="loader"></div>
    <div class="underlay"></div>
  </div>
  <div class="main-header-wrapper">
    <h2 class="main-header">Playbook View</h2>
    <div class="back-to-db-editor" v-on:click="onBackToDbEditorClick">Back to DB Editor</div>
  </div>
  <div class="not-playbook-message" v-if="!isPlaybook">The selected file is not a recognized playbook file. To use this view, please open either a team playbook or a custom playbook.
  </div>
  <div class="tables-wrapper" v-if="isPlaybook">
    <div class="set-table-wrapper span-all-rows table-wrapper">
      <h4 class="table-header">1.) Pick a set</h4>
      <div class="set-name-table table">
        <div class="set table-item" v-bind:class="{ active: selectedSet === set }" v-for="set in setNames" 
          v-bind:key="set.id" v-on:click="selectSet(set)">{{set.name}}</div>
      </div>
    </div>

    <div class="play-table-wrapper span-all-rows table-wrapper">
      <h4 class="table-header">2.) Pick a play</h4>
      <div class="plyl-table table">
        <div class="plyl table-item" v-bind:class="{ active: selectedPlay === play }" v-for="play in plays" 
          v-bind:key="play.id" v-on:click="selectPlay(play)">{{play.name}}</div>
      </div>
    </div>

    <div class="poso-table-wrapper table-wrapper">
      <h4 class="table-header">3.) Pick a position</h4>
      <div class="table" v-if="this.selectedPlay">
        <div class="table-item" v-bind:class="{ active: selectedPosition === position.index }" v-for="position in positions" 
          v-bind:key="position.index" v-on:click="selectPosition(position)">{{position.text}}</div>
      </div>
    </div>

    <div class="psal-table-wrapper table-wrapper">
      <h4 class="table-header">PSAL</h4>
      <div class="table">{{psal}}</div>
    </div>

    <div class="artl-table-wrapper table-wrapper">
      <h4 class="table-header">ARTL</h4>
      <div class="table">{{artl}}</div>
    </div>

    <div class="vpos-table-wrapper table-wrapper">
      <h4 class="table-header">vpos</h4>
      <div class="table">{{vpos}}</div>
    </div>

    <div class="psal-table-wrapper table-wrapper">
      <h4 class="table-header">PLRR</h4>
      <div class="table">{{plrr}}</div>
    </div>

    <div class="psal-table-wrapper table-wrapper">
      <h4 class="table-header">PLYT</h4>
      <div class="table">{{plyt}}</div>
    </div>

    <div class="plrd-table-wrapper table-wrapper">
      <h4 class="table-header">PLRD</h4>
      <div class="table">{{plrd}}</div>
    </div>
  </div>
</div>
</template>

<style src='../assets/madden-playbook-view.scss'></style>

<script>
import PositionData from '../utils/PositionData';
import fs from 'fs';
import TempDbUtil from '../utils/TempDbUtil';
import formationsTable from '../utils/FORM';

export default {
  name: 'MaddenPlaybookView',
  props: ['resetPlaybookView', 'fileLoaded'],
  data () {
    return {
      setNames: [],
      plays: [],
      selectedSet: null,
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
      isCustomPlaybook: false
    }
  },

  watch: {
    fileLoaded: function (fileLoaded) {
      this.isPlaybook = TempDbUtil.fileIsPlaybook();
      this.isCustomPlaybook = TempDbUtil.fileIsCustomPlaybook();

      if (fileLoaded && this.isPlaybook) {
        this.parseTable('SETL', 'setTable');
        // this.parseTableFromFile('../utils/FORM.js', 'formationsTable');
        this.parseTable('PBPL', 'pbplTable');
        this.parseTable('PLYS', 'plysTable');
        this.parseTable('PLRD', 'plrdTable');

        if (!this.isCustomPlaybook) {
          this.parseTable('PLYL', 'plylTable');
        }

        this.parseSetNames();
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
    parseTable: function (tableAbbreviation, optionsName) {
      this.$options[optionsName] = TempDbUtil.getTable(tableAbbreviation);
    },

    parseTableFromFile: function (file, optionsName) {
      const setTableString = fs.readFileSync(file);
      this.$options[optionsName] = JSON.parse(setTableString);
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
      })
    },

    selectSet: function (set) {
      this.selectedSet = set;
      this.plays = [];
      this.selectedPlay = null;
      this.selectedPosition = null;
      this.plyt = null;
      this.plrd = null;
      this.psal = null;
      this.plrr = null;
      this.vpos = null;
      this.artl = null;    

      this.parsePositions();
      this.parsePbplTableNames();
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
      if (!this.$options.plylTable) {
        return;
      }

      for (let i = 0; i < this.$options.pbplTable.fields[0].records.length; i++) {
        const selectedSetl = this.selectedSet.setl;

        const setl = this.$options.plylTable.fields[0].records[i].value;

        if (setl === selectedSetl) {
          const plyl = this.$options.plylTable.fields[1].records[i].value;
          const name = this.$options.plylTable.fields[6].records[i].value;
          
          this.plays.push({
            'name': name.trim(),
            'plyl': plyl,
            'plylRecord': i
          });
        }
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
      this.$emit('hide-playbook-view');
    }
  }
}
</script>

