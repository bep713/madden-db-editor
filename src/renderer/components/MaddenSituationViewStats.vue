<template>
  <div class="situation-stats-wrapper">
    <div class="play-count-wrapper stat-group">
      <div class="stat-group-title">Play count by type</div>
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
    <div class="stat-group vpos-stats">
      <div class="stat-group-title">Target breakdown</div>
      <div class="stats">
        <div v-for="(target, index) in targets" v-bind:key="index" class="stat">
          <span class="stat-title">{{index}}</span>
          <span class="stat-number">{{target}}</span>
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
  .situation-stats-wrapper {
    display: grid;
    grid-template-rows: 205px 1fr;
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;
  }

  .stat {
    display: grid;
    grid-template-columns: 75px 1fr;
      
    + .stat {
      margin-top: 5px;
    }
  }

  .stat-group-title {
    margin-bottom: 10px;
    font-weight: bold;
  }

  .stat-group {
    background: #FFF;
    padding: 10px;
  }

  .unused-plays {
    grid-column: 1 / 3;

    .stats {
      max-height: calc(100vh - 373px);
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
      }).sort((a, b) => {
        if (a.setl.name > b.setl.name) return 1;
        else if (a.setl.name < b.setl.name) return -1;
        else {
          if (a.name > b.name) return 1;
          else if (a.name < b.name) return -1;
          else return 0;
        }
      });
    },

    targets: function () {
      return this.situationPlays.reduce((accum, cur) => {
        let mappedVpos;

        switch(cur.vpos) {
          case 0: mappedVpos = 'QB'; break;
          case 1: mappedVpos = 'HB'; break;
          case 2: mappedVpos = 'SLWR'; break;
          case 3: mappedVpos = 'LWR'; break;
          case 4: mappedVpos = 'RWR'; break;
          case 5: mappedVpos = 'TE'; break;
        }

        if (accum[mappedVpos]) {
          accum[mappedVpos] = accum[mappedVpos] + 1;
        }
        else {
          accum[mappedVpos] = 1;
        }
        
        return accum;
      }, {'QB': 0, 'HB': 0, 'SLWR': 0, 'LWR': 0, 'RWR': 0, 'TE': 0});
    }
  },

  mounted () {

  },

  destroyed() {

  },

  methods: {
    getNumberOfPlaysByType(type) {
      if (PlayTypeData) {
        const meta = PlayTypeData.find((playType) => { return playType.name === type; });
        return this.situationPlays.filter((play) => { return meta.plyt.includes(play.plyt.id); }).length;
      }
      else {
        return null;
      }
    }
  }
}
</script>