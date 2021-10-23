<template>
<div class="p-pt-5">
  <MINIShowClients v-if="openClientsModal" @openClientModal="() => { openClientsModal = false; setAllData()}" />
  <Card class="p-text-center" style="max-width:1100px" v-if="!openClientsModal">

    <!-- https://intercars.pl/s/lp-czesci-zamienne/ Uzupelnic Firestore o te kategorie -->

    <template #content>
      <form class="newDataForm">
        <div class="p-d-flex p-flex-column p-jc-center p-flex-sm-row p-ml-4 p-ml-sm-0">
          <div class="p-mr-0 p-mb-5 p-mb-sm-0 p-mr-sm-6" style="max-width:280px">
            <p>Klient i pojazd już istnieje w bazie:</p>
            <Button class="p-button-primary p-mt-2" :label="`${!selectedCar ? 'Wybierz klienta' : 'Wybierz innego klienta'}`" @click="() => {openClientsModal = true }" />
          </div>
          <div style="max-width:280px" v-if="!selectedCar">
            <p>Brakuje danych klienta lub pojazdu: </p>
            <Button class="p-button-primary p-mt-2" label="Dodaj nowego klienta" @click="() => $router.push('/klient/dodaj/') " />
          </div>
        </div>
        <div v-if="selectedCar" class="newDataForm">
          <div class="selectedClient">
            <h3 class="p-pt-2">Aktualnie wybrano:</h3>
            <p class="p-pt-1">Pojazd: </p>
            <div class="p-text-bold p-my-1" style="color:var(--yellow-500)">
              {{ `${selectedCar.Marka} ${selectedCar.Model} ${selectedCar.VIN}`}}
            </div>
            <p>Klient:</p>
            <div style="color:var(--blue-400)" class="p-text-bold">{{ selectedClient?.Tel }}</div>
            <div>{{ selectedClient?.Imie }}</div>
            <div v-if="selectedClient.NIP">NIP: {{ selectedClient?.NIP }}</div>
            <div v-if="selectedClient.KodPocztowy && selectedClient.Miejscowosc && selectedClient.Ulica">
                {{ `${selectedClient?.KodPocztowy} ${selectedClient?.Miejscowosc} - ul. ${selectedClient?.Ulica}` }}</div>
          </div>

          <label for="Textarea">
            <h3 class="p-mt-3 p-mb-1 p-text-center">Więcej informacji:</h3>
          </label>
          <Editor v-model="description" id="Textarea" class="p-mb-6 p-text-left" style="max-width:600px; margin:  auto;">
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

          <div>
            <WorkOrderForm @WOItems="(data) => setWOItems(data)"  />
          </div>

          <h2 class="p-my-2">Dodaj zlecenie jako:</h2>
          <div class="p-d-flex p-flex-column p-jc-center">
            <span class="p-mb-1">
              <RadioButton id="waiting" name="ticket" value="wolne" checked v-model="picked" />
              <label for="waiting"> Nowe</label>
            </span>
            <span>
              <RadioButton id="inprogress" name="ticket" value="obecne" v-model="picked" />
              <label for="inprogress"> W realizacji</label>
            </span>
          </div>

        </div>
      </form>
    </template>

  <template #footer>
      <div class="p-d-flex p-flex-column p-flex-sm-row p-jc-center" v-if="selectedCar">
        <Button class="p-button-success p-mr-0 p-mr-sm-2 p-mb-2 p-mb-sm-0" @click.prevent="validateData()" label="Dodaj zlecenie" icon="pi pi-plus" />
        <Button class="p-button-danger" @click.prevent="clearForm()" label="Wyczyść formularz" icon="pi pi-trash" />
      </div>
  </template>
  </Card>
</div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
 
import MINIShowClients from '@/views/MINIShowClients'
import WorkOrderForm from '@/components/Forms/WorkOrderForm.vue'
import RadioButton from 'primevue/radiobutton'
import Editor from 'primevue/editor'


import { useToast } from "primevue/usetoast"
import { getTime } from '@/components/getCurrentTime'

import firebase from 'firebase/app'

