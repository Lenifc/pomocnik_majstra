<template>
  <CustomRelocateConfirmDialog :message="modalMsg" v-if="showModal" @true="(status, newLocation) => modalResponse(status, newLocation)" @false="modalResponse(false)" />
    
    <Card class="p-mt-6 relative">
      <template #title>
        <div class="closeForm" @click="$router.go(-1)">&times;</div>
        <div class="p-text-center">SZCZEGÓŁY zlecenia {{$route.params.ticketDetails}}</div>
      </template>
      <template #content>
        <div :id="carDetails?.['id']" class="column">
         <div class="row">
          <div class="client">
            <div class="row">
              <h3>Klient:</h3>
            </div>
            <div>Imie: {{ carDetails?.['Imie'] }}</div>
            <div>Numer Telefonu: {{ carDetails?.['Tel'] }}</div>
            {{carDetails}}
          </div>
          <div class="vehicle">
            <div class="row">
              <h3>Pojazd:</h3>
            </div>
            <div>Marka: {{ carDetails?.['Marka'] }}</div>
            <div>Model: {{ carDetails?.['Model'] }}</div>
            <div>Rok_prod: {{ carDetails?.['Rok_prod'] }}</div>
            <div>VIN: {{ carDetails?.['VIN'] }}</div>
            <div>Tablice: {{ carDetails?.['Numer_rejestracyjny'] }}</div>
            <div>Paliwo: {{ carDetails?.['Paliwo'] }}</div>
            <div>Silnik: {{ carDetails?.['Silnik'] }}</div>
            <div>Napęd: {{ carDetails?.['Naped'] }}</div>
            <div>Skrzynia biegów: {{ carDetails?.['SkrzyniaBiegow'] }}</div>
            <div>Przebieg: {{ carDetails?.['Przebieg'] }}</div>
            <div>Opis: {{ carDetails?.['Opis'] }}</div>
          </div>
        </div> 
        <div class="row">
              <h3>Szczegóły zlecenia:</h3>
            </div>
        <div>Zlecenie dodane: {{ carDetails?.['Dodane_Czas'] }}</div>
        <div v-if="$route.params.collectionPath == 'zakonczone'">Zlecenie zakonczone:
          {{ carDetails?.['Zakonczone_Czas'] }}</div>
        </div>

<!--  wykonac CRUD i wypuscic to do osobnego komponentu!-->
        <DataTable :value="carDetails?.['Wykonane_uslugi_czesci']" editMode="row" dataKey="id"
          v-model:editingRows="editingRows" @rowEditInit="onRowEditInit" @rowEditCancel="onRowEditCancel"
          responsiveLayout="scroll" stripedRows showGridlines class="p-datatable-sm p-pt-4" v-if="carDetails?.['Wykonane_uslugi_czesci'].length">
          <Column style="width:50px" class="p-text-center">
            <template #body="{index}">
              {{index+1}} 
            </template>
          </Column>
          <Column field="part_service_Name" header="Nazwa:">
            <template #editor="{slotProps}">
              <InputText v-model="slotProps.data[slotProps.column.props.field]" />
            </template>
          </Column>
          <Column field="quantity" header="Ilość:">
            <template #editor="slotProps">
              <InputText v-model="slotProps.data[slotProps.column.props.field]" />
            </template>
          </Column>
          <Column field="price_net" header="Netto[PLN]:" />
          <Column field="totalCost_net" header="Netto całość[PLN]:">
            <template #editor="slotProps">
              <InputText v-model="slotProps.data[slotProps.column.props.field]" />
            </template>
          </Column>
          <Column field="tax" header="Stawka VAT[%]:">
            <template #editor="slotProps">
              <InputText v-model="slotProps.data[slotProps.column.props.field]" />
            </template>
          </Column>
          <Column field="price_gross" header="Brutto[PLN]:" />
          <Column field="totalCost_gross" header="Brutto całość[PLN]:" />
          <Column header="Edytuj" :rowEditor="true" style="width: 6%; min-width:4rem" bodyStyle="text-align:center"></Column>
        </DataTable>

      </template>
      <template #footer>
        <div class="p-d-flex p-flex-column p-flex-sm-row p-jc-center">
          <Button class="p-button-danger p-mx-1 p-my-2 p-my-sm-0" @click="confirmDeleteModal(carDetails)" icon="pi pi-trash" label="Usuń" />
          <Button class="p-button-primary p-mx-1 p-my-1 p-my-sm-0" @click="HandleFunc($event)" label="Edytuj" icon="pi pi-pencil" />
          <Button class="p-button-warning p-mx-1 p-my-2 p-my-sm-0" @click="openRelocateDialog(carDetails)" label="Przenieś" icon="fas fa-arrows-alt-h" />
          <Button class="p-button-help p-mx-1 p-my-1 p-my-sm-0" @click="HandleFunc($event)" label="Generuj Fakture" icon="pi pi-print"
            v-if="$route.params.collectionPath == 'zakonczone' && carDetails?.['Wykonane_uslugi_czesci']?.length" />
        </div>
      </template>
    </Card>
</template>

