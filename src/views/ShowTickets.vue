<template>
  <div class="p-d-flex p-flex-column p-ai-streach">
    <h1 class="p-my-3 p-mx-auto">Zlecenia {{collectionPath == 'wolne' ? 'Oczekujące na realizację' : (collectionPath == 'obecne' ? 'W trakcie realizacji' : (collectionPath == 'zakonczone' ? 'Zakończone' : 'Coś poszło nie tak...'))}}</h1>
    <div class="p-d-flex p-ai-center p-jc-center">
    <Button class="p-button-secondary p-my-4" label="Załaduj kolejne zlecenia" @click="getDataFromFirebase('more')"
      v-if="!disableNextButton" icon="pi pi-download" />
    </div>

    <DataTable :value="allTickets" responsiveLayout="stack" stripedRows showGridlines v-model:filters="tableFilters"
      filterDisplay="menu" :loading="isLoading" class="p-my-5" breakpoint="1050px" :paginator="true" :rows="countTicketPages || 20">
      <template #header>
        <div class="p-d-flex p-jc-between p-flex-column p-flex-sm-row">
          <Button icon="pi pi-filter-slash" label="Wyczyść" class="p-button-outlined"
            @click="clearTableFilters()" />
            <div class="p-my-3 p-my-sm-0 p-text-center">Wczytano {{ recivedItems?.length }} z {{ totalNumberOfTickets }} zleceń</div>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="tableFilters['global'].value" placeholder="Wyszukaj..." />
          </span>
        </div>
      </template>
      <template #empty>
        Ta lista jest pusta...
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
          <div class="p-d-flex p-jc-center p-mx-0">
            <Button @click="redirectToDetails(slotProps.data)"
              class="p-button-outlined p-button-rounded p-button-primary" icon="fas fa-info-circle" 
              v-tooltip.top="'Szczegóły zlecenia'" />
            <Button @click="openRelocateDialog(slotProps.data)"
              class="p-button-outlined p-button-rounded p-button-warning p-mx-1 p-mx-xlg-2 relocate" icon="fas fa-arrows-alt-h"
              v-tooltip.top="'Przenieś zlecenie'" />
            <Button @click="confirmDeleteModal(slotProps.data)"
              class="p-button-outlined p-button-rounded p-button-danger remove" icon="fas fa-trash-alt"
              v-tooltip.bottom="'Usuń zlecenie'" />
          </div>

        </template>
      </Column>
      <Column field="Dodane_Czas" header="Dodanie zlecenia" :class="'p-text-center ' + ($route.path == '/zakonczone' ? 'p-d-none' : '')" 
              style="width:140px"/>
      <Column field="Imie" header="Imie" class="p-text-center">
        <template #body="{data}">
          <div @dblclick="copyValue($event)">{{ data['Imie'] }}</div>
        </template>
      </Column>
      <Column field="Tel2" class="p-d-none" />
      <Column field="Tel" header="Numer Telefonu" class="p-text-center" style="width:130px">
        <template #body="{data}" >
          <div @dblclick="copyValue($event)">{{ data['Tel'] }}</div>
        </template>
      </Column>
      <Column field="Model" class="p-d-none" /> <!-- potrzebne do wyszukania i filtrowania pojazdu, ale nie wmusi być widoczne -->
      <Column field="VIN" class="p-d-none" /> <!-- potrzebne do wyszukania i filtrowania pojazdu, ale nie wmusi być widoczne -->
      <Column field="Marka" header="Pojazd" style="width:200px" class="p-text-center">
        <template #body="{data}" >
          <div @dblclick="copyValue($event)">{{ `${data['Marka']} ${data['Model']} ${(data['Wersja_Rocznik'] || '')}` }}</div>
          <div @dblclick="copyValue($event)">{{ `${data['VIN']}` }}</div>
        </template>
      </Column>
      <Column field="Numer_rejestracyjny" header="Numer rejestracyjny" class="p-text-center" >
        <template #body="{data}" >
          <div @dblclick="copyValue($event)">{{ data['Numer_rejestracyjny'] }}</div>
        </template>
      </Column>
      <Column field="Zakonczone_Czas" header="Zakończenie zlecenia" :class="'p-text-center ' + ($route.path == '/zakonczone' ? '' : 'p-d-none')" style="width:150px" />
    </DataTable>

    <transition name="modal">
      <CustomRelocateConfirmDialog :message="modalMsg" v-if="showModal"
        @true="(status, newLocation) => modalResponse(status, newLocation || '')" @false="modalResponse(false)" />
    </transition>
  </div>
</template>

<script>

