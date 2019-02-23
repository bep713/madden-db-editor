<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'madden-db-editor'
  }
</script>

<style lang="scss">
body {
  font-family: "Roboto", sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
