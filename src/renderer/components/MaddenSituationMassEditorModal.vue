<template>
  <div class="mass-editor-modal modal">
    <div class="mass-editor-modal-main modal-main">
      <h2 class="modal-help-text">PRCT Global Editor</h2>
      <span class="close-modal" v-on:click="closeModal">X</span>
      <div class="modal-content">
        <div class="edit-text" v-if="applyToAllSituations === false">This will apply to all applicable plays in the <span class="selected-situation">{{selectedSituation}}</span> situation.</div>
        <div class="edit-text" v-if="applyToAllSituations === true">This will apply to all applicable plays in <span class="selected-situation">ALL</span> situations.</div>
        <div class="percent-wrapper">
          <div class="percent">
            <label class="name" for="pass-input">Pass</label>
            <span class="percent-input-wrapper">
              <input type="number" id="pass-input" class="percent-input" v-model="pass" ref="passInput" min="0" max="100" />
              %
            </span>
          </div>
          <div class="percent">
            <label class="name" for="run-input">Run</label>
            <span class="percent-input-wrapper">
              <input type="number" id="run-input" class="percent-input" v-model="run" min="0" max="100" />
              %
            </span>
          </div>
          <div class="percent">
            <label class="name" for="pa-input">Play action</label>
            <span class="percent-input-wrapper">
              <input type="number" id="pa-input" class="percent-input" v-model="pa" min="0" max="100" />
              %
            </span>
          </div>
          <div class="percent">
            <label class="name" for="rpo-input">RPO</label>
            <span class="percent-input-wrapper">
              <input type="number" id="rpo-input" class="percent-input" v-model="rpo" min="0" max="100" />
              %
            </span>
          </div>
        </div>
        <div class="footer-items">
          <div class="button-wrapper">
            <button class="cancel secondary-button" @click="closeModal">Cancel</button>
            <button class="apply primary-button" @click="apply">Apply</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="../assets/madden-mass-editor-modal.scss"></style>

<script>
export default {
  name: 'MaddenSituationMassEditorModal',
  props: ['selectedSituation'],

  data () {
    return {
      applyToAllSituations: false,
      pass: null,
      run: null,
      pa: null,
      rpo: null
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onKeydown);
    this.$refs.passInput.focus();
  },

  destroyed () {
    window.removeEventListener('keydown', this.onKeydown);
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

    apply: function () {
      this.$emit('prct-edit', {
        'pass': this.pass,
        'run': this.run,
        'pa': this.pa,
        'rpo': this.rpo
      });
    }
  }
}
</script>