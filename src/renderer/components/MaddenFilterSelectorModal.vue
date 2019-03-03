<template>
  <div class="filter-modal modal" v-on:click="closeFilterModal">
      <div class="hover-show-background" v-on:click="stopPropagation">Put mouse here to show table data</div>
      <div class="filter-modal-main modal-main" v-on:click="stopPropagation">
        <h2 class="modal-help-text">Filters</h2>
        <span class="close-modal" v-on:click="closeFilterModal">X</span>
        <div class="filter-main">
          <div class="new-filter filter-grid">
            <multiselect v-model="newFilterColumn" :options="allColumnOptions" :preselect-first="true" :allowEmpty="false" placeholder="Select column"></multiselect>
            <multiselect v-model="newFilterOperator" :options="getApplicableOperatorOptions(newFilterColumn)" :preselect-first="true" :allowEmpty="false" placeholder="Select operator"></multiselect>
            <input type="text" v-model="newFilterValue" class="filter-value-input filter-input" @keyup.enter="addNewFilter" />
            <multiselect class="filter-select-table" v-model="newFilterTable" :options="allTableOptions" :multiple="true" :close-on-select="false" 
              :preselect-first="true" :allowEmpty="false" placeholder="Select tables"></multiselect>
            <button v-on:click="addNewFilter" class="add-filter-button filter-input filter-button">Add filter</button>
          </div>
          <h3 class="active-filter-header">Active Filters</h3>
          <div class="active-filters">
            <div class="filter-grid" v-for="filter in allFilters" v-bind:key="filter.id">
              <multiselect v-model="filter.column" :options="allColumnOptions" :preselect-first="true" :allowEmpty="false" 
                @input="updateFilter(filter)" placeholder="Select column" ></multiselect>
              <multiselect v-model="filter.operator" :options="getApplicableOperatorOptions(filter.column)" :preselect-first="true" :allowEmpty="false"
                @input="updateFilter(filter)" placeholder="Select operator"></multiselect>
              <input type="text" v-model="filter.value" @input="showSaveFilterButton(filter)" @change="updateFilter(filter)" class="filter-value-input filter-input" />
              <multiselect class="filter-select-table" v-model="filter.tables" :options="allTableOptions" :multiple="true" :close-on-select="false" 
                :preselect-first="true" :allowEmpty="false" @input="updateFilter(filter)" placeholder="Select tables"></multiselect>
              <button v-on:click="removeFilter(filter)" class="remove-filter-button filter-input filter-button" v-show="!filter.filterUpdatePending">Remove</button>
              <button v-on:click="updateFilter(filter)" class="add-filter-button filter-input filter-button" v-if="filter.filterUpdatePending">Save changes</button>
            </div>
            <div v-if="allFilters.length === 0" class="no-filter-added-text">
              <span>No filters added</span>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style src="../assets/multiselect-overrides.scss"></style>
<style src="../assets/madden-filter-selector-modal.scss"></style>

<script>
import Vue from 'vue';
import Multiselect from 'vue-multiselect';
import FieldTypeEnum from '../utils/FieldTypeEnum';
import TempDbUtil from '../utils/TempDbUtil';
import fs from 'fs';

