<template>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
              {{ message }}
          </div>

          <div class="modal-body" v-if="operation == 'relocate'">

              <input type="radio" id="free" value="wolne" v-model="newLocation">
              <label for="free"> Wolne</label>
              <br>
              <input type="radio" id="inprogress" value="obecne" v-model="newLocation">
              <label for="inprogress"> W trakcie realizacji</label>
              <br>
              <input type="radio" id="done" value="zakonczone" v-model="newLocation">
              <label for="done"> Zakończone</label>
          </div>

          <div class="modal-footer">
              <button class="modal-default-button btn success" @click="handleEmit()" v-if="operation == 'relocate' && newLocation.length > 0">
                Przenoszonko 
              </button>
              <button class="modal-default-button btn success" @click="$emit('true', true)" v-if="operation != 'relocate'">
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
import { ref } from 'vue'

export default {
  props: ['message', 'operation'],
  emits: ['true', 'false'],

  setup(props, {emit}){
    const newLocation = ref('')

    function handleEmit(){
      emit('true', true, newLocation.value)
    }

    return { newLocation, handleEmit }
  }
}
</script>

<style scoped>


.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
  color: black
}

.modal-container {
  width: min(600px, 80%);
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-body {
  margin: 20px 0;
}

.modal-footer{
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
}

.modal-default-button {
  display: block;
  margin-top: 1rem;
  font-weight: bold;
  color: white
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

</style>