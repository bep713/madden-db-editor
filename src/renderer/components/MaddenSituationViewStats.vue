<template>
  <div class="situation-stats-wrapper">
    <div class="play-count-wrapper stat-group">
      <div class="stat-group-title">Play count by type - {{selectedSituation.name}}</div>
      <div class="stats">
        <div class="pass stat">
          <span class="stat-title">Pass</span>
          <span class="stat-number">{{numPass}}</span>
        </div>
        <div class="run stat">
          <span class="stat-title">Run</span>
          <span class="stat-number">{{numRun}}</span>
        </div>
        <div class="pa stat">
          <span class="stat-title">PA</span>
          <span class="stat-number">{{numPa}}</span>
        </div>
        <div class="rpo stat">
          <span class="stat-title">RPO</span>
          <span class="stat-number">{{numRpo}}</span>
        </div>
      </div>
    </div>
    <div class="stat-group unused-plays">
      <div class="stat-group-title">Unused plays in playbook</div>
      <div class="stats">
        <div v-for="play in unusedPlays" v-bind:key="play.pbpl" class="table-item">{{play.setl.name}} {{play.name}}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .play-count-wrapper {
    .stat {
      display: grid;
      grid-template-columns: 75px 1fr;
       
      + .stat {
        margin-top: 5px;
      }
    }
  }

  .stat-group-title {
    margin-bottom: 10px;
    font-weight: bold;
  }

  .stat-group {
    background: #FFF;
    padding: 10px;

    + .stat-group {
      margin-top: 15px;
    }
  }

  .unused-plays {
    .stats {
      max-height: calc(100vh - 318px);
      overflow-y: auto;
    }

    .table-item {
      cursor: default;

      &:hover {
        background-color: inherit;
      }
    }
  }
</style>

<script>
import PlayTypeData from '../utils/PlayTypeData';

export default {
  name: 'MaddenSituationViewStats',
  props: ['plays', 'selectedSituation', 'situationPlays'],

  data() {
    return {
      
    };
  },

  computed: {
    numPass: function () {
      return this.getNumberOfPlaysByType('Pass');
    },

    numRun: function () {
      return this.getNumberOfPlaysByType('Run');
    },

    numPa: function () {
      return this.getNumberOfPlaysByType('Play action');
    },

    numRpo: function () {
      return this.getNumberOfPlaysByType('RPO');
    },

    unusedPlays: function () {
      return this.plays.filter((play) => {
        return play.pbaiData.length === 0;
      });
    }
  },

  mounted () {

  },

  destroyed() {

  },

  methods: {
    getNumberOfPlaysByType(type) {
      const meta = PlayTypeData.find((playType) => { return playType.name === type; });
      return this.situationPlays.filter((play) => { return meta.plyt.includes(play.plyt.id); }).length;
    }
  }
}

  function newFunction() {
    
  }
</script>