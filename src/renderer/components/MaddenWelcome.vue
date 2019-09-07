<template>
  <div class="welcome">
    <!-- <div class="app-brand"></div> -->
    <div class="app-title">
      <h1>Madden DB Editor</h1>
      <span class="version">v1.1.1</span>
    </div>
    <div class="welcome-header">
      <h1>Start</h1>
      <ul>
        <li class="link-item" v-on:click="openFile">Open a file</li>
      </ul>
    </div>
    <div class="recent-files">
      <h1>Open a recent file</h1>
      <ul>
        <li class="link-item" v-for="file in recentFilesByDate" v-bind:key="file.path" v-on:click="openRecentFile(file.path)">
          <span class="file-name">{{ parseFileName(file.path) }}</span>
          <span class="file-path">({{ parseFilePath(file.path) }})</span>
          <span class="time">{{ parseDate(file.time) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style src='../assets/madden-welcome.scss'></style>

<script>
import { ipcRenderer } from 'electron';
import moment from 'moment';

export default {
  name: 'MaddenWelcome',
  props: ['recentFiles'],
  data () {
    return {
      maxRecentFiles: 10
    }
  },

  mounted() {
    // ipcRenderer.send('load-file', 'C:\\Users\\Matt\\Downloads\\Madden_49ers.DB');
  },

  computed: {
    recentFilesByDate: function () {
      return this.recentFiles.sort((a, b) => { return b.time - a.time }).slice(0, this.maxRecentFiles)
    }
  },

  methods: {
    openFile: function () {
      ipcRenderer.send('open-file');
    },

    openRecentFile: function (file) {
      ipcRenderer.send('open-file', { filePath: file });
    },

    parseFileName: function (file) {
      return /.+\\(.+)\./.exec(file)[1];
    },

    parseFilePath: function (file) {
      return /(.+)\\.+\./.exec(file)[1];
    },

    parseDate: function (dateMilli) {
      const date = new Date(dateMilli);
      return moment(date).format('MM/DD/YYYY hh:mm A');
    }
  }
}
</script>
