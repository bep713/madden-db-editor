<template>
  <div id="madden-table-data-wrapper" class="madden-table-data-wrapper" ref="wrapper">
    <p class="empty-message" v-if="!tableHasData && tableLoaded">The selected table is empty.</p>
    <p class="empty-message" v-if="tableHasData && !tableShowingData">There are no visible items, possibly due to active filters. Try removing some to see data here.</p>
    <div class="loader-wrapper" ref="loadingSpinner">
      <div class="loader"></div>
      <div class="underlay"></div>
    </div>
    <div class="hot-container" ref="hotContainer" v-bind:class="{'soft-hide': !tableHasData || !tableShowingData}"></div>
    <!-- <hot-table v-if="tableLoaded" :settings="settings" ref="hotTableComponent" @contextmenu.prevent="test" class="hot-table"></hot-table> -->
    <div class="notes-input-wrapper" v-show="showNotesInput" v-bind:style="{ top: notesPosition.top + 'px', left: notesPosition.left + 'px' }" ref="notesWrapper">
      <div class="notes-header">Add note</div>
      <span class="close-icon" @click="closeNotesInput">X</span>
      <div class="inputs-wrapper">
        <input type="text" class="notes-input" ref="notesInput" @keyup.enter="saveNote" />
        <button class="btn-save-input" @click="saveNote">Save</button>
      </div>
    </div>
    <!-- <div class="loading-spinner" v-if="tableIsLoading"></div> -->
  </div>
</template>

<style src="../../../node_modules/handsontable/dist/handsontable.full.css"></style>
<style src="../assets/madden-table-data.css"></style>

<script>
import Vue from 'vue';
import { HotTable } from '@handsontable/vue';
import Handsontable from 'handsontable';
import { ipcRenderer } from 'electron';

import HexReader from '../utils/HexReader';
import FieldTypes from '../utils/FieldTypeEnum';
import FilterOperatorEnum from '../utils/FilterOperatorEnum';
import TempDbUtil from '../utils/TempDbUtil';

import path from 'path';
import fs from 'fs';

