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

<style lang="scss">
$breakpoint-lg: 992px;
$breakpoint-xlg: 1400px;

.main-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;

  @media(min-width: $breakpoint-lg) {
    padding: 20px;
  }
}

.not-playbook-message {
  padding: 10px;

  @media(min-width: $breakpoint-lg) {
    padding: 20px;
  }
}

.main-header {
  margin: 0;
  font-size: 1.2em;

  @media(min-width: $breakpoint-xlg) {
    font-size: 1.5em;
  }
}

.back-to-db-editor {
  color: #0b7abf;
  cursor: pointer;

  &:hover {
    color: darken(#0b7abf, 15%);
  }
}

.tables-wrapper {
  padding: 10px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  grid-template-columns: minmax(175px, 1fr) minmax(175px, 1fr) 1fr 1fr;
  grid-gap: 10px;
  height: calc(100vh - 45px);
  background: #eee;

  @media(min-width: $breakpoint-lg) {
    padding: 20px;
    grid-gap: 20px;
    height: calc(100vh - 65px);
  }

  @media(min-width: $breakpoint-xlg) {
    height: calc(100vh - 72px);
  }
}

.span-all-rows {
  grid-row-start: span 4;
  
  .table {
    max-height: calc(100% - 31px);
    overflow-y: auto;
  }
}

.poso-table-wrapper {
  grid-row-start: span 2;

  .table {
    display: grid;
    grid-template-columns: 1fr;
    max-height: calc(100% - 31px);
    overflow-y: auto;

    @media(min-width: $breakpoint-xlg) {
      grid-template-columns: 1fr 1fr;
      grid-gap: 5px;
    }

    .table-item {
      + .table-item {
        @media(min-width: $breakpoint-xlg) {
          border-top: 1px solid #d1d1d1; 
        }
      }
    }
  }
}

.playbook-view-wrapper {
  .loader-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1040;
  }

  .underlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.15);
  }
}

.loader,
.loader:after {
  border-radius: 50%;
  width: 10em;
  height: 10em;
}
.loader {
  position: absolute;
  top: calc(50% - 75px);
  margin: 0 auto;
  font-size: 10px;
  position: relative;
  text-indent: -9999em;
  border-top: 1.1em solid rgba(0, 0, 0, 0.1);
  border-right: 1.1em solid rgba(0, 0, 0, 0.1);
  border-bottom: 1.1em solid rgba(0, 0, 0, 0.1);
  border-left: 1.1em solid #e98819;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
}
@-webkit-keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.table-wrapper {
  padding: 10px;
  background: #fbfbfb;

  @media(min-width: $breakpoint-lg) {
    padding: 20px;
  }
}

.table-header {
  margin: 0 0 10px 0;
}

.table-item {
  padding: 10px;
  font-size: 0.867em;
  border: 1px solid #d1d1d1;

  @media(min-width: $breakpoint-xlg) {
    padding: 15px;
    font-size: 1em;
  }
  
  &:hover, &.active {
    background: #d1d1d1;
    cursor: pointer;
  }

  + .table-item {
    border-top: none;
  }
}
</style>

<script>
import PositionData from '../utils/PositionData';
import fs from 'fs';
import TempDbUtil from '../utils/TempDbUtil';

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
        this.parseTableFromFile('static/FORM.json', 'formationsTable');
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
  formationsTable: null,
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

