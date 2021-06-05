<template>
  <div class="p-d-flex p-flex-column p-ai-center">
    <h1 class="p-my-3">Zlecenia {{collectionPath}}</h1>

    <DataTable :value="allCars" responsiveLayout="stack" stripedRows showGridlines v-model:filters="tableFilters"
      filterDisplay="menu" :loading="isLoading" class="p-ml-4 p-my-5">
      <template #header>
        <div class="p-d-flex p-jc-between">
          <Button icon="pi pi-filter-slash" label="Wyczyść" class="p-button-outlined"
            @click="clearTableFilters()" />
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="tableFilters['global'].value" placeholder="Wyszukaj..." />
          </span>
        </div>
      </template>
      <template #empty>
        Nie znaleziono szukanej frazy.
      </template>
      <template #loading>
        Pobieranie danych z serwera...
      </template>

      <Column style="width:50px" class="p-text-center">
        <template #body="slotProps">
          {{slotProps.index+1}} 
        </template>
      </Column>
      <Column header="OPCJE" class="p-text-center" style="width:160px">
        <template #body="slotProps">
          <div class="p-d-flex p-jc-center">
            <Button @click="redirectToDetails(slotProps.data)"
              class="p-button-outlined p-button-rounded p-button-success" icon="fas fa-info-circle" 
              v-tooltip.top="'Szczegóły zlecenia'" />
            <Button @click="openModal(slotProps.data, 'relocate')"
              class="p-button-outlined p-button-rounded p-button-primary p-mx-2 relocate" icon="fas fa-arrows-alt-h"
              v-tooltip.top="'Przenieś zlecenie'" />
            <Button @click="openModal(slotProps.data, 'remove')"
              class="p-button-outlined p-button-rounded p-button-danger remove" icon="fas fa-trash-alt"
              v-tooltip.top="'Usuń zlecenie'" />
          </div>

        </template>
      </Column>
      <Column field="Dodane_Czas" header="Data dodania zlecenia" :class="'p-text-center ' + ($route.path == '/zakonczone' ? 'p-d-none' : '')" 
      style="width:150px"/>
      <Column field="Imie" header="Imie" class="p-text-center"></Column>
      <Column field="Tel" header="Numer Telefonu" class="p-text-center"></Column>
      <Column field="Marka" header="Pojazd" style="width:200px" class="p-text-center">
        <template #body="slotProps">
          {{ `${slotProps.data['Marka']} ${slotProps.data['Model']} ${(slotProps.data['Wersja_Rocznik'] || '')}` }}
        </template>
      </Column>
      <Column field="Numer_rejestracyjny" header="Numer rejestracyjny" class="p-text-center"></Column>
      <Column field="Zakonczone_Czas" header="Data zakończenia zlecenia" :class="'p-text-center ' + ($route.path == '/zakonczone' ? '' : 'p-d-none')" style="width:150px" />
      <!-- <Column field="Koszt" header="Koszt" class="p-text-center" v-if="$router.path.contains('zakonczone')"></Column> -->
    </DataTable>

    <Button class="p-button-secondary p-mb-6" label="Załaduj kolejne zlecenia" @click="getDataFromFirebase('more')"
      v-if="!disableNextButton" icon="pi pi-download" />
    <transition name="modal">
      <Modal :message="modalMsg" :operation="Operation" v-if="showModal"
        @true="(status, newLocation) => modalResponse(status, newLocation || '')" @false="modalResponse(false)" />
    </transition>
  </div>
</template>

<script>

import { onMounted, ref, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PopupFunc from '@/components/PopupFunc.js'
import Modal from '@/components/Modal.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

import { FilterMatchMode } from "primevue/api";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import firebase from 'firebase/app'
// require('firebase/firestore')
let _ = require('lodash')

import { DeleteFunc, RelocateTicket } from '@/components/EditMoveDeleteOptions'

export default ({

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const recivedItems = ref(null) // MAMY TUTAJ DOSTEP DO WSZYSTKICH DANYCH Z POBRANYCH DOKUMENTOW BEZ timeStamp
    const allCars = ref()

    const lastDoc = ref(0)
    const disableNextButton = ref(true)
    const limit = ref(50)
    const collectionPath = ref(route.path.substring(1))
    const isLoading = ref(true)
    const showModal = ref(false)
    const modalMsg = ref('')
    const Operation = ref()


    const tableFilters = ref({
      'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
    const clearTableFilters = () => {
      inittableFilters();
    }
    const inittableFilters = () => {
      tableFilters.value = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
      }
    }

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')


    async function getDataFromFirebase(req) {
      recivedItems.value = ''
      // allCars.value = ''

      if(req == 'more') limit.value += 50
      
      const collectionReference = tickets.collection(collectionPath.value).orderBy('timeStamp', 'desc')
        .limit(limit.value || 50)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]

      recivedItems.value = data.docs.map(doc => Object.entries(doc.data()).filter(item => item[0] != 'timeStamp'))
      recivedItems.value = _.flattenDeep(recivedItems.value)
      store.commit('setFetchedItems', recivedItems.value)

      allCars.value = recivedItems.value.filter(item => item instanceof Object ? item : '')

      isLoading.value = false

      disableNextButton.value = false
      if (data.docs.length < limit.value) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
      }
    }

    function redirectToDetails(carData) {

      store.commit('setCarDetails', carData)
      router.push(`/details/${collectionPath.value}/${carData['Tel']}/${carData['id']}`)
    }

    function openModal(carInfo, operation) {
      Operation.value = operation
      store.commit('setTargetCar', carInfo)
      if (operation == 'remove') modalMsg.value = `Czy na pewno chcesz usunąć zlecenie numeru ${carInfo['Tel']}?`
      if (operation == 'relocate') {
        modalMsg.value = `Gdzie przenosimy zlecenie ${carInfo['Tel']}?`

      }
      showModal.value = true
    }

    async function modalResponse(response, newLocation) {
      const { id,Tel } = store.state.targetCar

      if (Operation.value == 'remove') {
        if (response == true) {
          const currentPath = tickets.collection(collectionPath.value)
          const confirmDelete = await DeleteFunc('ticket', currentPath, Tel, '', id)
          if(confirmDelete !== false) allCars.value = allCars.value.filter(val => val.id != id)
        }
        return showModal.value = false
      }
      if (Operation.value == 'relocate') {

        if (response == true) {
          let carData = []

          for (let i = 0; i < recivedItems.value.length; i++) {
            if (recivedItems.value[i] == id) {
              carData[recivedItems.value[i]] = recivedItems.value[i + 1]
              store.commit('setTargetCar', carData)
            }
          }
          const confirmDelete = await RelocateTicket('ticket', carData, tickets, collectionPath.value, newLocation, Tel)
         if(confirmDelete !== false) allCars.value = allCars.value.filter(val => val.id != id)
        }
      }
      return showModal.value = false
    }


    onMounted(() => {
      collectionPath.value = route.path.substring(1)
      limit.value = 50
      getDataFromFirebase()
    })

    watch(() => route.path, () => {
      limit.value = 50
      if (route.path == '/obecne' || route.path == '/wolne' || route.path == '/zakonczone') {
        collectionPath.value = route.path.substring(1)
        getDataFromFirebase()
      }
    })


    return {
      getDataFromFirebase,

      recivedItems,
      disableNextButton,

      collectionPath,
      isLoading,
      allCars,

      openModal,
      redirectToDetails,

      Modal,
      showModal,
      modalResponse,
      modalMsg,
      Operation,

      DataTable,
      Column,
      FilterMatchMode,

      Button,
      InputText,

      tableFilters,
      clearTableFilters
    }

  },
})
</script>