export default {
  name: 'MaddenTableData',
  props: ['selectedTable', 'deselectCell', 'filters'],
  components: {
    HotTable
  },
  data: function () {
    return {
      width: 0,
      height: 0,
      hotRef: null,
      showNotesInput: false,
      notes: [],
      notesPosition: {
        top: 0,
        left: 0
      },
      tableLoaded: false,
      tableHasData: false,
      settings: {
        rowHeaders: true,
        width: this.width,
        height: this.height,
        manualColumnResize: true,
        rowHeights: 25,
        manualRowResize: true,
        viewportRowRenderingOffset: 100,
        // stretchH: 'all',
        currentRowClassName: 'active-row',
        comments: true,
        // init: function () {
          // setTimeout(function () {
            // if (this.selectedTable) {
              // this.setTableData(this.selectedTable);
            // }
          // }.bind(this), 100)
        // }.bind(this),
        afterChange: this.processChanges,
        columnSorting: true,
        contextMenu: {
          items: {
            'filters': {
              name: 'Filters...',
              submenu: {
                items: [
                  {
                    key: "filters:global-filter",
                    name: 'Add global filter with this value',
                    callback: function() {
                      const columnHeader = this.getSelectedCellColumnHeader();
                      const cellValue = this.getSelectedCellValues()[0];
                      
                      const filter = {
                        column: columnHeader,
                        operator: FilterOperatorEnum.EQUALS,
                        value: cellValue.toString(),
                        tables: ['All Tables']
                      };

                      this.$emit('new-filter-from-table-data', filter)
                    }.bind(this),
                    disabled: function () {
                      const columnHeader = this.getSelectedCellColumnHeader();
                      const cellValue = this.getSelectedCellValues();

                      return this.filterExists(columnHeader, cellValue) || this.getUniqueValuesFromArray(cellValue).length > 1 || this.areMultipleColumnsSelected();
                    }.bind(this)
                  },
                  {
                    key: "filters:table-filter",
                    name: 'Add filter to this table only (won\'t affect other tables)',
                    callback: function() {
                      const columnHeader = this.getSelectedCellColumnHeader();
                      const cellValue = this.getSelectedCellValues()[0];
                      
                      const filter = {
                        column: columnHeader,
                        operator: FilterOperatorEnum.EQUALS,
                        value: cellValue.toString(),
                        tables: [this.selectedTable]
                      };

                      this.$emit('new-filter-from-table-data', filter)
                    }.bind(this),
                    disabled: function () {
                      const columnHeader = this.getSelectedCellColumnHeader();
                      const cellValue = this.getSelectedCellValues();

                      return this.filterExists(columnHeader, cellValue) || this.getUniqueValuesFromArray(cellValue).length > 1 || this.areMultipleColumnsSelected();
                    }.bind(this)
                  },
                  {
                    key: 'filters:remove-filter',
                    name: 'Remove all filters with this value',
                    callback: function () {
                      const columnHeader = this.getSelectedCellColumnHeader();
                      const cellValue = this.getSelectedCellValues()[0];

                      const filter = {
                        column: columnHeader,
                        operator: FilterOperatorEnum.EQUALS,
                        value: cellValue.toString(),
                        tables: ['All Tables']
                      };

                      this.$emit('remove-filter-from-table-data', filter);
                    }.bind(this),
                    disabled: function () {
                      const columnHeader = this.getSelectedCellColumnHeader();
                      const cellValue = this.getSelectedCellValues();

                      return !(this.filterExists(columnHeader, cellValue)) || this.getUniqueValuesFromArray(cellValue).length > 1 || this.areMultipleColumnsSelected();
                    }.bind(this)
                  },
                  {
                    key: 'filters:add-mass-filter',
                    name: 'Add a global filter with these unique values',
                    callback: function () {
                      const uniqueCellValues = this.getUniqueValuesFromArray(this.getSelectedCellValues());
                      const columnHeader = this.getSelectedCellColumnHeader();

                      const filter = {
                        column: columnHeader,
                        operator: FilterOperatorEnum.IN,
                        value: uniqueCellValues.join(),
                        tables: ['All Tables']
                      };

                      this.$emit('new-filter-from-table-data', filter);
                    }.bind(this),
                    disabled: function () {
                      const uniqueCellValues = this.getUniqueValuesFromArray(this.getSelectedCellValues());
                      return !(this.areMultipleCellsSelected()) || this.areMultipleColumnsSelected() || uniqueCellValues.length <= 1;
                    }.bind(this)
                  }
                ]
              }
            },
            "notes": {
              name: 'Notes...',
              submenu: {
                items: [
                  {
                    key: 'notes:add-note',
                    name: 'Add/Edit a global note for this value',
                    callback: function () {                      
                      const selectedCellCoordinates = this.getSelectedCellCoordinates();
                      const selectedCell = this.hotRef.getCell(selectedCellCoordinates[0], selectedCellCoordinates[1]);

                      const cellPosition = selectedCell.getBoundingClientRect();

                      this.notesPosition.top = cellPosition.top + cellPosition.height;
                      this.notesPosition.left = cellPosition.left;

                      this.showNotesInput = true;

                      setTimeout(function () {
                        const rootRectWidth = this.hotRef.rootElement.getBoundingClientRect().width;
                        const notesWidth = parseInt(getComputedStyle(this.$refs.notesWrapper).width, 10);

                        if (this.notesPosition.left + notesWidth > rootRectWidth) {
                          this.notesPosition.left = (rootRectWidth - notesWidth);
                        }
                      }.bind(this), 10);

                      const selectedCellMeta = this.hotRef.getCellMeta(selectedCellCoordinates[0], selectedCellCoordinates[1]);

                      this.$refs.notesInput.setAttribute('data-record-number', selectedCellMeta.recordNumber);
                      this.$refs.notesInput.setAttribute('data-cell-x', selectedCellCoordinates[0]);
                      this.$refs.notesInput.setAttribute('data-cell-y', selectedCellCoordinates[1]);

                      if (selectedCellMeta.comment) {
                        this.$refs.notesInput.value = selectedCellMeta.comment.value;
                      }
                      else {
                        this.$refs.notesInput.value = '';
                      }

                      this.hotRef.deselectCell();

                      setTimeout(function () {
                        this.$refs.notesInput.focus();
                      }.bind(this), 100);
                    }.bind(this)
                  },
                  {
                    key: 'notes:remove-note',
                    name: 'Remove global note for this value',
                    callback: function () {
                      this.removeNote();
                    }.bind(this),
                    disabled: function () {
                      return this.getSelectedCellNoteIndex() === -1;
                    }.bind(this)
                  }
                ]
              }
            }
          },
        }
      }
    }
  },

  mounted () {
    this.width = this.$refs.wrapper.offsetWidth;
    this.height = this.$refs.wrapper.offsetHeight;

    // const hot = this.$refs.hotTableComponent.hotInstance;
    // this.hotRef = hot;

    // hot.updateSettings({
    //   width: this.width,
    //   height: this.height
    // });

    window.addEventListener('resize', this.onResize);

    ipcRenderer.on('undo', function (event, arg) {
      this.hotRef.undo();
    }.bind(this));

    ipcRenderer.on('redo', function (event, arg) {
      this.hotRef.redo();
    }.bind(this));

    ipcRenderer.on('select-all', function (event, arg) {
      this.hotRef.selectCell(0, 0, this.hotRef.countRows() - 1, this.hotRef.countCols() - 1);
    }.bind(this));
  },

  destroyed() {
    window.removeEventListener('resize', this.onResize);

    const listeningEvents = ['undo', 'redo', 'select-all'];

    listeningEvents.forEach((event) => {
      ipcRenderer.removeAllListeners(event);
    });
  },

  computed: {
    tableShowingData: function () {
      if (this.hotRef) {
        return this.hotRef.getData().length > 0;
      }

      return true;
    }
  },

  tableData: null,
  
  watch: {
    selectedTable: function (data) {
      if (data) {
        this.showLoadingSpinner(true);

        setTimeout(function () {
          this.loadTable(data);
        }.bind(this), 10);
      }
    },

    deselectCell: function () {
      this.hotRef.deselectCell();
    },

    filters: function () {
      this.setTableData(this.$options.tableData);
    },

    notes: function () {
      this.addNotesAsComments();
    }
  },

  methods: {
    loadTable: function (data) {
      this.$options.tableData = TempDbUtil.getTable(data);
      this.tableHasData = this.$options.tableData && this.$options.tableData.fields[0].records.length > 0;
      this.setTableData(this.$options.tableData, true);
    },

    showLoadingSpinner: function (show) {
      if (show) {
        this.$refs.loadingSpinner.classList.remove('hide');
      } else {
        this.$refs.loadingSpinner.classList.add('hide');
      }
    },

    setTableData: function (data, instantiate = false) {
      let numFiltersThatApply = 0;

      const filteredRowNumbersArrays = this.filters.map((filter) => {
        const filterAppliesToTable = filter.tables.find((applicableTable) => { return applicableTable === data.definition.name || applicableTable === 'All Tables'; }) !== undefined;

        if (filterAppliesToTable) {
          const field = data.fields.find((field) => { return field.name.toLowerCase() === filter.column.toLowerCase(); });

          if (field) {
            numFiltersThatApply += 1;
            return field.records.filter((record) => {
              switch(filter.operator) {
                case FilterOperatorEnum.EQUALS:
                  return record.value.toString() === filter.value;
                case FilterOperatorEnum.NOT_EQUALS:
                  return record.value.toString() !== filter.value;
                case FilterOperatorEnum.IN:
                  const options = filter.value.split(',');
                  return options.find((option) => { return option === record.value.toString(); });
                case FilterOperatorEnum.LESS_THAN:
                  return record.value < parseFloat(filter.value);
                case FilterOperatorEnum.LESS_THAN_OR_EQUAL:
                  return record.value <= parseFloat(filter.value);
                case FilterOperatorEnum.GREATER_THAN:
                  return record.value > parseFloat(filter.value);
                case FilterOperatorEnum.GREATER_THAN_OR_EQUAL:
                  return record.value >= parseFloat(filter.value);
                case FilterOperatorEnum.CONTAINS:
                  return record.value.toString().includes(filter.value);
                case FilterOperatorEnum.NOT_CONTAINS:
                  return !(record.value.toString().includes(filter.value));
                case FilterOperatorEnum.STARTS_WITH:
                  return record.value.toString().startsWith(filter.value);
                case FilterOperatorEnum.ENDS_WITH:
                  return record.value.toString().endsWith(filter.value);
                default:
                  return true;
              }
            }).map((record) => { 
              return record.recordNumber; 
            });
          }
        }

        return null;
      });

      let rowNumbersToShow = [];

      if (numFiltersThatApply > 0) {
        filteredRowNumbersArrays.forEach((arr) => {
          if (arr) {
            rowNumbersToShow.push(...arr);
          }
        });

        rowNumbersToShow = rowNumbersToShow.reduce(function (acc, curr) {
          if (typeof acc[curr] == 'undefined') {
            acc[curr] = 1;
          } else {
            acc[curr] += 1;
          }

          return acc;
        }, {});

        rowNumbersToShow = Object.keys(rowNumbersToShow).filter((rowNumber) => {
          return rowNumbersToShow[rowNumber] === numFiltersThatApply;
        });
      }
      else {
        for (let i = 0; i < data.fields[0].records.length; i++) {
          rowNumbersToShow.push(i);
        }
      }

      let tableData = [];
      let tableMetadata = [];

      rowNumbersToShow.forEach((rowNumber) => {
        let row = [];
        let rowMeta = [];

        for (let j = 0; j < data.fields.length; j++) {
          row.push(data.fields[j].records[rowNumber].value);
          rowMeta.push({
            col: j,
            recordNumber: data.fields[j].records[rowNumber].recordNumber
          });
        }

        tableData.push(row);
        tableMetadata.push(rowMeta);
      });

      if (instantiate) {
        const tableHeaders = data.fields.map((field) => {
          return field.name;
        });

        this.settings.colHeaders = tableHeaders;
        this.settings.data = tableData;

        const HotClass = Vue.extend(HotTable);
        const instance = new HotClass({
          propsData: {
            settings: this.settings
          }
        });

        instance.$mount();
        
        while (this.$refs.hotContainer.firstChild) {
          this.$refs.hotContainer.removeChild(this.$refs.hotContainer.firstChild);
        }

        this.$refs.hotContainer.appendChild(instance.$el);
        this.hotRef = instance.hotInstance;
      }
      else {
        if (this.hotRef) {
          this.hotRef.loadData(tableData);
        }
      }

      this.tableLoaded = true;
      this.showLoadingSpinner(false);

      this.hotRef.selectCell(0, 0);

      tableMetadata.forEach((meta, index) => {
        meta.forEach((cell) => {
          const cellValue = this.hotRef.getDataAtCell(index, cell.col);
          this.hotRef.setCellMeta(index, cell.col, 'recordNumber', cell.recordNumber);

          const note = this.notes.find((note) => { return note.column.toLowerCase() === data.fields[cell.col].name.toLowerCase() && note.value === cellValue; });
          if (note) {
            this.hotRef.setCellMeta(index, cell.col, 'comment', {value: note.note, readOnly: true});
          }
        });
      });

      this.onResize();

      // if (!this.hotRef) {
      //   this.settings.colHeaders = tableHeaders;
      //   this.settings.data = tableData;
      //   this.tableLoaded = true;

      //   const HotClass = Vue.extend(HotTable);
      //   const instance = new HotClass({
      //     propsData: {
      //       settings: this.settings
      //     }
      //   });

      //   instance.$mount();
      //   this.$refs.hotContainer.appendChild(instance.$el);
      //   this.hotRef = instance.hotInstance;
      //   this.onResize();
      // }
      // else {
      //   this.hotRef.loadData(tableData);
      // }
    },

    getData: function () {
      return this.hotRef.getData();
    },

    search: function () {
      const search = this.hotRef.getPlugin('search');
      const results = search.query('11');
      
      this.hotRef.render();

      const htDataRows = document.querySelectorAll('.ht_master .htCore tbody > tr');

      results.forEach((result) => {
        if (result.col === 3) {
          
        }
      })
    },

    processChanges: function (changes) {
      if (changes) {
        
        const changesWithMeta = changes.map(function ([row, prop, oldValue, newValue]) {
          const meta = this.hotRef.getCellMeta(row, prop);
          
          return {
            recordNumber: meta.recordNumber, 
            column: prop, 
            value: newValue
          };
        }.bind(this));

        // const selectedTableIndex = this.tables.findIndex((table) => { table.definition.name === this.selectedTable });

        changesWithMeta.forEach((change) => {
          const field = this.$options.tableData.fields[change.column];

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

          this.$options.tableData.fields[change.column].records[change.recordNumber].value = value;
        });
        
        // Vue.set(this.tables, selectedTableIndex, this.selectedTable);

        const fileChanges = changesWithMeta.map((change) => {
          return {
            fieldType: this.$options.tableData.fields[change.column].type,
            fieldOffset: this.$options.tableData.fields[change.column].offset,
            fieldBits: this.$options.tableData.fields[change.column].bits,
            record: this.$options.tableData.fields[change.column].records[change.recordNumber]
          }
        });

        ipcRenderer.send('write-records', {
          dataStart: this.$options.tableData.header.dataStart,
          lenBytes: this.$options.tableData.header.lenBytes,
          changes: fileChanges
        });

        TempDbUtil.writeTable(this.selectedTable, this.$options.tableData);
      }
    },

    onResize: function () {
      this.width = this.$refs.wrapper.offsetWidth;
      this.height = this.$refs.wrapper.offsetHeight;

      this.hotRef.updateSettings({
        width: this.width,
        height: this.height
      });
    },

    getSelectedCellColumnHeader: function () {
      const cellCoords = this.getSelectedCellCoordinates();
      const cellMeta = this.hotRef.getCellMeta(cellCoords[0], cellCoords[1]);
      return this.hotRef.getColHeader(cellMeta.col);
    },
    
    getSelectedCellCoordinates: function () {
      return this.hotRef.getSelected()[0];
    },

    areMultipleCellsSelected: function () {
      const coordinates = this.getSelectedCellCoordinates();
      return !(coordinates[0] === coordinates[2] && coordinates[1] === coordinates[3]);
    },

    areMultipleColumnsSelected: function () {
      const coordinates = this.getSelectedCellCoordinates();
      return !(coordinates[1] === coordinates[3]);
    },

    getSelectedCellValues: function () {
      const cellCoords = this.getSelectedCellCoordinates();

      let cellValues = [];
      let lowerBound = cellCoords[0] < cellCoords[2] ? cellCoords[0] : cellCoords[2];
      let upperBound = lowerBound === cellCoords[0] ? cellCoords[2] : cellCoords[0];

      for (let i = lowerBound; i <= upperBound; i++) {
        cellValues.push(this.hotRef.getDataAtCell(i, cellCoords[1]));  
      }

      return cellValues;
    },

    filterExists: function (columnHeader, cellValue) {
      return this.filters.filter((filter) => {
        return filter.column === columnHeader && filter.value === cellValue.toString() 
        && filter.tables.filter((table) => { return table === 'All Tables' || table === this.selectedTable; }).length > 0;
      }).length > 0;
    },

    getUniqueValuesFromArray: function (arr) {
      return [...new Set(arr)];
    },

    saveNote: function () {
      const noteText = this.$refs.notesInput.value;
      const recordNumber = this.$refs.notesInput.dataset.recordNumber;
      const cellX = this.$refs.notesInput.dataset.cellX;
      const cellY = this.$refs.notesInput.dataset.cellY;

      const column = this.hotRef.getColHeader(cellY);
      const value = this.hotRef.getDataAtCell(cellX, cellY);

      const noteInArrayIndex = this.notes.findIndex((note) => { return note.column === column && note.value === value; });
      const note = {
        recordNumber: recordNumber,
        column: column,
        value: value,
        note: noteText
      };

      if (noteInArrayIndex >= 0) {
        Vue.set(this.notes, noteInArrayIndex, note);
      }
      else {
        this.notes.push(note);
      }

      this.showNotesInput = false;
    },

    getSelectedCellNoteIndex: function () {
      const cellHeader = this.getSelectedCellColumnHeader();
      const cellValue = this.getSelectedCellValues()[0];

      const noteIndex = this.notes.findIndex((note) => { return note.column.toLowerCase() === cellHeader.toLowerCase() && note.value === cellValue; });
      return noteIndex;
    },

    removeNote: function () {
      const noteIndex = this.getSelectedCellNoteIndex();

      if (noteIndex >= 0) {
        Vue.delete(this.notes, noteIndex);
      }
    },

    addNotesAsComments: function () {
      this.setTableData(this.$options.tableData);
    },

    closeNotesInput: function () {
      this.showNotesInput = false;
    }
  }
}
</script>