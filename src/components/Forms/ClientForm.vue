<template>
  <form class="p-ml-2">
    <div class="closeForm" @click="$router.go(-1)">&times;</div>

    <div class="p-d-flex p-flex-md-row p-flex-column p-jc-md-evenly p-ai-center">
      <div class=" p-d-flex p-flex-column ">
        <h3 class="p-mt-3">Pola obowiązkowe: </h3>
      
        <span class="p-float-label p-mt-4">
          <InputText type="text" id="phoneNum" required v-model="phoneNum" />
          <label for="username">Numer telefonu</label>
        </span>

        <span class="p-float-label p-mt-4">
          <InputText type="text" id="clientName" required v-model="clientName" />
          <label for="clientName">Imie klienta</label>
        </span>

      </div>

      <div class="extraInformation p-d-flex p-flex-column p-jc-evenly">
        <h3 class="p-mt-3">Dodatkowe informacje: </h3>
        <span class="p-float-label p-mt-4">
          <InputText type="text" id="phoneNum2" required v-model="phoneNum2" />
          <label for="phoneNum2">Dodatkowy numer telefonu</label>
        </span>
        <span class="p-float-label p-mt-4">
          <InputText type="text" id="address" required v-model="address" />
          <label for="address">Adres</label>
        </span>

      </div>
    </div>
    <label for="Textarea"><h3 class="p-mt-3 p-mb-1">Uwagi</h3></label>
        <Editor v-model="client_description" editorStyle="height: 250px; width: 60vw; max-width: 800px" id="Textarea">
          <template #toolbar>
            <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
              <button class="ql-list" value="bullet"></button>
            </span>
          </template>
        </Editor>

    <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center">
      <Button :label=" $route.path.indexOf('edytuj') > 0 ? 'Edytuj klienta' : 'Dodaj klienta'" 
        class="p-button-raised p-button-success p-m-2" @click="validateData($event)" icon="pi pi-save" />
      <Button label="Wyczyść formularz" class="p-button-raised p-button-danger p-m-2" 
      @click="clearForm" icon="pi pi-trash" />
    </div>
  </form>

</template>

<script>

import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'
import validPhoneNum from '@/components/validPhoneNum.js'

import firebase from 'firebase/app'

import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import Button from 'primevue/button';


export default {

  setup() {
    const route = useRoute()
    const Router = useRouter()
    const store = useStore()

    const phoneNum = ref('')
    const phoneNum2 = ref('')
    const clientName = ref('')
    const address = ref('')
    const client_description = ref()

    const clients = firebase.firestore()
      .collection('warsztat')
      .doc('Klienci')

    function validateData(e) {
      e.preventDefault()

      if (validPhoneNum(phoneNum.value)) {
        // const { serverTimestamp } = firebase.firestore.FieldValue;

        let preparedData = []
        let timeStamp = getTime()
        let ID = Date.now()
        if (clientName.value?.length < 2 || phoneNum.value == null) {
          PopupFunc('error', 'Uzupełnij brakujące informacje')
          return
        }
        preparedData = {
          id: ID,

          Tel: validPhoneNum(phoneNum.value),
          Tel2: phoneNum2.value || "",
          Imie: clientName.value,
          Adres: address.value,

          Opis: client_description.value || "",
          Ostatnia_Aktualizacja: timeStamp,
        }
        sendDataToFirebase(preparedData)

      } else PopupFunc('error', 'Upewnij się, że dane są prawidłowe! ⚠️')

    }

    function sendDataToFirebase(preparedData) {
      let Tel = preparedData.Tel

      const collectionReference = clients.collection("Numery")
      const docReference = collectionReference.doc(Tel)

      docReference.get().then(function (doc) {
        if (doc.exists) {
          if(route.path.indexOf('edytuj') <= 0) {
            return PopupFunc('error', 'Klient o podanym numerze już istnieje!')
            }
          docReference.update({
              ...preparedData
            }).then(() => PopupFunc('success', `Zaaktualizowano klienta o podanym numerze telefonu: \n${Tel}`))
            .catch(err => PopupFunc("error", err.message))
        } else {
          docReference.set({
              ...preparedData
            }).then(() => PopupFunc('success', `Dodano nowego klienta o numerze ${Tel}`))
            .catch(err => PopupFunc("error", err.message))
        }

        if(route.path.indexOf('edytuj') <= 0) clients.update("Klienci", firebase.firestore.FieldValue.increment(1))
        clearForm()
        store.commit('setTargetClient', '')
        Router.go(-1)

      }).catch(function (err) {
        PopupFunc("error", err.message)
      })
    }


    function clearForm() {
      phoneNum.value = ""
      phoneNum2.value = ""
      clientName.value = ""
      address.value = ""

      client_description.value = null
    }

    function autoFillData() {
      const fill = store.state.targetClient

      phoneNum.value = fill['Tel'] || ''
      phoneNum2.value = fill['Tel2'] || ''
      clientName.value = fill['Imie'] || ''
      address.value = fill['Adres'] || ''

      client_description.value = fill['Opis'] || ''
    }

    onMounted(() => {
      if (route.path.indexOf('edytuj') > 0) {
        store.state.targetClient && autoFillData()
      } else {
        clearForm()
        store.commit('setTargetClient', '')
      }
    })

    watch(() => route.path, () => {
      if (route.path.indexOf('edytuj') <= 0) {
        clearForm()
        store.commit('setTargetClient', '')
      }
    })

    return {
      phoneNum,
      phoneNum2,
      address,
      client_description,
      clientName,

      validateData,

      clearForm,

      InputText,
      Editor,
      Button
    }
  }
}
</script>

<style>

</style>