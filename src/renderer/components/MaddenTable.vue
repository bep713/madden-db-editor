<template>
  <div class="madden-table-wrapper">
    <div class="table-data" ref="tableData">
      <MaddenTableData v-bind:selectedTable="selectedTable" v-bind:deselectCell="deselectCell" v-bind:filters="allFilters"
        v-if="tables.length > 0" @cellsChanged="onCellsChanged" @new-filter-from-table-data="onTableDataFilterAdded" 
        @remove-filter-from-table-data="onTableDataFilterRemoved" v-bind:class="{ 'soft-hide': playbookViewShown }"></MaddenTableData>
      <MaddenWelcome v-bind:recentFiles="recentFiles" v-show="tables.length === 0"></MaddenWelcome>
      <MaddenPlaybookView class="madden-playbook-view" v-show="tables.length > 0 && playbookViewShown" :fileLoaded="fileLoaded"
        :resetPlaybookView="resetPlaybookView" @hide-playbook-view="onHidePlaybookView"></MaddenPlaybookView>
    </div>
    <div class="header-tab-wrapper" v-if="!playbookViewShown">
      <div class="header-tab-content" ref="headerTabContent">
        <MaddenTableHeader v-for="table in tables" v-bind:key="table.definition.name" v-bind:table="table" @selected="selectTable(table)"
          v-bind:isActive="selectedTable && selectedTable === table.definition.name"></MaddenTableHeader>
      </div>
    </div>
    <MaddenTableSelectorModal v-bind:tables="tables" v-if="isTableModalOpen" @selected="onTableModalSelected" @closed="onTableModalClosed"></MaddenTableSelectorModal>
    <MaddenFilterSelectorModal v-bind:tables="tables" v-bind:selectedTable="selectedTable" v-bind:allFilters="allFilters" v-if="isFilterModalOpen"
      @closed="onFilterModalClosed" @new-filter="onFilterAdded" @remove-filter="onFilterRemoved" @update-filter="onFilterUpdated"></MaddenFilterSelectorModal>
  </div>
</template>

<style src="../assets/madden-table.scss"></style>

<script>
import Vue from 'vue';
import { ipcRenderer, ipcMain } from 'electron';
import MaddenWelcome from './MaddenWelcome';
import MaddenTableData from './MaddenTableData';
import MaddenTableHeader from './MaddenTableHeader';
import MaddenTableSelectorModal from './MaddenTableSelectorModal';
import MaddenFilterSelectorModal from './MaddenFilterSelectorModal';
import MaddenPlaybookView from './MaddenPlaybookView';

import HexReader from '../utils/HexReader';
import FieldTypes from '../utils/FieldTypeEnum';