export default {
  name: 'MaddenFilterSelectorModal',
  props: ['tables', 'selectedTable', 'allFilters'],
  components: {
    Multiselect
  },

  data () {
    return {
      tableSelectorText: '',
      selectedIndex: 0,
      newFilterColumn: '',
      newFilterOperator: '',
      newFilterValue: '',
      newFilterTable: '',
      allOperatorOptions: ['equals', 'doesn\'t equal', 'contains', 'doesn\'t contain', 'starts with', 'ends with'],
      activeFilters: []
    }
  },

  tableData: null,

  computed: {
    allColumnOptions: function () {
      let selectedTableColumns = [];

      this.$options.tableData = TempDbUtil.getTable(this.selectedTable);

      this.$options.tableData.fields.forEach((field) => {
        selectedTableColumns.push(field.name);
      });

      const otherTables = this.tables.filter((table) => { return table.definition.name !== this.selectedTable; });
      let otherTableColumns = [];

      // otherTables.forEach((table) => {
      //   table.fields.forEach((field) => {
      //     let fieldDoesntExist = !(otherTableColumns.find((col) => { return col.toLowerCase() === field.name.toLowerCase() }) 
      //       || selectedTableColumns.find((col) => { return col.toLowerCase() === field.name.toLowerCase() }));

      //     if (fieldDoesntExist) {
      //       otherTableColumns.push(field.name);
      //     }
      //   });
      // });

      // const sortedOtherTableColumns = otherTableColumns.sort();
      // return [...selectedTableColumns, ...sortedOtherTableColumns];
      return selectedTableColumns;
    },

    allTableOptions: function () {
      let tableOptions = ['All Tables'];

      if (this.selectedTable) {
        tableOptions.push(this.selectedTable);
      }

      const otherTables = this.tables.filter((table) => { return table.definition.name !== this.selectedTable; });

      let otherTableNames = otherTables.map((table) => { return table.definition.name; });
      tableOptions.push(...otherTableNames);

      return tableOptions;
    }
  },

  watch: {
    newFilterColumn: function (newFilterColumnValue) {
      this.allOperatorOptions = this.getApplicableOperatorOptions(newFilterColumnValue);

      const selectedOperatorNotInAllOptions = this.allOperatorOptions.filter((option) => { return option === this.newFilterOperator; }).length === 0;

      if (selectedOperatorNotInAllOptions) {
        this.newFilterOperator = this.allOperatorOptions[0];
      }
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onKeydown);
  },

  destroyed () {
    window.removeEventListener('keydown', this.onKeydown);
  },

  methods: {
    selectTable: function (table) {
      this.$emit('selected', table);
    },

    closeFilterModal: function () {
      this.$emit('closed');
    },

    stopPropagation: function (e) {
      e.stopPropagation();
      e.preventDefault();
    },

    chooseModalOption: function (option) {
      this.selectTable(option.ref);
      this.closeTableModal();
    },

    clearSelectedOptions: function () {
      if (this.showModalOptions) {
        let options = this.$refs.modalOptions.querySelectorAll('div');
        options.forEach((option) => {
          option.classList.remove('active');
        });
      }
    },

    selectOptionAtIndex: function (index) {
      if (this.showModalOptions) {
        let options = this.$refs.modalOptions.querySelectorAll('div');
        options[index].classList.add('active');
      }
    },

    addNewFilter: function () {
      const id = this.allFilters.length > 0 ? this.allFilters[this.allFilters.length - 1].id + 1 : 0;

      if (this.newFilterColumn && this.newFilterOperator && this.newFilterValue && this.newFilterTable.length > 0) {
        const filter = {
          id: id,
          column: this.newFilterColumn,
          operator: this.newFilterOperator,
          value: this.newFilterValue,
          tables: this.newFilterTable,
          filterUpdatePending: false,
          filterUpdateOriginalValue: this.newFilterValue
        };

        this.$emit('new-filter', filter);
      }
    },

    updateFilter: function (filter) {
      this.$emit('update-filter', filter);

      filter.filterUpdatePending = false;
      filter.filterUpdateOriginalValue = filter.value;
    },

    removeFilter: function (filter) {
      filter.filterUpdatePending = false;
      this.$emit('remove-filter', filter);
    },

    resetNewFilterValuesToDefault: function () {
      // this.newFilterColumn = '',
      // this.newFilterOperator = '<';
      // this.newFilterValue = '';
      // this.newFilterTable = 'All';
    },

    getApplicableOperatorOptions: function (column) {
      if (column) {
        const fieldType = this.$options.tableData.fields.find((field) => { return field.name === column; });
        
        switch(fieldType) {
          case FieldTypeEnum.STRING:
            return ['equals', 'doesn\'t equal', 'equals one of', 'contains', 'doesn\'t contain', 'equals one of', 'starts with', 'ends with'];
          default:
            return ['equals', 'doesn\'t equal', 'equals one of', 'is less than', 'is greater than', 'is greater than or equal to', 'is less than or equal to', 'contains', 'doesn\'t contain', 'starts with', 'ends with'];
        }
      }

      return [];
    },

    showSaveFilterButton: function (filter) {
      if (filter.filterUpdatePending && filter.filterUpdateOriginalValue === filter.value) {
        filter.filterUpdatePending = false;
      }
      else if (!filter.filterUpdatePending) {
        filter.filterUpdatePending = true;
      }
    },

    onKeydown: function (e) {
      if (e.key === 'Escape') {
        this.closeFilterModal();
      }
    }
  }
}
</script>
