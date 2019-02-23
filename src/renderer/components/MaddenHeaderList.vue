<template>
  <div class="madden-header-list">
    <div class="header-item"
      v-for="listItem in list"
      v-bind:key="listItem.id">
      {{listItem.name}} - {{listItem.value}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaddenHeaderList',
  props: ['list']
}
</script>
