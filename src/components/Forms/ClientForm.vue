<template>
<div class="p-pt-4">
  <Card class="relative" style="max-width:800px; margin: 0 auto">
    <template #title>
      <div class="closeForm" @click="$router.go(-1)">&times;</div>
      <div class="p-text-center">{{ $route.path.indexOf('edytuj') > 0 ? 'Edytuj dane klienta' : 'Dodaj nowego klienta' }}</div>
    </template>
    <template #content>
      <form>
        <div class="p-d-flex p-flex-md-row p-flex-column p-jc-md-evenly p-ai-center">
          <div class=" p-d-flex p-flex-column ">
            <h3 class="p-mt-3">Pola obowiązkowe: </h3>

            <span class="p-float-label p-mt-4">
              <InputText type="text" id="phoneNum" required v-model="client.phoneNum" />
              <label for="phoneNum">Numer telefonu*</label>
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

            <span class="p-float-label p-mt-3" v-if="client.typeOfClient == 'Prywatny'">
              <InputText type="text" id="clientName" v-model="client.Name" />
              <label for="clientName">Imie klienta*</label>
            </span>
            <div class="p-d-flex p-flex-column p-flex-sm-row p-mt-3" v-if="client.typeOfClient == 'Firma'">
              <span class="p-float-label">
                <InputText type="text" id="clientName" v-model="client.Name" />
                <label for="clientName">Nazwa firmy*</label>
              </span>
              <span class="p-float-label p-mt-4 p-mt-sm-0 p-ml-0 p-ml-sm-2">
                <InputMask mask="9999999999" id="NIP" v-model="client.companyId" style="width:125px" />
                <label for="NIP">NIP*</label>
              </span>
            </div>
          </div>

          <div class="p-d-flex p-flex-column p-jc-evenly p-ai-center p-ai-sm-start">
            <h3 class="p-mt-3">Dodatkowe informacje: </h3>
            <span class="p-float-label p-mt-4">
              <InputText type="text" id="phoneNum2" v-model="client.phoneNum2" />
              <label for="phoneNum2">Drugi numer telefonu</label>
            </span>
            <h4 class="p-mt-2">Adres</h4>
            <div class="p-d-flex p-flex-column p-flex-sm-row">
              <span class="p-float-label p-mt-4">
                <InputMask mask="99-999" id="postCode" v-model="client.PostCode" style="width:120px" />
                <label for="postCode">Kod pocztowy</label>
              </span>
              <span class="p-float-label p-mt-4 p-sm-mt-3 p-ml-0 p-ml-sm-2">
                <InputText type="text" id="city" v-model="client.City" />
                <label for="city">Miejscowość</label>
              </span>
            </div>
            <span class="p-float-label p-mt-4">
              <InputText type="text" id="address" v-model="client.address" />
              <label for="address">Ulica i nr budynku</label>
            </span>

          </div>
        </div>
        <label for="Textarea">
          <h3 class="p-mt-3 p-mb-1 p-text-center">Więcej informacji:</h3>
        </label>
        <Editor v-model="client.description" id="Textarea" class="p-mx-auto p-mb-6">
          <template #toolbar>
            <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
              <button class="ql-list" value="bullet"></button>
              <button class="ql-link"></button>
            </span>
          </template>
        </Editor>
      </form>
    </template>
    <template #footer>
      <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center">
        <Button :label=" $route.path.indexOf('edytuj') > 0 ? 'Aktualizuj dane klienta' : 'Dodaj klienta'"
          class="p-button-success p-button-outlined p-m-2 p-text-bold" @click.prevent="validateData"
          icon="fas fa-save" />
        <Button label="Wyczyść formularz" class="p-button-danger p-button-outlined p-m-2 p-text-bold" @click="clearForm"
          icon="fas fa-trash-alt" />
      </div>
    </template>
  </Card>
</div>
</template>