<script>
import firebase from 'firebase/app'
import { DeleteFunc, RelocateTicket } from '@/components/EditMoveDeleteOptions'

import CustomRelocateConfirmDialog from '@/components/CustomRelocateConfirmDialog.vue'
  
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm"

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import copyToClipboard from '@/components/copyToClipboard.js'


export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const toast = useToast()
    const confirm = useConfirm()

    const showModal = ref(false)
    const modalMsg = ref('')

    const carDetails = ref()
    const originalRows = ref({})
    const editingRows = ref([])
    const dataToForward = ref()
    const showTotalNet = ref(0)
    const showTotalGross = ref(0)
    const ComputedShowTotalNet = computed(() => showTotalNet.value.toFixed(2))
    const ComputedShowTotalGross = computed(() => showTotalGross.value.toFixed(2))

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    const currentPhoneNum = route.params.phoneNum


    function fetchData() {
      tickets.collection(route.params.collectionPath).doc(currentPhoneNum)
        .get().then(recived => {
          // console.log(recived.data())
          let response = Object.entries(recived.data()).filter(item => item?.[1]['id'] == route.params.ticketDetails)
          carDetails.value = response[0][1]
          dataToForward.value = response[0]

          if(carDetails.value['Wykonane_uslugi_czesci']){
            carDetails.value['Wykonane_uslugi_czesci'].forEach(item =>{
              showTotalGross.value += Number(item['totalCost_gross'])
              showTotalNet.value += Number(item['totalCost_net'])
            })
          }

        }).catch(() => {
          carDetails.value = ''
          toast.add({severity:'warn', detail:`Wystąpił problem ze znalezieniem danego numeru: ${currentPhoneNum}`, life: 4000})
        })
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
          const { id, Tel } = ticketData

          const currentPath = tickets.collection(route.params.collectionPath)
          const confirmDelete = await DeleteFunc('ticket', currentPath, Tel, '', id)
          if (confirmDelete !== false) {
            router.go(-1)
            toast.removeAllGroups()
            toast.add({
              severity: 'success',
              summary: 'Potwierdzenie',
              detail: 'Pomyślnie usunięto zlecenia',
              life: 4000
            })
          }
        },
        reject: () => {}
      });
    }
      

    async function HandleFunc(e) {
      const target = e.target.innerText
      const id = e.target.parentElement.parentElement.parentElement.id
      if (target == 'Edytuj') EditFunc(id)
      if(target == 'Generuj Fakture') {
        const invoiceData = {
          phoneNum: currentPhoneNum,
          vehicleVIN: carDetails.value['VIN'],
          ticketID: route.params.ticketDetails
        }
        store.commit('setInvoiceData', invoiceData)
        router.push('/generujFakture')
      }
    }

    function openRelocateDialog(ticketInfo) {
      modalMsg.value = `Gdzie przenosimy zlecenie ${ticketInfo['Tel']}?`
      showModal.value = true
    }

    async function modalResponse(response, newLocation) {
      const { Tel } = dataToForward.value[1]

      if (response == true) {
        let ticketData = []
            ticketData[dataToForward.value[0]] = dataToForward.value[1]
          
            store.commit('setTargetCar', ticketData)
        
        
        const confirmRelocate = await RelocateTicket('ticket', ticketData, tickets, route.params.collectionPath, newLocation, Tel)
        if (confirmRelocate !== false) {
          router.go(-1)
          toast.removeAllGroups()
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: `Pomyślnie przeniesiono zlecenie do ${newLocation}`,
            life: 4000
          })
        }
        if (newLocation == route.path.substring(1)) toast.add({
          severity: 'info',
          summary: 'Zmień target',
          detail: `Nie można przenieść zlecenia do tej samej lokalizacji..`,
          life: 4000
        })
      }
      return showModal.value = false
    }

    const onRowEditInit = (event) => {
      originalRows.value[event.index] = {...carDetails?.value['Wykonane_uslugi_czesci'][event.index]}
    }
    const onRowEditCancel = (event) => {
      carDetails.value['Wykonane_uslugi_czesci'][event.index] = originalRows.value[event.index]
    }

    function EditFunc() {
      router.push(`/edytuj/${route.params.collectionPath}/${currentPhoneNum}/${route.params.ticketDetails}`)
    }

    onMounted(() => {
      fetchData()
    })

    // ponizej fix na przejscie z details/... to zlecen
    watch(() => route.params.ticketDetails, () => {
      if (route.path.includes('details')) fetchData()
    })
    watch(() => route.params.collectionPath, () => route.path.includes('details') ? fetchData() : '')

    return {
      carDetails,
      dataToForward,

      HandleFunc,
      ComputedShowTotalNet,
      ComputedShowTotalGross,

      showModal,
      modalMsg,
      CustomRelocateConfirmDialog,

      openRelocateDialog,
      modalResponse,
      confirmDeleteModal,

      DataTable,
      Column,
      copyToClipboard,

      onRowEditInit,
      onRowEditCancel,
      editingRows,
      originalRows,
    }
  }
}
</script>

<style>
.cars-details {
  margin-top: 128px;
  display: flex;
  justify-content: center;
  color: black;
  width: max(300px, 50%);
}
</style>