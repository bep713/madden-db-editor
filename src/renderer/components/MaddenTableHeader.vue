<template>
  <div class="madden-table-header-wrapper">
    <div class="header-tab" v-bind:class="{ active: isActive }"
      v-on:click="selectTable">

      <span class="table-loading-indicator" v-show="table.isLoading"></span>
      <span class="table-name">{{table.definition.name}}</span>
    </div>
  </div>
</template>

<style src='../assets/madden-table-header.scss'></style>

<script>
export default {
  name: 'MaddenTableHeader',
  props: ['table', 'isActive'],
  data () {
    return {
      
    }
  },
  methods: {
    selectTable: function () {
      this.$emit('selected');
    }
  }
}
</script>
