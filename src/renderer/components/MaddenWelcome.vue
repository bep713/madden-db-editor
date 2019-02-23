<template>
  <div class="welcome">
    <!-- <div class="app-brand"></div> -->
    <div class="app-title">
      <h1>Madden DB Editor</h1>
      <span class="version">v0.1</span>
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

<style lang="scss">
  $welcome-link-color: #0066cc;
  $welcome-bg-color: #e9e9e9;
  $brand-color: #e98819;

  .app-brand {
    height: 50px;
    background-color: $brand-color;
    margin: -50px -50px 0 -50px;
  }

  .welcome {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;

    font-family: 'Roboto', sans-serif;
    padding: 40px;
    background-color: $welcome-bg-color;

    h1 {
      margin-top: 0;
      margin-bottom: 15px;
      letter-spacing: 0.05em;
    }

    ul {
      display: inline-block;
      list-style: none;
      margin-top: 0;
      padding-left: 0;
    }

    li {
      + li {
        margin-top: 5px;
      }
    }

    .app-title {
      height: 50px;
      background-color: $brand-color;
      margin: -40px -40px 0 -40px;
      padding: 40px 0 100px 40px;
      color: white;

      h1 {
        margin-bottom: 0;
        font-size: 36px;
      }
      
      .version {
        font-size: 14px;
        font-style: italic;
      }
    }


    .link-item {
      color: $welcome-link-color;
      cursor: pointer;

      &:hover {
        color: darken($welcome-link-color, 10%);
      }
    }

    .file-path {
      color: #333;
    }

    .time {
      color: #333;
      font-style: italic;
      font-size: 14px;
    }

    > div + div {
      margin-top: 50px;
    }
  }
</style>

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