export default {
  name: 'MaddenTable',
  props: [],
  components: {
    MaddenWelcome: MaddenWelcome,
    MaddenTableData: MaddenTableData,
    MaddenTableHeader: MaddenTableHeader,
    MaddenPlaybookView: MaddenPlaybookView,
    MaddenTableSelectorModal: MaddenTableSelectorModal,
    MaddenFilterSelectorModal: MaddenFilterSelectorModal
  },
  data () {
    return {
      selectedTable: null,
      isTableModalOpen: false,
      isFilterModalOpen: false,
      deselectCell: false,
      tables: [],
      recentFiles: [],
      fileLoadError: {},
      allFilters: [],
      playbookViewShown: false,
      resetPlaybookView: false,
      fileLoaded: false
    }
  },

  mounted() {
    ipcRenderer.on('load-file', function (event, arg) {
      this.closeFile();
      this.addToRecentFiles(arg);
      ipcRenderer.send('load-file', arg);
      this.fileLoaded = false;
    }.bind(this)); 

    ipcRenderer.on('read-error', function (event, arg) {
      this.closeFile();
      this.removeFromRecentFiles(arg.filePath);
    }.bind(this));

    ipcRenderer.on('table-header', function (event, arg) {
      arg.isLoading = true;
      this.tables.push(arg);
    }.bind(this));

    // ipcRenderer.on('table-data', function (event, arg) {
    //   const tableIndex = this.tables.findIndex((table) => { return table.definition.name === arg.definition.name });
      
    //   if (tableIndex >= 0) {
    //     Vue.set(this.tables, tableIndex, arg);
    //   }

    //   if (!this.selectedTable) {
    //     this.selectedTable = arg;
    //   }
    // }.bind(this));

    // ipcRenderer.on('table-field', function (event, arg) {
    //   const tableIndex = this.tables.findIndex((table) => { return table.definition.name === arg.tableName });
    //   this.tables[tableIndex].fields.push(arg.field);
    // }.bind(this));

    ipcRenderer.on('table-done', function (event, arg) {
      const tableIndex = this.tables.findIndex((table) => { return table.definition.name === arg });
      this.tables[tableIndex].isLoading = false;

      if (!this.selectedTable) {
        this.selectedTable = arg;
        // ipcRenderer.send('get-table-data', {
          // 'name': this.tables[tableIndex].definition.name
        // });

        // this.selectedTable = this.tables[tableIndex];
      }
    }.bind(this));

    ipcRenderer.on('close-file', function (event, arg) {
      this.closeFile();
      ipcRenderer.send('close-file');
    }.bind(this));

    ipcRenderer.on('reveal-in-explorer', function (event, arg) {
      ipcRenderer.send('reveal-in-explorer');
    });

    ipcRenderer.on('save', function (event, arg) {
      if (this.tables.length > 0) {
        if (arg && arg.length > 0) {
          this.saveFileAs(arg);
        }
        else {
          this.saveFile([]);
        }
      }
    }.bind(this));

    ipcRenderer.on('show-filter-window', function (event, arg) {
      this.toggleFilterWindow();
    }.bind(this));

    ipcRenderer.on('clear-all-filters', function (event, arg) {
      this.allFilters = [];
    }.bind(this));

    ipcRenderer.on('show-playbook-view', function (event, arg) {
      this.playbookViewShown = !this.playbookViewShown;
    }.bind(this));

    ipcRenderer.on('read-done', function (event, arg) {
      this.tables.forEach((table) => {
        table.isLoading = false;
      });

      this.fileLoaded = true;
    }.bind(this));

    ipcRenderer.on('restore', function (event, arg) {
      ipcRenderer.send('restore');
    });

    window.addEventListener('keydown', this.onKeydown);
  },
  
  destroyed () {
    const listeningEvents = ['load-file', 'read-error', 'table-header', 'table-data', 'table-record', 'table-done', 'close-file', 
      'reveal-in-explorer', 'save', 'show-filter-window', 'clear-all-filters'];

    listeningEvents.forEach((event) => {
      ipcRenderer.removeAllListeners(event);
    });

    window.removeEventListener('keydown', this.onKeydown);
  },

  computed: {
    isModalOpen: function () {
      return this.isTableModalOpen || this.isFilterModalOpen;
    },

    // formationsTable: function () {
    //   const formTable = this.tables.find((table) => { return table.definition.name === 'FORM'});
    //   if (formTable && !formTable.isLoading) {
    //     return formTable;
    //   }

    //   return null;
    // },

    // setTable: function () {
    //   const setTable = this.tables.find((table) => { return table.definition.name === 'SETL'});
    //   if (setTable && !setTable.isLoading) {
    //     return setTable;
    //   }

    //   return null;
    // },

    // playTable: function () {
    //   const playTable = this.tables.find((table) => { return table.definition.name === 'PLYL'});
    //   if (playTable && !playTable.isLoading) {
    //     return playTable;
    //   }

    //   return null;
    // },

    // plrdTable: function () {
    //   const plrdTable = this.tables.find((table) => { return table.definition.name === 'PLRD'});
    //   if (plrdTable && !plrdTable.isLoading) {
    //     return plrdTable;
    //   }

    //   return null;
    // },

    // plysTable: function () {
    //   const plysTable = this.tables.find((table) => { return table.definition.name === 'PLYS'});
    //   if (plysTable && !plysTable.isLoading) {
    //     return plysTable;
    //   }

    //   return null;
    // }
  },

  methods: {
    selectTable: function (table) {
      if (!table.isLoading) {
        // console.time('select-table');
        this.selectedTable = table.definition.name;
        // console.timeEnd('select-table');
        // console.time('vue-binding');
      }
    },

    onTableModalSelected: function (table) {
      this.selectTable(table);
      this.closeTableModal();
    },

    onTableModalClosed: function () {
      this.closeTableModal();
    },

    onFilterModalClosed: function () {
      this.closeFilterModal();
    },

    onCellsChanged: function (data) {
      this.saveFile(data);
    },

    saveFile: function (data) {
      // const selectedTableIndex = this.tables.findIndex((table) => { table.definition.name === this.selectedTable });

      // data.forEach((change) => {
      //   const field = this.selectedTable.fields[change.column];

      //   let value;

      //   switch(field.type) {
      //     case FieldTypes.SINT:
      //     case FieldTypes.UINT:
      //     case FieldTypes.FLOAT:
      //       value = HexReader.toUint32(change.value);
      //       break;
      //     case FieldTypes.STRING:
      //     case FieldTypes.BINARY:
      //     default:
      //       value = change.value; 
      //       break;
      //   }

      //   this.selectedTable.fields[change.column].records[change.recordNumber].value = value;
      // });
      
      // Vue.set(this.tables, selectedTableIndex, this.selectedTable);

      // const fileChanges = data.map((change) => {
      //   return {
      //     fieldType: this.selectedTable.fields[change.column].type,
      //     fieldOffset: this.selectedTable.fields[change.column].offset,
      //     fieldBits: this.selectedTable.fields[change.column].bits,
      //     record: this.selectedTable.fields[change.column].records[change.recordNumber]
      //   }
      // });

      // ipcRenderer.send('write-records', {
      //   dataStart: this.selectedTable.header.dataStart,
      //   lenBytes: this.selectedTable.header.lenBytes,
      //   changes: fileChanges
      // });
    },

    saveFileAs: function (newFilePath) {
      ipcRenderer.send('write-records-new', {
        filePath: newFilePath,
        dataStart: this.selectedTable.header.dataStart,
        lenBytes: this.selectedTable.header.lenBytes,
        changes: []
      });
    },

    closeTableModal: function () {
      this.isTableModalOpen = false;
    },

    closeFilterModal: function () {
      this.isFilterModalOpen = false;
    },

    closeFile: function () {
      this.tables = [];
      this.selectedTable = null;
      this.resetPlaybookView = !this.resetPlaybookView;
    },

    addToRecentFiles: function (arg) {
      const indexInRecents = this.recentFiles.findIndex((file) => { return file.path === arg });

      if (indexInRecents >= 0) {
        Vue.set(this.recentFiles, indexInRecents, { path: arg, time: Date.now() });
      }
      else {
        this.recentFiles.push({
          path: arg,
          time: Date.now()
        });
      }
    },

    removeFromRecentFiles: function (arg) {
      const indexInRecents = this.recentFiles.findIndex((file) => { return file === arg });

      if (indexInRecents >= 0) {
        this.recentFiles.splice(indexInRecents, 1);
      }
    },

    onFilterAdded: function (filter) {
      const filterAlreadyExists = this.getFilterIndex(filter) >= 0;

      if (filterAlreadyExists) {
        this.onFilterUpdated(filter);  
      }
      else {
        this.allFilters.push(filter);
      }
    },

    getFilterIndex: function (filter) {
      return this.allFilters.findIndex((filterInList) => { 
        return filterInList.column === filter.column && filterInList.operator === filter.operator && filterInList.value === filter.value; 
      });
    },

    getFilter: function (filter) {
      return this.allFilters.find((filterInList) => { 
        return filterInList.column === filter.column && filterInList.operator === filter.operator && filterInList.value === filter.value; 
      });
    },

    onFilterRemoved: function (filter) {
      const filterIndex = this.allFilters.findIndex((filterInList) => { return filterInList.id === filter.id; });
      Vue.delete(this.allFilters, filterIndex);
    },

    onFilterUpdated: function (filter) {
      const existingFilterIndex = this.getFilterIndexById(filter.id);

      const existingFilter = this.allFilters[existingFilterIndex];

      const tablesToAdd = existingFilter.tables.filter((table) => {
        return filter.tables.find((existingTable) => { return existingTable === table; }) === undefined;
      });

      filter.tables.push(...tablesToAdd);

      if (existingFilterIndex >= 0) {
        Vue.set(this.allFilters, existingFilterIndex, filter);
      }
    },

    getFilterIndexById: function (id) {
      return this.allFilters.findIndex((filter) => { return filter.id === id; });
    },

    onTableDataFilterAdded: function (filter) {
      filter.id = this.allFilters.length > 0 ? this.allFilters[this.allFilters.length - 1].id + 1 : 0;
      this.onFilterAdded(filter);
    },

    onTableDataFilterRemoved: function (filter) {
      const existingFilter = this.getFilter(filter);

      if (existingFilter) {
        filter.id = existingFilter.id;
        this.onFilterRemoved(filter);
      }
    },

    onKeydown: function (e) {
      if (e.key === 'T' && e.ctrlKey && e.shiftKey) {
        if (!this.isModalOpen) {
          this.isTableModalOpen = true;
          this.deselectCell = !this.deselectCell;
        }
        else {
          if (this.isTableModalOpen) {
            this.closeTableModal();
          }
        }
      }
    },

    toggleFilterWindow: function () {
      if (!this.isModalOpen) {
        this.isFilterModalOpen = true;
        this.deselectCell = !this.deselectCell;
      }
      else {
        if (this.isFilterModalOpen) {
          this.closeFilterModal();
        }
      }
    },

    onHidePlaybookView: function () {
      this.playbookViewShown = false;
    }
  }
}
</script>