export default {
  components:{
    MINIShowClients,
    WorkOrderForm,
    Editor
  },
  setup() {
    
    const store = useStore()

    const description = ref('')
    const openClientsModal = ref(false)
    const selectedCar = ref()
    const selectedClient = ref()
    const WOItems = ref([])

    const toast = useToast()

    const picked = ref('wolne')

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    function setAllData(){
      selectedCar.value = store.state.selectedCarForTicket[0]

      selectedClient.value = store.state.selectedCarForTicket[1]
    }


    function validateData() {

        let preparedData = []
        let timeStamp = getTime()
        let ID = Date.now()

        preparedData = {
          id: ID,

          Tel: selectedClient.value.Tel,
          Imie: selectedClient.value.Imie,
          NIP: selectedClient.value.Rodzaj == 'Firma' ? selectedClient.value.NIP  : '',
          kodPocztowy: selectedClient.value.kodPocztowy ? selectedClient.value.kodPocztowy : '',
          Miejscowosc: selectedClient.value.Miejscowosc ? selectedClient.value.Miejscowosc : '',
          Ulica: selectedClient.value.Ulica ? selectedClient.value.Ulica : '',

          Marka: selectedCar.value?.["Marka"],
          Model: selectedCar.value?.['Model'],
          Wersja_Rocznik: selectedCar.value?.['Wersja_Rocznik'] || "",
          Paliwo: selectedCar.value?.['Paliwo'] || "",

          Silnik_Pojemnosc: selectedCar.value?.['Silnik_Pojemnosc'] || "",
          Silnik_Moc: selectedCar.value?.['Silnik_Moc'] || "",
          Silnik_Kod: selectedCar.value?.['Silnik_Kod'] || "",
          SkrzyniaBiegow: selectedCar.value?.['SkrzyniaBiegow'] || "",
          Naped: selectedCar.value?.['Naped'] || "",
          Numer_rejestracyjny: selectedCar.value?.['Numer_rejestracyjny'] || "",
          VIN: selectedCar.value?.['VIN'],
          Przebieg: selectedCar.value?.['Przebieg'] || "",

          Opis: description.value || "",
          Wykonane_uslugi_czesci: WOItems.value,
          Dodane_Czas: store.state.targetCar?.['Dodane_Czas'] || timeStamp,
          ProtokolPrzyjecia: store.state.protocolData || '',
          Zakonczone_Czas: '',
          Aktualizacja: timeStamp
        }
        let pick = picked.value

        sendDataToFirebase(preparedData, pick)
    }

    async function sendDataToFirebase(preparedData, picked) {
      let ID = preparedData.id

      const collectionReference = tickets.collection(picked)
      const docReference = collectionReference.doc(`zlecenie-${ID}`)

      try{
        const getDoc = await docReference.get()
        await addTicket(getDoc)
        updateCounters()
      } catch(err) {
        if(err.code == 'permission-denied') toast.add({severity:'error', summary: 'Aktualizacja', detail: 'To konto nie posiada uprawnień do wykonywania zmian!', life: 6000})
        else if(err.message.indexOf('offline') > 0) toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Bez połączenia z siecią dodawanie nowych zleceń nie jest możliwe..', life: 0})
        else toast.add({ severity: 'error', summary: 'Wystąpił Problem', detail: err.message, life: 5000})
      }
      
      async function addTicket(doc) {
        if (doc.exists) {
          toast.add({ severity: 'error', summary: 'Wystąpił Problem', detail: 'Wystąpił nieznany błąd, Wymagany DEBUG', life: 10000})
        } else {
          docReference.set({...preparedData}).then(() => {
              toast.removeAllGroups()
              toast.add({ severity: 'success', summary: 'Dodano zlecenie', detail: `Nowe zlecenie znajdziesz w zakładce "${picked == 'wolne' ? 'Oczekujące' : (picked == 'obecne' ? 'W trakcie realizacji' : 'Zakończone')}"`, life: 4000})
            }).catch(function (err) { toast.add({ severity: 'error', summary: 'Wystąpił Problem', detail: err.message, life: 5000})})
        }
      }

       function updateCounters(){
          // tutaj dodac sprawdzenie w przypadku edycji ticketu, aby nadmiernie nie podbijac licznika
          tickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(1))
          if(picked == 'zakonczone') tickets.update("Zakonczone", firebase.firestore.FieldValue.increment(1))
          if(picked == 'obecne') tickets.update("Obecne", firebase.firestore.FieldValue.increment(1))
          if(picked == 'wolne') tickets.update("Wolne", firebase.firestore.FieldValue.increment(1))
        
          clearForm()
          store.commit('setTargetCar', '')
        }
    }

    function setWOItems(data){
      WOItems.value = data
    }

    function clearForm() {
      selectedCar.value = ''
      selectedClient.value = ''
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
      RadioButton,

      validateData,
      picked,

      clearForm,

      openClientsModal,
      setAllData,
      selectedClient,
      selectedCar,
      WOItems,
      setWOItems,

      Editor
    }
  }
}
</script>

<style>
.p-inputnumber-input{
  max-width: 110px;
}
</style>