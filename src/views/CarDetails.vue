<template>
  <div class="p-pt-5">
    <Card style="max-width:1100px" class="relative">
      <template #title>
        <div class="closeForm" @click="$router.go(-1)">&times;</div>
        <div class="p-text-center p-my-2">Szczegółowe dane pojazdu:
          {{ `${carDetails?.Marka} ${carDetails?.Model} ${carDetails?.Wersja_Rocznik || ''}` }}</div>
      </template>
      <template #content>
        <div v-if="!isLoading" class="p-d-flex p-flex-column p-flex-lg-row p-jc-center" @dblclick="copyValue($event)">
          <div class="p-d-flex p-flex-column" style="max-width:290px">
            <div class="p-d-flex p-flex-row p-mb-1">
              <div class="p-text-bold p-mr-2">Klient: </div>
              <div class="copy">{{ carDetails?.['Tel'] || 'NIEPRZYPISANE'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-mb-1">
              <div class="p-text-bold p-mr-2">Marka: </div>
              <div class="copy">{{ carDetails?.['Marka'] }}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Model: </div>
              <div class="copy">{{ carDetails?.['Model'] }}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rok produkcji / Generacja: </div>
              <div class="copy">{{ carDetails?.['Wersja_Rocznik'] || ''}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">VIN: </div>
              <div class="copy">{{ carDetails?.['VIN'] }}</div>
            </div>
            <a class="p-button-text p-link" target="_blank" rel="noreferrer" v-if="carDetails?.['VIN']"
              :href="`https://pl.vindecoder.pl/${carDetails?.['VIN']}`" style="width:250px">Sprawdź dane pojazdu po nr VIN </a>
            <div class="p-d-flex p-flex-row p-my-1" v-if="carDetails?.['Numer_rejestracyjny']">
              <div class="p-text-bold p-mr-2">Numer rejestracyjny: </div>
              <div class="copy">{{ carDetails?.['Numer_rejestracyjny'] || 'Nie wprowadzono danych'}}</div>
            </div>
          </div>
          <div class="p-ml-0 p-mt-4 p-mt-lg-0 p-ml-lg-4 p-d-flex p-flex-column" style="max-width:280px">
            <h4 class="p-jc-start">Silnik:</h4>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Pojemność[cm<sup>3</sup>]: </div>
              <div class="copy">{{ carDetails?.['Silnik_Pojemnosc'] || 'Nie wprowadzono danych' }}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Moc[KM]: </div>
              <div class="copy">{{ carDetails?.['Silnik_Moc'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Kod/Oznaczenie: </div>
              <div class="copy">{{ carDetails?.['Silnik_Kod'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rodzaj paliwa: </div>
              <div class="copy">{{ carDetails?.['Paliwo']?.name || 'Nie wprowadzono danych'}}</div>
            </div>
          </div>
          <div class=" p-ml-0 p-mt-4 p-mt-lg-0 p-ml-lg-4 p-d-flex p-flex-column">
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Przebieg: </div>
              <div class="copy">{{ carDetails?.['Przebieg']?.length ? carDetails?.['Przebieg'] + ' km' : 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rodzaj napędu: </div>
              <div class="copy">{{ carDetails?.['Naped'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rodzaj skrzyni biegów: </div>
              <div class="copy">{{ carDetails?.['SkrzyniaBiegow'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1" v-if="carDetails?.['Opis']">
              <div class="p-text-bold p-mr-2">Dodatkowe informacje: </div>
              <div v-html="carDetails?.['Opis']"></div>
            </div>
          </div>

        </div>
        <ProgressSpinner class="p-d-flex p-jc-center" animationDuration="0.5s" v-if="isLoading" /> 
        <TicketsHistory v-if="!isLoading" :VIN="carDetails?.['VIN']" :Tel="carDetails?.['Tel']" />
      </template>
      <template #footer>
        <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center p-mb-3">
          <Button :disabled="isLoading" label="Edytuj dane pojazdu" @click="openEditVehicleForm()" icon="pi pi-pencil" />
          <Button :disabled="isLoading" :label="`Usuń pojazd ${carDetails?.['VIN']}`" @click="confirmDeleteModal(carDetails, 'removeCar', carDetails.VIN)"
            class="p-button-danger p-mx-0 p-mx-md-3 p-my-3 p-my-md-0" icon="pi pi-trash" />
          <Button v-if="carDetails?.['Tel']" :disabled="isLoading" label="Usuń powiązanie z klientem" @click="relocateFunc(carDetails, carDetails['VIN'])" icon="pi pi-user-minus"  class="p-button-warning"/>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { callTicketsHistory } from '@/components/fetchTicketHistory.js'
import TicketsHistory from '@/components/TicketsHistory.vue'
import { DeleteFunc, relocateCarToUnassigned } from '@/components/EditMoveDeleteOptions.js'

import firebase from 'firebase/app'
  
import { ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm";

import copyToClipboard from '@/components/copyToClipboard.js'

import ProgressSpinner from 'primevue/progressspinner';

export default {
  components:{
    TicketsHistory,
    ProgressSpinner
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const toast = useToast()
    const confirm = useConfirm()

    const isLoading = ref(true)

    const carDetails = ref()

     const allTickets = ref()
     const isThereAnyTicket = ref()

    const MainPath = firebase.firestore()
       .collection('warsztat').doc('Pojazdy').collection('VIN')

    function openEditVehicleForm() {
      // caly czas w pamieci store mam zapisane dane pojazdu, wiec nie musze ich na nowo przesylac, a jedynie przekierowac routerem do formularza
      router.push(`/pojazd/${carDetails.value?.['VIN']}/edytuj`)
    }

    async function copyValue(e){
      const text = e.target?.innerText
      if(e.target.classList.contains('copy')) {
        await copyToClipboard(text)
        toast.add({severity:'info', summary: 'Wartość skopiowana', detail:`Wartość "${text}" została skopiowana do schowka`, life: 3000})
      }
    }

    async function relocateFunc(carData, target, extraInfo) {
      const confirmUnassign = await relocateCarToUnassigned(carData, target)
        if (confirmUnassign !== false) {
          toast.removeAllGroups()
          if(carDetails.value['Tel']) toast.add({severity:'success', detail:'Pomyślnie usunięto powiązanie pojazdu z klientem.', life: 4000})
          if(extraInfo) toast.add({severity:'info', detail:'Pojazd zawiera historię serwisową przez co nie można go całkowicie usunąć z bazy.', life: 8000})
          carDetails.value['Tel'] = ''
          store.commit('setTargetCar', carDetails.value)
        }
    }

    async function fetchCarData(){
      const car = MainPath.doc(route.params['VIN'])

      const getData = await car.get()
      carDetails.value = getData.data()

      if(!carDetails.value) {
        toast.add({severity:'warn', summary: 'Brak danych', detail:`Brak danych pojazdu o podanym numerze VIN: ${route.params['VIN']}`, life: 4000})
        router.go(-1)
      }

      isLoading.value = false

      store.commit('setTargetCar', carDetails.value)
    }

    const confirmDeleteModal = async (vehicleData, operation, target) => {
      allTickets.value = await callTicketsHistory(target)

       setTimeout(() => {
         isThereAnyTicket.value = allTickets.value.some(ticket => ticket[1].length > 0)
       }, 500)

      confirm.require({
        message: `Czy na pewno chcesz usunąć pojazd o numerze VIN: ${target}?`,
        header: `Usuń pojazd`,
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-success',
        rejectClass: 'p-button-danger',
        acceptLabel: 'Tak',
        rejectLabel: 'Nie',
        accept: async () => {
            if(isThereAnyTicket.value == false){ // tutaj mozna dodac || !vehicleData.Tel
            const confirmDelete = await DeleteFunc('car', MainPath, target)
            if (confirmDelete !== false) {
              toast.removeAllGroups()
              toast.add({severity:'success', detail:'Pomyślnie usunięto pojazd z listy klienta.', life: 4000})
              router.go(-1)
            }
            } else if(isThereAnyTicket.value == true){
              await relocateFunc(JSON.parse(JSON.stringify(vehicleData)), target, 'extraInfo') // prosta konwersja proxy do objektu
            
             }
          },
        reject: () => {}
      });
    }

    onBeforeMount(() => {
      if(!store.state?.targetCar){
        fetchCarData()
      }else{
        carDetails.value = store.state?.targetCar
        isLoading.value = false
      }
    })

    return {
      carDetails,
      confirmDeleteModal,

      openEditVehicleForm,

      copyValue,
      TicketsHistory,

      isLoading,

      relocateCarToUnassigned,
      relocateFunc
    }
  }
}
</script>

<style>
</style>