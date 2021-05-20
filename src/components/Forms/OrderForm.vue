<template>
  <div class="container">
    <MINIShowClients v-if="openClientsModal" @openClientModal="() => { openClientsModal = false; setAllData()}" />


    <!-- https://intercars.pl/s/lp-czesci-zamienne/ Uzupelnic Firestore o te kategorie -->


    <form class="newDataForm" v-if="!openClientsModal">
      <button class="btn" @click="openAvailableClients($event)">Wybierz klienta</button>
      <div v-if="selectedCar" class="newDataForm">
      <div class="selectedClient">
        <h3>Aktualnie wybrano:</h3>
        <p>Pojazd: </p>
        {{ `${selectedCar.Marka} ${selectedCar.Model} ${selectedCar.VIN}`}}
        <p>Klient:</p>
        {{ clientPhoneNum }}, {{ clientName }}
      </div>

      <textarea name="description" cols="50" rows="10" placeholder="Opis usterki" v-model="description"></textarea>

      <WorkOrderForm @WOItems="(data) => setWOItems(data)" />

      <p>Dodaj zlecenie jako:</p>
      <div>
        <input type="radio" id="waiting" name="ticket" value="wolne" checked v-model="picked">
        <label for="waiting">Wolne</label>
      </div>
      <div>
        <input type="radio" id="inprogress" name="ticket" value="obecne" v-model="picked">
        <label for="inprogress">W realizacji</label>
      </div>

      <div class="row">
        <button class="btn addData success" @click="validateData($event)">Dodaj</button>
        <button class="btn clearForm failed" @click="clearForm($event)">Wyczyść formularz</button>
      </div>
      </div>
    </form>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
 
import MINIShowClients from '@/views/MINIShowClients'
import WorkOrderForm from '@/components/Forms/WorkOrderForm.vue'

import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'

import firebase from 'firebase/app'

export default {
  components:{
    MINIShowClients,
    WorkOrderForm
  },
  setup() {
    
    const store = useStore()

    const description = ref('')
    const openClientsModal = ref(false)
    const selectedCar = ref()
    const clientPhoneNum = ref()
    const clientName = ref()
    const WOItems = ref([])

    const picked = ref('wolne')

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    function openAvailableClients(e){
      e.preventDefault()
      openClientsModal.value = true
    }

    function setAllData(){
      selectedCar.value = store.state.selectedCarForTicket[0]

      clientPhoneNum.value = store.state.selectedCarForTicket[1].Tel
      clientName.value = store.state.selectedCarForTicket[1].Imie
    }


    function validateData(e) {
      e.preventDefault()

        let preparedData = []
        let timeStamp = getTime()
        let ID = Date.now()
        if (clientName.value == null) {
          PopupFunc('error', 'Uzupełnij brakujące informacje')
          return
        }
        preparedData[ID] = {
          id: ID,

          Tel: clientPhoneNum.value,
          Imie: clientName.value,


          Marka: selectedCar.value?.["Marka"],
          Model: selectedCar.value?.['Model'],
          Wersja_Rocznik: selectedCar.value?.['Wersja_Rocznik'],
          Paliwo: selectedCar.value?.['Paliwo'],

          Silnik: selectedCar.value?.['Silnik'],
          SkrzyniaBiegow: selectedCar.value?.['SkrzyniaBiegow'],
          Naped: selectedCar.value?.['Naped'],
          Numer_rejestracyjny: selectedCar.value?.['Numer_rejestracyjny'],
          VIN: selectedCar.value?.['VIN'],
          Przebieg: selectedCar.value?.['Przebieg'],


          Opis: description.value || "",
          Wykonane_uslugi_czesci: WOItems.value,
          Koszt: 0,
          Dodane_Czas: store.state.targetCar?.['Dodane_Czas'] || timeStamp,
          Zakonczone_Czas: '',
        }
        let pick = picked.value

        sendDataToFirebase(preparedData, pick)
    }

    function sendDataToFirebase(preparedData, picked) {
      let Tel = Object.values(preparedData)[0].Tel
      let timeStamp = Object.values(preparedData)[0]['Dodane_Czas']

      const collectionReference = tickets.collection(picked)
      const docReference = collectionReference.doc(Tel)

      docReference.get().then(function (doc) {
        if (doc.exists) {
          docReference.update({
              ...preparedData,
              timeStamp
            }).then(() => PopupFunc('success', "Do podanego numeru dodano kolejny pojazd"))
            .catch(err => PopupFunc("error", err.message))
        } else {
          docReference.set({
              ...preparedData,
              timeStamp
            }).then(() => PopupFunc('success', `Nowe zlecenie znajdziesz w zakładce "${picked}"`))
            .catch(err => PopupFunc("error", err.message))
        }
        // tutaj dodac sprawdzenie w przypadku edycji ticketu, aby nadmiernie nie podbijac licznika
         tickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(1))
        
        clearForm()
        store.commit('setTargetCar', '')

      }).catch(function (err) {
        PopupFunc("error", err.message)
      })
    }

    function setWOItems(data){
      WOItems.value = data
    }

    function clearForm(e) {
      e?.preventDefault()

      selectedCar.value = ''
      clientPhoneNum.value = ''
      clientName.value = ''
      description.value = ''
      store.commit('setSelectedCarForTicket', '')
    }

    onMounted(() => {
      if(store.state.selectedCarForTicket) {
        setAllData()
      }
    })

    return {
      description,

      validateData,
      picked,

      clearForm,

      openAvailableClients,
      openClientsModal,
      setAllData,
      clientPhoneNum,
      selectedCar,
      clientName,
      WOItems,
      setWOItems
    }
  }
}
</script>

<style>
.align-center{
  align-items: center;
}
</style>