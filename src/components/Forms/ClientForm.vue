<template>
  <form class="newClientForm">
    <div class="closeForm" @click="$router.go(-1)">&times;</div>

    <div class="row">
      <div class="required column">
        <h2>Pola obowiązkowe: </h2>
        <label for="phoneNum">Number telefonu:</label>
        <input type="text" id="phoneNum" placeholder="123456789 / 1234567" required v-model="phoneNum">

        <label for="clientName">Imie klienta:</label>
        <input type="text" id="clientName" required v-model="clientName">

      </div>

      <div class="extraInformation column">
        <h2>Dodatkowe informacje: </h2>
        <label for="phoneNum2">Dodatkowy numer telefonu::</label><input name="phoneNum2" type="text"
          v-model="phoneNum2" maxlength="12">
        <label for="address">Adres:</label><input name="address" type="text" v-model="address">

        <textarea name="client_description" cols="50" rows="10" placeholder="Dodatkowe informacje"
          v-model="client_description"></textarea>
      </div>
    </div>


    <div class="row">
      <button class="btn addData success"
        @click="validateData($event)">{{ $route.path.indexOf('edytuj') > 0 ? "Edytuj klienta" : "Dodaj klienta" }}</button>
      <button class="btn clearForm failed" @click="clearForm">Wyczyść formularz</button>
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

      clearForm
    }
  }
}
</script>

<style>

</style>