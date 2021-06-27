<template>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container p-text-center">

          <h2 class="modal-header">
              {{ message }}
          </h2>
          <Divider />

          <div class="modal-body p-text-justify p-ml-6 p-pl-5 p-d-flex p-flex-column">
            <span>
              <RadioButton id="free" value="wolne" v-model="newLocation" />
              <label for="free"> Wolne</label>
            </span>

            <span class="p-mt-2">
              <RadioButton id="inprogress" value="obecne" v-model="newLocation" />
              <label for="inprogress"> W trakcie realizacji</label>
            </span>

            <span class="p-mt-2">
              <RadioButton id="done" value="zakonczone" v-model="newLocation" />
              <label for="done"> Zakończone</label>
            </span>
          </div>
          <Divider />

          <div class="modal-footer p-mt-2">
              <Button class="p-button-success" @click="handleEmit()" v-if="newLocation.length > 0"
                label="Przenieś" />
              <Button class=" p-button-danger" @click="$emit('false')" label="Anuluj" />
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import RadioButton from 'primevue/radiobutton';
import Divider from 'primevue/divider';

export default {
  props: ['message'],
  emits: ['true', 'false'],

  setup(props, {emit}){
    const newLocation = ref('')

    function handleEmit(){
      emit('true', true, newLocation.value)
    }

    return { newLocation, handleEmit, RadioButton, Divider }
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
  color: #E3E4E6;
}

.modal-container {
  width: min(600px, 80%);
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #2A323D;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-body {
  margin: 16px 0;
}

.modal-footer{
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
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