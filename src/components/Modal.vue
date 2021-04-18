<template>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
              {{ message }}
          </div>

          <div class="modal-body" v-if="operation == 'relocate'">
              <select>
                <option>WYSUWANA LISTA</option>
              </select>
          </div>

          <div class="modal-footer">
              <button class="modal-default-button btn success" @click="$emit('true')">
                Kontynuuj 
              </button>
              <button class="modal-default-button btn failed" @click="$emit('false')">
                Anuluj
              </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script>

export default {
  props: ['message', 'operation'],
  emits: ['true', 'false']
}
</script>

<style>

</style>