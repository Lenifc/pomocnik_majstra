<template>
  <CustomRelocateConfirmDialog :message="modalMsg" v-if="showModal" @true="(status, newLocation) => modalResponse(status, newLocation)" @false="modalResponse(false)" />
    
    <Card class="p-mt-6 relative">
      <template #title>
        <div class="closeForm" @click="$router.push(`/${$route.params.collectionPath}`)">&times;</div>
        <div class="p-text-center">SZCZEGÓŁY zlecenia {{$route.params.ticketDetails}}</div>
      </template>
      <template #content>
        <div v-if="!isLoading">
          <div :id="ticketDetails?.['id']" class="column">
            <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center">

              <div class="client p-mr-0 p-mb-5 p-mr-md-5 p-mb-md-0">
                <h3 class="p-mb-2" style="color:var(--yellow-500)">Klient:</h3>
                <div>Imie: {{ ticketDetails?.['Imie'] }}</div>
                <div v-if="ticketDetails?.NIP">NIP: {{ ticketDetails.NIP}}</div>
                <div>Numer Telefonu: {{ ticketDetails?.['Tel'] }}</div>
              </div>
              <div class="vehicle p-mr-0 p-mb-5 p-mr-md-5 p-mb-md-0">
                <h3 class="p-mb-2" style="color:var(--yellow-500)">Pojazd:</h3>
                <div>Marka: {{ ticketDetails?.['Marka'] }}</div>
                <div>Model: {{ ticketDetails?.['Model'] }}</div>
                <div>Rok_prod: {{ ticketDetails?.['Wersja_Rocznik'] || "Brak wprowadzonych danych"}}</div>
                <div>VIN: {{ ticketDetails?.['VIN'] }}</div>
                <div>Tablice: {{ ticketDetails?.['Numer_rejestracyjny'] }}</div>
                <div>Paliwo: {{ ticketDetails?.['Paliwo']?.name || "Brak wprowadzonych danych"}}</div>
                <div
                  v-if="ticketDetails?.['Silnik_Pojemnosc'] && ticketDetails?.['Silnik_Moc'] && ticketDetails?.['Silnik_Kod']">
                  Silnik:
                  {{ ticketDetails?.['Silnik_Pojemnosc'] }}cm<sup>3</sup> ; {{ ticketDetails?.['Silnik_Moc'] }}KM ;
                  {{ ticketDetails?.['Silnik_Kod'] }}</div>
                <div>Napęd: {{ ticketDetails?.['Naped'] || "Brak wprowadzonych danych"}}</div>
                <div>Skrzynia biegów: {{ ticketDetails?.['SkrzyniaBiegow'] || "Brak wprowadzonych danych"}}</div>
                <div>Przebieg: {{ ticketDetails?.['Przebieg'] }}km</div>
              </div>
            </div>
            <div class="p-text-center p-mt-4">
              <h3 class="p-mb-2" style="color:var(--yellow-500)">Szczegóły zlecenia:</h3>
              <div>id: {{ ticketDetails?.['id'] }}</div>
              <div>Status zlecenia: <span class="p-text-bold">{{showStatus($route.params.collectionPath)}}</span></div>
              <div>Zlecenie dodane: {{ ticketDetails?.['Dodane_Czas'] }}</div>
              <div v-if="$route.params.collectionPath == 'zakonczone'">Zlecenie zakonczone:
                {{ ticketDetails?.['Zakonczone_Czas'] }}</div>
              <div v-if="ticketDetails?.['Opis']">Opis:<div v-html="ticketDetails?.['Opis']"></div>
              </div>
            </div>
          </div>

          <div class="p-d-flex p-jc-center">
            <WorkOrderForm :passedWO="ticketDetails?.['Wykonane_uslugi_czesci']" @WOItems="(data) => setWOItems(data)" />
          </div>
        </div>
        <ProgressSpinner animationDuration="0.5s" v-if="isLoading" class="p-d-flex p-flex-column p-jc-center" />

      </template>
      <template #footer>
        <div class="p-d-flex p-flex-column p-flex-sm-row p-jc-center">
          <Button :disabled="isLoading" class="p-button-success p-mx-1 p-my-1 p-my-sm-0" @click="updateTicket()"
            label="Aktualizuj zmiany" icon="pi pi-pencil" />
          <Button :disabled="isLoading" class="p-button-warning p-mx-1 p-my-2 p-my-sm-0"
            @click="openRelocateDialog(ticketDetails)" label="Przenieś" icon="fas fa-arrows-alt-h" />
          <Button :disabled="isLoading" class="p-button-danger p-mx-1 p-my-2 p-my-sm-0"
            @click="confirmDeleteModal(ticketDetails)" icon="pi pi-trash" label="Usuń zlecenie" />
          <Button :disabled="isLoading" class="p-button-help p-mx-1 p-my-1 p-my-sm-0"
            @click="OpenInvoiceVizualization()" label="Generuj Fakture" icon="pi pi-print"
            v-if="$route.params.collectionPath == 'zakonczone' && ticketDetails?.['Wykonane_uslugi_czesci']?.length" />
        </div>
      </template>
    </Card>