<script>
import { onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from "primevue/usetoast"

import { getTime } from '@/components/getCurrentTime'
import { updateClientNumber } from '@/components/EditMoveDeleteOptions.js'
import validPhoneNum from '@/components/validPhoneNum.js'

import firebase from 'firebase/app'

import Editor from 'primevue/editor';
import RadioButton from 'primevue/radiobutton';
import InputMask from 'primevue/inputmask';


export default {
  components:{
    Editor,
    RadioButton,
    InputMask,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

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

    async function validateData() {
      document.querySelectorAll('.p-invalid').forEach(input => input.classList.remove('p-invalid'))

      if(!client.phoneNum || !validPhoneNum(client.phoneNum)) document.querySelector('#phoneNum').classList.add('p-invalid')
      if(client.typeOfClient == 'Firma' && (!client.companyId || client.companyId?.length < 10)) document.querySelector('#NIP').classList.add('p-invalid')
      if (!client.Name || client.Name?.length < 2) document.querySelector('#clientName').classList.add('p-invalid')

      let checkForInvalids = document.querySelectorAll('.p-invalid')

        // const { serverTimestamp } = firebase.firestore.FieldValue;
        if(checkForInvalids.length == 0){
        let preparedData = []
        let timeStamp = getTime()
        let ID = Date.now()
        
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

      if(route.path.indexOf('edytuj') > 0){
        if(validPhoneNum(store.state.targetClient.Tel) != validPhoneNum(client.phoneNum)) {
          let confirmUpdate = await updateClientNumber(store.state.targetClient, preparedData)
          if(confirmUpdate != false) {
            toast.add({severity:'success', summary: 'Zaktualizowano pomyślnie', detail: `Klient uzyskał nowy numer telefonu: \n${preparedData.Tel}`, life: 4000})
            router.go(-1)
          } else toast.add({severity:'error', summary: 'Wystąpił błąd', detail: `Nie udało się zaktualizować danych klienta`, life: 5000})
        } else sendDataToFirebase(preparedData)
      } else sendDataToFirebase(preparedData)
    }
        else{
          toast.removeAllGroups()
          toast.add({severity:'error', summary: 'Błędne dane', detail: 'Uzupełnij lub popraw zaznaczone pola!', life: 4000})
        }
    }

    function sendDataToFirebase(preparedData) {
      let Tel = preparedData.Tel

      const collectionReference = clients.collection("Numery")
      const docReference = collectionReference.doc(Tel)

      docReference.get().then(function (doc) {
        if (doc.exists) {
          if(route.path.indexOf('edytuj') <= 0) {
              toast.removeAllGroups()
              toast.add({severity:'error', summary: '', detail: 'Klient o podanym numerze jest już w bazie!', life: 4000})
              return
            }
          docReference.update({
              ...preparedData
            }).then(() => {
              toast.removeAllGroups()
              toast.add({severity:'success', summary: 'Zaktualizowano pomyślnie', detail: `Zaaktualizowano klienta o podanym numerze telefonu: \n${Tel}`, life: 4000})
            })
            .catch(err => {
              toast.removeAllGroups()
              toast.add({severity:'error', summary: 'Błąd', detail: err.message, life: 6000})
            })
        } else {
          docReference.set({
              ...preparedData
            }).then(() =>  {
              toast.removeAllGroups()
              toast.add({severity:'success', summary: 'Dodano pomyślnie', detail: `Dodano nowego klienta o numerze: ${Tel}`, life: 4000})
            })
            .catch(err =>  {
              toast.removeAllGroups()
              toast.add({severity:'error', summary: 'Błąd', detail: err.message, life: 6000})
            })
        }

        if(route.path.indexOf('edytuj') <= 0) clients.update("Klienci", firebase.firestore.FieldValue.increment(1))
        clearForm()
        store.commit('setTargetClient', '')
        router.go(-1)

      }).catch(err =>{
              toast.removeAllGroups()
              toast.add({severity:'error', summary: 'Błąd', detail: err.message, life: 6000})
              return
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
.p-editor-container{
  height: 250px; 
}

.relative{
  position: relative;
}
</style>