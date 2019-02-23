<template>
  <div class="table-selector-modal modal" v-on:click="closeTableModal">
      <div class="table-selector-modal-main modal-main" v-on:click="stopPropagation">
        <span class="modal-help-text">Go to table</span>
        <input class="table-selector-enter modal-enter" ref="modalEnter" v-model="tableSelectorText" />
        <span class="close-modal" v-on:click="closeTableModal">X</span>
      </div>
      <div class="table-selector-options modal-options" v-on:click="stopPropagation" v-show="showModalOptions" ref="modalOptions">
        <div class="table-selector-option modal-option" v-for="option in suggestionBoxOptions" v-bind:key="option.name" 
          v-on:click="chooseModalOption(option)" v-bind:class="{ active: option.isSelected }">
          {{ option.name }}
        </div>
      </div>
    </div>
</template>

<style lang="scss">
  $modal-background-color: #4b4b4b;
  $modal-selection-color: orange;
  $breakpoint-lg: 992px;

  .modal {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,0.2);
    z-index: 103;
  }

  .modal-main {
    margin: 0;
    padding: 20px;
    background-color: $modal-background-color;
    border-radius: 0;
    position: relative;

    @media(min-width: $breakpoint-lg) {
      margin: 50px 100px 0 100px;
      border-radius: 5px;
    }
  }

  .modal-help-text {
    color: #ffffff;
  }

  .close-modal {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 10px 13px;
    color: #ffffff;
  }

  .modal-enter {
    display: block;
    height: 50px;
    width: 100%;
    padding-left: 10px;
    border: 1px solid #ffffff;
    color: #ffffff;
    font-size: 24px;
    background-color: transparent;
    margin-top: 10px;
    letter-spacing: 0.35ch;

    &::selection {
      background-color: $modal-selection-color;
    }
  }

  .modal-options {
    background-color: $modal-background-color;
    border-radius: 5px;
    padding: 10px;
    margin: 5px 10px 0 10px;
    color: #ffffff;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    @media(min-width: $breakpoint-lg) {
      padding: 20px;
      margin: 5px 100px 0 100px;
    }
  }

  .modal-option {
    padding: 10px;
    cursor: pointer;

    &:hover, &:focus {
      background-color: darken($modal-selection-color, 10%);
    }

    &.active {
      background-color: darken($modal-selection-color, 20%);
    }
  }
</style>

<script>
import Vue from 'vue';

export default {
  name: 'MaddenTableSelectorModal',
  props: ['tables'],
  data () {
    return {
      tableSelectorText: '',
      selectedIndex: 0,
    }
  },

  destroyed () {
    window.removeEventListener('keydown', this.onKeydown);
  },

  computed: {
    suggestionBoxOptions: function () {
      if (this.tableSelectorText.length === 0) {
        return this.tables.map(mapTableToOption);
      }
      else {
        return this.tables.filter((table) => {
          return table.definition.name.toLowerCase().includes(this.tableSelectorText.toLowerCase());
        }).map(mapTableToOption);
      }

      function mapTableToOption(table) {
        return {
          'name': table.definition.name,
          'ref': table
        };
      }
    },

    showModalOptions: function () {
      return this.suggestionBoxOptions.length > 0;
    }
  },

  watch: {
    suggestionBoxOptions: function (newOptions) {
      if (newOptions.length > 0) {
        this.selectFirstOption();
      }
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onKeydown);
    this.$refs.modalEnter.focus();
    this.selectFirstOption();
  },

  methods: {
    selectTable: function (table) {
      this.$emit('selected', table);
    },

    closeTableModal: function () {
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

    selectFirstOption: function () {
      Vue.nextTick()
        .then(() => {
          this.selectedIndex = 0;
          this.clearSelectedOptions();
          this.selectOptionAtIndex(this.selectedIndex);
        });
    },

    onKeydown: function (e) {
      if (e.key === 'ArrowRight') {
        this.selectedIndex += 1;

        if (this.selectedIndex >= this.suggestionBoxOptions.length) {
          this.selectedIndex = 0;
        }

        this.clearSelectedOptions();
        this.selectOptionAtIndex(this.selectedIndex);
      }

      else if (e.key === 'ArrowLeft') {
        this.selectedIndex -= 1;

        if (this.selectedIndex < 0) {
          this.selectedIndex = this.suggestionBoxOptions.length - 1;
        }

        this.clearSelectedOptions();
        this.selectOptionAtIndex(this.selectedIndex);
      }

      else if (e.key === 'ArrowDown') {
        this.selectedIndex += 3;

        if (this.selectedIndex >= this.suggestionBoxOptions.length) {
          this.selectedIndex = 0;
        }

        this.clearSelectedOptions();
        this.selectOptionAtIndex(this.selectedIndex);
      }

      else if (e.key === 'ArrowUp') {
        this.selectedIndex -= 3;

        if (this.selectedIndex < 0) {
          this.selectedIndex = this.suggestionBoxOptions.length - 1;
        }

        this.clearSelectedOptions();
        this.selectOptionAtIndex(this.selectedIndex);
      }

      else if (e.key === 'Enter' && this.suggestionBoxOptions.length > 0) {
        this.chooseModalOption(this.suggestionBoxOptions[this.selectedIndex]);
      }

      else if (e.key === 'Escape') {
        this.closeTableModal();
      }
    }
  }
}
</script>
