<template>
  <form class="p-ml-2">
    <div class="closeForm" @click="$router.go(-1)">&times;</div>

    <div class="p-d-flex p-flex-md-row p-flex-column p-jc-md-evenly p-ai-center">
      <div class=" p-d-flex p-flex-column ">
        <h3 class="p-mt-3">Pola obowiązkowe: </h3>
      
        <span class="p-float-label p-mt-4">
          <InputText type="text" id="phoneNum" required v-model="client.phoneNum" />
          <label for="phoneNum">Numer telefonu</label>
        </span>

        <div class="p-d-flex p-flex-row p-mt-3">
          <div class="p-field-radiobutton">
            <RadioButton name="typeOfClient" value="Prywatny" v-model="client.typeOfClient" />
            <label for="typeOfClient">Klient prywatny</label>
          </div>
          <div class="p-field-radiobutton p-pl-3">
            <RadioButton name="typeOfClient" value="Firma" v-model="client.typeOfClient" />
            <label for="typeOfClient">Firma</label>
          </div>
        </div>

        <span class="p-float-label p-mt-2" v-if="client.typeOfClient == 'Prywatny'">
          <InputText type="text" id="clientName" required v-model="client.Name" />
          <label for="clientName">Imie klienta</label>
        </span>
        <div class="p-d-flex p-flex-row p-mt-3" v-if="client.typeOfClient == 'Firma'">
          <span class="p-float-label">
            <InputText type="text" id="clientName" required v-model="client.Name" />
            <label for="clientName">Nazwa firmy</label>
          </span>
          <span class="p-float-label p-ml-2">
            <InputMask mask="9999999999" id="NIP" required v-model="client.companyId" style="width:125px"/>
            <label for="NIP">NIP</label>
          </span>
        </div>
      </div>

      <div class="extraInformation p-d-flex p-flex-column p-jc-evenly">
        <h3 class="p-mt-3">Dodatkowe informacje: </h3>
        <span class="p-float-label p-mt-4">
          <InputText type="text" id="phoneNum2" v-model="client.phoneNum2" />
          <label for="phoneNum2">Dodatkowy numer telefonu</label>
        </span>
        <h3 class="p-mt-2">Adres</h3>
        <div class="p-d-flex p-flex-row">
          <span class="p-float-label p-mt-3">
            <InputMask mask="99-999" id="postCode" v-model="client.PostCode" style="width:120px"/>
            <label for="postCode">Kod pocztowy</label>
          </span>
          <span class="p-float-label p-mt-3 p-ml-2">
            <InputText type="text" id="city" v-model="client.City" />
            <label for="city">Miejscowość</label>
          </span>
        </div>
        <span class="p-float-label p-mt-4">
            <InputText type="text" id="address" v-model="client.address" />
            <label for="address">Ulica i nr domu/mieszkania</label>
        </span>
        
        

      </div>
    </div>
        <label for="Textarea"><h3 class="p-mt-3 p-mb-1 p-text-center">Więcej informacji:</h3></label>
        <Editor v-model="client.description" id="Textarea" class="p-mx-auto p-mb-6">
          <template #toolbar >
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
        class="p-button-raised p-button-success p-m-2 p-text-bold p-text-white" @click="validateData($event)" icon="fas fa-save" />
      <Button label="Wyczyść formularz" class="p-button-raised p-button-danger p-m-2 p-text-bold p-text-white" 
      @click="clearForm" icon="fas fa-trash-alt" />
    </div>
  </form>

</template>

<script>

import { onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'
import validPhoneNum from '@/components/validPhoneNum.js'

import firebase from 'firebase/app'

import Editor from 'primevue/editor';
import RadioButton from 'primevue/radiobutton';
import InputMask from 'primevue/inputmask';


export default {

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const client = reactive({
    phoneNum: null,
    phoneNum2: null,
    Name: null,
    address: null,
    description: null,
    typeOfClient: 'Prywatny',
    companyId: null,
    PostCode: null,
    City: null,
    })

    const clients = firebase.firestore()
      .collection('warsztat')
      .doc('Klienci')

    function validateData(e) {
      e.preventDefault()

      if (validPhoneNum(client.phoneNum)) {
        // const { serverTimestamp } = firebase.firestore.FieldValue;

        let preparedData = []
        let timeStamp = getTime()
        let ID = Date.now()
        if (client.Name.value?.length < 2 || client.phoneNum == null) {
          PopupFunc('error', 'Uzupełnij brakujące informacje')
          return
        }
        preparedData = {
          id: ID,

          Rodzaj: client.typeOfClient,
          Tel: validPhoneNum(client.phoneNum),
          Tel2: client.phoneNum2 || "",
          Imie: client.Name,
          NIP: client.typeOfClient == 'Firma' ? client.companyId : "",
          KodPocztowy: client.PostCode || "",
          Miejscowosc: client.City || "",
          Ulica: client.address || "",

          Opis: client.description || "",
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
        router.go(-1)

      }).catch(function (err) {
        PopupFunc("error", err.message)
      })
    }


    function clearForm() {
      client.phoneNum = null
      client.phoneNum2 = null
      client.Name = null
      client.address = null
      client.companyId = null
      client.PostCode = null
      client.City = null

      client.description = null
    }

    function autoFillData() {
      const fill = store.state.targetClient

      client.phoneNum = fill['Tel'] || ''
      client.phoneNum2 = fill['Tel2'] || ''
      client.Name = fill['Imie'] || ''
      client.address = fill['Ulica'] || ''
      client.PostCode = fill['KodPocztowy'] || ''
      client.City = fill['Miejscowosc'] || ''
      client.typeOfClient = fill['Rodzaj'] || ''
      fill['Rodzaj'] == 'Firma' ? client.companyId = fill['NIP'] : ''

      client.description = fill['Opis'] || ''
    }

    onMounted(() => {
      if (!store.state.targetClient && route.path.indexOf('edytuj') > 0) {
        router.go(-1)
      } else {
          store.state.targetClient && autoFillData()
        }
      })

    watch(() => route.path, () => {
      if (route.path.indexOf('edytuj') <= 0) {
        clearForm()
        store.commit('setTargetClient', '')
      }
    })

    return {
      client,

      validateData,

      clearForm,

      Editor,
      RadioButton,
      InputMask
    }
  }
}
</script>

<style>
.p-text-white{
  color: rgb(39, 39, 39)!important;
}

.p-editor-container{
  height: 250px; 
  max-width:60vw
}
</style>