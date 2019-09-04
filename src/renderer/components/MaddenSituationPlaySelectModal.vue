<template>
  <div class="play-select-modal modal modal-sm">
    <div class="modal-main">
      <h2 class="modal-help-text">Replace Play</h2>
      <div class="edit-text">Select a play to replace {{this.playToReplace.setl.name}} {{this.playToReplace.name}}</div>
      <span class="close-modal" v-on:click="closeModal">X</span>
      <div class="modal-content">
        <div class="filters">
          <div class="filter filter-search percent-input-wrapper">
            <input class="percent-input" type="text" v-model="playSearch" ref="search" />
          </div>
        </div>
        <div class="plays-wrapper">
          <div class="play" v-for="play in sortedPlays" v-bind:key="play.pbpl" @click="replacePlay(play)">{{play.setl.name}} {{play.name}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="../assets/madden-mass-editor-modal.scss"></style>
<style src="../assets/madden-play-select-modal.scss"></style>

<script>
export default {
  name: 'MaddenSituationPlaySelectModal',
  props: ['plays', 'playToReplace', 'playBlacklist'],

  computed: {
    sortedPlays: function () {
      return this.plays.filter((play) => {
        if (this.playBlacklist.find((blacklistPlay) => { return play.name === blacklistPlay.name && play.setl.name === blacklistPlay.setl.name; }) != null) {
          return false;
        }
        if (this.playSearch) {
          const playFullName = play.setl.name + ' ' + play.name;
          return playFullName.toLowerCase().indexOf(this.playSearch.toLowerCase()) >= 0;
        }
        else {
          return true;
        }
      }).sort((a, b) => {
        if (a.setl.name > b.setl.name) return 1;
        else if (a.setl.name < b.setl.name) return -1;
        else {
          if (a.name > b.name) return 1;
          else if (a.name < b.name) return -1;
          else return 0;
        }
      });
    }
  },

  mounted () {
    window.addEventListener('keydown', this.onKeydown);

    setTimeout(() => {
      this.$refs.search.focus();
    }, 20);
  },

  destroyed () {
    window.removeEventListener('keydown', this.onKeydown);
  },

  data () {
    return {
      playSearch: null
    }
  },

  methods: {
    closeModal: function () {
      this.$emit('closed');
    },

    onKeydown: function (e) {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    },

    replacePlay: function (play) {
      this.$emit('replace', play);
    }
  }
}
</script>