import { onMounted, ref, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import CustomRelocateConfirmDialog from '@/components/CustomRelocateConfirmDialog.vue'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm";

import { FilterMatchMode } from "primevue/api";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import copyToClipboard from '@/components/copyToClipboard.js'

import firebase from 'firebase/app'

import { DeleteFunc, RelocateTicket } from '@/components/EditMoveDeleteOptions'

export default ({
  components:{
    CustomRelocateConfirmDialog
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const toast = useToast()
    const confirm = useConfirm()

    const recivedItems = ref(null) // MAMY TUTAJ DOSTEP DO WSZYSTKICH DANYCH Z POBRANYCH DOKUMENTOW BEZ timeStamp
    const allTickets = ref()
    
    const totalNumberOfTickets = ref(0)

    const lastDoc = ref(0)
    const disableNextButton = ref(true)
    const limit = ref(50)
    const collectionPath = ref(route.path.substring(1))
    const isLoading = ref(true)
    const showModal = ref(false)
    const modalMsg = ref('')
    const countTicketPages = ref()


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

    const confirmDeleteModal = (ticketData) => {
      confirm.require({
        message: `Czy na pewno chcesz usunąć zlecenie klienta ${ticketData.Tel},
        Pojazd: ${ticketData.Marka} ${ticketData.Model}?`,
        header: `Usunąć zlecenie?`,
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-success',
        rejectClass: 'p-button-danger',
        acceptLabel: 'Tak',
        rejectLabel: 'Nie',
        accept: async () => {
          const { id } = ticketData

          const currentPath = tickets.collection(collectionPath.value)
          const confirmDelete = await DeleteFunc('ticket', currentPath, id)
          if (confirmDelete !== false) {
            allTickets.value = allTickets.value.filter(ticket => ticket.id != id)
            toast.removeAllGroups()
            toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: 'Pomyślnie usunięto zlecenia', life: 4000})
          }
        },
        reject: () => {}
      });
    }

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')


    async function getDataFromFirebase(req) {
      isLoading.value = true
      recivedItems.value = ''
      // allTickets.value = ''

      if (req == 'more') limit.value += 50

      const collectionReference = tickets.collection(collectionPath.value).orderBy('Aktualizacja', 'desc')
        .limit(limit.value || 50)

      // na podstawie linku powiekszam pierwsza litere i pobieram tylko jeden potrzebny mi wynik
      totalNumberOfTickets.value = (await tickets.get()).data()[collectionPath.value[0].toUpperCase() + collectionPath.value.substring(1)]

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]

      recivedItems.value = data.docs.map(doc => doc.data())

      store.commit('setFetchedItems', recivedItems.value)

      allTickets.value = recivedItems.value.filter(item => item instanceof Object ? item : '')

      isLoading.value = false

      disableNextButton.value = false
      if (data.docs.length < limit.value) {
        disableNextButton.value = true
        toast.removeAllGroups()
        toast.add({
          severity: 'info',
          detail: 'Wczytano wszystkie zlecenia',
          life: 4000
        })
      }
    }

    function redirectToDetails(ticketData) {

      store.commit('setCarDetails', ticketData)
      router.push(`/szczegoly/${collectionPath.value}/${ticketData['Tel']}/${ticketData['id']}`)
    }

    async function copyValue(e) {
      const text = e.target ?.innerText
      await copyToClipboard(text)

      toast.add({
        severity: 'info',
        summary: 'Wartość skopiowana',
        detail: `Wartość "${text}" została skopiowana do schowka`,
        life: 3000
      })
    }

    function openRelocateDialog(ticketInfo) {
      store.commit('setTargetClient', ticketInfo)
      modalMsg.value = `Gdzie przenosimy zlecenie ${ticketInfo['Tel']}?`

      showModal.value = true
    }

    async function modalResponse(response, newLocation) {
      const targetClient = store.state.targetClient
        if (newLocation == route.path.substring(1)) {
          toast.add({ severity: 'info', summary: 'Zmień target', detail: `Nie można przenieść zlecenia do tej samej lokalizacji..`, life: 4000 })
          return
        } 

      if (response == true) {
        store.commit('setTargetCar', targetClient)
          
        const { ConfirmRelocate, clientIsOffline} = await RelocateTicket('ticket', targetClient, tickets, collectionPath.value, newLocation, targetClient.id)
        if (ConfirmRelocate !== false) {
          allTickets.value = allTickets.value.filter(car => car.id != targetClient.id)
          toast.removeAllGroups()
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: `Pomyślnie przeniesiono zlecenie do ${newLocation}`,
            life: 4000
          })
        }
        if(clientIsOffline) toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Bez połączenia z siecią przenoszenie zleceń nie jest możliwe.', life: 0})
      }
      return showModal.value = false
    }

    onMounted(() => {
      if(localStorage.getItem('countTicketPages')) countTicketPages.value = JSON.parse(localStorage.getItem('countTicketPages'))
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
      allTickets,
      totalNumberOfTickets,

      openRelocateDialog,
      redirectToDetails,

      showModal,
      modalResponse,
      modalMsg,

      DataTable,
      Column,
      FilterMatchMode,

      tableFilters,
      clearTableFilters,
      copyValue,

      confirmDeleteModal,
      CustomRelocateConfirmDialog,
      countTicketPages

    }

  },
})
</script>