</template>

<script>
import firebase from 'firebase/app'
import { DeleteFunc, RelocateTicket } from '@/components/EditMoveDeleteOptions'

import CustomRelocateConfirmDialog from '@/components/CustomRelocateConfirmDialog.vue'
import WorkOrderForm from '@/components/Forms/WorkOrderForm.vue'
  
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm"

import { getTime } from '@/components/getCurrentTime'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import copyToClipboard from '@/components/copyToClipboard.js'
import ProgressSpinner from 'primevue/progressspinner';


export default {
  components:{
    CustomRelocateConfirmDialog,
    WorkOrderForm,
    ProgressSpinner
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const toast = useToast()
    const confirmDialog = useConfirm()
    const isLoading = ref(true)

    const showModal = ref(false)
    const modalMsg = ref('')

    const checkOffline = ref()

    const ticketDetails = ref()
    const originalRows = ref({})
    const editingRows = ref([])
    const showTotalNet = ref(0)
    const showTotalGross = ref(0)
    const ComputedShowTotalNet = computed(() => showTotalNet.value.toFixed(2))
    const ComputedShowTotalGross = computed(() => showTotalGross.value.toFixed(2))

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    const currentPhoneNum = route.params.phoneNum
    const ticketID = route.params.ticketDetails

    function fetchData() {
      // dodanie 'EMPTY' to prowizoryczne obejscie problemy podczas opuszczania ticketDetails cofajac strone do carDetails 
      // - tylko w tym przypadku apka sie sypala...
      tickets.collection(route?.params?.collectionPath || 'EMPTY').doc(`zlecenie-${ticketID}`)
        .get().then(recived => {
          ticketDetails.value = recived.data()
          store.commit('setFillProtocol', ticketDetails.value['ProtokolPrzyjecia'])
          isLoading.value = false

          if(ticketDetails.value['Wykonane_uslugi_czesci']){
            ticketDetails.value['Wykonane_uslugi_czesci'].forEach(item =>{
              showTotalGross.value += Number(item['totalCost_gross'])
              showTotalNet.value += Number(item['totalCost_net'])
            })
          }

        }).catch(() => {
          ticketDetails.value = ''
          toast.add({severity:'warn', detail:`Wystąpił problem ze znalezieniem danego numeru: ${currentPhoneNum}`, life: 4000})
        })
    }

      const confirmDeleteModal = (ticketData) => {
        confirmDialog.require({
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

          const currentPath = tickets.collection(route.params.collectionPath)
          const confirmDelete = await DeleteFunc('ticket', currentPath, id)
          if (confirmDelete !== false) {
            router.go(-1)
            toast.removeAllGroups()
            toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: 'Pomyślnie usunięto zlecenia', life: 4000})
          }
        },
        reject: () => {}
      });
    }

    async function updateTicket() {
      let updatedTicket = []
      ticketDetails.value['ProtokolPrzyjecia'] = JSON.parse(JSON.stringify(store.state.protocolData))

      updatedTicket = JSON.parse(JSON.stringify(ticketDetails.value)) // zamiana Proxy na Object

      updatedTicket.Aktualizacja = getTime()

      const { id } = ticketDetails.value
      const ticketStatus = route.params.collectionPath

      const collectionReference = tickets.collection(ticketStatus).doc(`zlecenie-${id}`)

      try{
        const getCollection = await collectionReference.get()
        updateTicket(getCollection)  
      } catch(err){
        toast.add({ severity: 'error', summary: 'Wystąpił Problem', detail: err.message, life: 5000})
      }
      
      async function updateTicket(doc) {
        checkOffline.value = setTimeout(() => {
          toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Dane zostaną zaktualizowane po przywróceniu połączenia.', life: 0})
        }, 2500)

        if (doc.exists) {
          try {
            await collectionReference.update({...updatedTicket})
            clearTimeout(checkOffline.value)
            showNotification()
          } catch (err) {
            if(err.code == 'permission-denied') toast.add({severity:'error', summary: 'Aktualizacja', detail: 'To konto nie posiada uprawnień do wykonywania zmian!', life: 6000})
            toast.add({ severity: 'error', summary: 'Wystąpił Problem', detail: err.message, life: 5000})
          }
        } else {
          clearTimeout(checkOffline.value)
          toast.add({ severity: 'error', summary: 'Wystąpił Problem', detail: `Zlecenie musiało zostać wczesniej usunięte, więc nie można go było zaktualizować`, life: 6000})
          router.go(-1)
        }

        function showNotification() {
          toast.removeAllGroups()
          toast.add({ severity: 'success', summary: 'Aktualizacja', detail: 'Poprawnie zaktualizowano dane zlecenia', life: 4000})
        }

      }
  }

    function setWOItems(data){
      ticketDetails.value['Wykonane_uslugi_czesci'] = data
    }

      function calcTotalCosts(order) {
        let totalGross = 0
        let totalNet = 0
        order.forEach(item => {
          totalGross += Number(item['totalCost_gross'])
          totalNet += Number(item['totalCost_net'])
        })
        return `<div>Suma Brutto: <span style="color: var(--primary-color)">${totalGross.toFixed(2)} </span>PLN</div>
                <div>Suma Netto: <span style="color: var(--primary-color)" >${totalNet.toFixed(2)} </span>PLN</div>`
    }
      

    async function OpenInvoiceVizualization() {
        const invoiceData = {
          phoneNum: currentPhoneNum,
          vehicleVIN: ticketDetails.value['VIN'],
          ticketID: route.params.ticketDetails
        }
        store.commit('setInvoiceData', invoiceData)
        router.push('/generuj-fakture')
      }

      function showStatus(path){
        if(path == 'wolne') return 'Nowy'
        if(path == 'obecne') return 'W trakcie realizacji'
        if(path == 'zakonczone') return 'Zakończony'
      }


    function openRelocateDialog(ticketInfo) {
      modalMsg.value = `Gdzie przenosimy zlecenie ${ticketInfo['Tel']}?`
      showModal.value = true
    }

    async function modalResponse(response, newLocation) {
      const { id } = ticketDetails.value

      if (response == true) {
        store.commit('setTargetCar', ticketDetails.value)
        if (newLocation == route.params.collectionPath) {
         toast.add({ severity: 'info', summary: 'Zmień target', detail: `Nie można przenieść zlecenia do tej samej lokalizacji..`, life: 4000})
         return
        }

        const { ConfirmRelocate, clientIsOffline} = await RelocateTicket('ticket', ticketDetails.value, tickets, route.params.collectionPath, newLocation, id)
        if (ConfirmRelocate !== false) {
          router.push(`/${newLocation}`)
          toast.removeAllGroups()
          toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: `Pomyślnie przeniesiono zlecenie do ${newLocation}`, life: 4000})
        }
        if(clientIsOffline)toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Bez połączenia z siecią przenoszenie zleceń nie jest możliwe.', life: 0})

      }
      return showModal.value = false
    }

    const onRowEditInit = (event) => {
      originalRows.value[event.index] = {...ticketDetails?.value['Wykonane_uslugi_czesci'][event.index]}
    }
    const onRowEditCancel = (event) => {
      ticketDetails.value['Wykonane_uslugi_czesci'][event.index] = originalRows.value[event.index]
    }

    onMounted(() => {
      fetchData()
    })

    // ponizej fix na przejscie z details/... to zlecen
    // watch(() => route.params.ticketDetails, () => {
    //   console.log(route.path);
    //   if (route.path.includes('details')) fetchData()
    // })
    watch(() => route.params.collectionPath, () => route.path.includes('details') ? fetchData() : '')

    return {
      ticketDetails,
      calcTotalCosts,

      OpenInvoiceVizualization,
      ComputedShowTotalNet,
      ComputedShowTotalGross,

      showModal,
      modalMsg,
      CustomRelocateConfirmDialog,

      openRelocateDialog,
      modalResponse,
      confirmDeleteModal,

      WorkOrderForm,

      DataTable,
      Column,
      copyToClipboard,

      onRowEditInit,
      onRowEditCancel,
      editingRows,
      originalRows,

      setWOItems,
      updateTicket,
      showStatus,

      ProgressSpinner,
      isLoading
    }
  }
}
</script>

<style>
.p-inputnumber-input{
  max-width: 100px;
}
</style>