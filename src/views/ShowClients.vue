<template>
  <div class="p-d-flex p-flex-column">

    <div class="p-d-flex p-flex-column p-ai-center p-jc-center">
      <Button label="Dodaj Klienta" icon="pi pi-user-plus" @click="openClientAddForm()"
              class="p-button-outlined p-button-success p-d-flex p-ai-center p-mt-5" />
      <Button class="p-button-secondary p-flex column p-mt-3" @click="getClientsFromFirebase('all')" label="Załaduj wszystkich klientów" 
              v-if="!disableNextButton" :icon="(!recivedClients || isLoading) ? 'pi pi-spin pi-spinner' : 'pi pi-download'" 
              v-tooltip.bottom="`W przypadku dużej ilości klientów ładowanie może chwile potrwać`" />
    </div>

    <DataTable :value="recivedClients" responsiveLayout="stack" breakpoint="1280px" stripedRows :paginator="true" :rows="countClientPages || 20"
    showGridlines v-model:filters="tableFilters" filterDisplay="menu" :loading="!recivedClients || isLoading" 
    class="p-my-5" dataKey="Tel">
      <template #header>
        <div class="p-d-flex p-jc-between p-flex-column p-flex-sm-row">
          <Button icon="pi pi-filter-slash" label="Wyczyść" class="p-button-outlined" @click="clearTableFilters()" v-tooltip.bottom="`Wyczyść filtry`" />
                  <div class="p-my-3 p-my-sm-0 p-text-center">Wczytano {{ recivedClients?.length }} z {{ totalNumberOfClients }} klientów</div>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText placeholder="Wyszukaj..." v-model="searchValue" @keyup="showEvent($event)" v-tooltip.bottom="'Wyszukiwanie aktywuje się po podaniu 3 znaków'"/>
          </span>
        </div>
      </template>
      <template #empty>
        Nie znaleziono szukanej frazy.
      </template>
      <template #loading>
        Pobieranie danych z serwera...
      </template>

      <Column style="width:45px" class="p-text-center">
        <template #body="{index}">
          {{index+1}}
        </template>
      </Column>
      <Column header="OPCJE" class="p-text-center" style="width:64px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column p-ai-center">
            <div class="p-d-flex p-flex-row p-pb-2">
              <i class="fas fa-edit p-pr-3" v-tooltip.bottom="'Edytuj dane klienta'" @click="openClientEditForm(data)"></i>
              <i class="fas fa-trash-alt" v-tooltip.right="'Usuń klienta z jego pojazdami'"
                      @click="confirmDeleteModal(data, 'removeClient', '')"></i>
            </div>
            <div class="p-d-flex p-flex-row">
              <i class="fas fa-info-circle p-pr-2" v-tooltip.bottom="'Szczegółowe dane klienta'" @click="redirectToClientDetails(data)"></i>
              <i class="fas fa-plus" v-tooltip.right="'Przypisz pojazd do klienta'" @click="openVehicleAddForm(data.Tel)"><i class="fas fa-car"></i></i>
            </div>
          </div>

        </template>
      </Column>
      <Column field="Tel2" class="p-d-none" />
      <Column field="Tel" header="Numer Telefonu" class="p-text-center" style="width:125px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.Tel}}</div>
            <div class="pointer" v-if="data.Tel2"> {{ data.Tel2 }}</div>
          </div>
        </template>
      </Column>
      <Column field="Imie" header="Imie" class="p-text-center" style="width:145px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.Imie}}</div>
            <div class="pointer" v-if="data.NIP"> {{ data.NIP }}</div>
          </div>
        </template>
      </Column>
      <Column field="Opis" header="Opis" class="p-text-center" style="width:250px">
      <template #body="{data}">
        <div v-html="data.Opis" class="p-px-4 p-text-wrap" ></div>
      </template>
      </Column>
      <Column header="Pojazd" class="p-text-center" style="width:270px" field="Pojazdy">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column smallerFontOnPhones lowerMargin" @dblclick="copyValue($event)"> <!-- trzeba bylo oplesc to jeszcze w jednego DIVa, bo inaczej pod telefony zle wyswietlalo pojazdy -->
            <div v-for="car in onlyCars(data.Tel)" :id="`id${car.VIN}`" :key="car.VIN"
            class="p-d-flex p-flex-column Cars">
            <div class="p-d-flex p-flex-row p-ai-center p-jc-between">
              <div class="p-d-flex p-flex-column">
                <div class="p-text-center p-text-wrap p-text-bold pointer">{{`${car.Marka} ${car.Model}`}}</div>
                <div class="p-text-nowrap p-text-truncate pointer width160OnPhones" style="width:220px; max-width:225px">{{car.VIN}}</div>
              </div>
              <div class="p-d-flex p-flex-row p-jc-end p-ai-center lowerMargin p-pl-1">
                <i class="fas fa-minus" v-tooltip.bottom="'Usuń powiązanie pojazdu z klientem'" 
                  @click="relocateFunc(car, car.VIN)"><i class="fas fa-car"></i></i>
                <i class="fas fa-info-circle p-px-2" v-tooltip.top="'Szczegóły pojazdu'" @click="redirectToCarDetails(car, data)"></i>
                <i class="fas fa-edit" v-tooltip.bottom="'Edytuj dane pojazd'" @click="openVehicleEditForm(car)"></i>
              </div>
            </div>
            <Divider />
          </div>
          </div>
          
        </template>
      </Column>
    </DataTable>

    <Button class="p-button-secondary p-mb-6" @click="getClientsFromFirebase('more')" 
            label="Załaduj więcej klientów" v-if="!disableNextButton" icon="pi pi-download" />

  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast"

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Divider from 'primevue/divider';
import { useConfirm } from "primevue/useconfirm";

import copyToClipboard from '@/components/copyToClipboard.js'

import { DeleteFunc, relocateCarToUnassigned } from '@/components/EditMoveDeleteOptions.js'

 export default {

   setup() {
     const store = useStore()
     const Router = useRouter()
     const toast = useToast()
     const confirm = useConfirm()

     const searchValue = ref()

     const recivedClients = ref()
     const recivedVehicles = ref()
     const limit = ref(50)
     const totalNumberOfClients = ref(0)
     const disableNextButton = ref(true)
     const isLoading = ref(true)
     const countClientPages = ref()

     const tableFilters = reactive({ 'global': { value: '', matchMode: FilterMatchMode.CONTAINS }})
     const clearTableFilters = () => { tableFilters['global'].value = '' }

     const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

     const vehiclePath = firebase.firestore()
       .collection('warsztat').doc('Pojazdy').collection('VIN')

     const totalClientsPath = firebase.firestore()
       .collection('warsztat').doc('Klienci')

    async function relocateFunc(carData, target, extraInfo) {
      const confirmUnassign = await relocateCarToUnassigned(carData, target)
        if (confirmUnassign !== false) {
          toast.removeAllGroups()
          toast.add({severity:'success', detail:'Pomyślnie usunięto powiązanie pojazdu z klientem.', life: 4000})
          if(extraInfo) toast.add({severity:'info', detail:'Pojazd zawiera historię serwisową przez co nie można go całkowicie usunąć z bazy.', life: 8000})
          recivedVehicles.value.map(car => car.VIN == target ? car.Tel = '' : car)
        }
    }

     async function getClientsFromFirebase(req) {
       if (req == 'more') limit.value += 100

       let clientPath = MainPath
         .orderBy("Ostatnia_Aktualizacja", "desc")
         .limit(limit.value)

       if (req == 'all') {
         clientPath = MainPath.orderBy("Ostatnia_Aktualizacja", "desc")
         isLoading.value = true
         toast.add({ severity: 'warn', summary: "Możliwe spore obciążenie", detail: 'W przypadku bardzo dużej ilości klientów ładowanie może zająć nawet 10 sekund!', life: 0})
       }

       let clientResponse = await clientPath.get()
       let vehicleResponse = await vehiclePath.get()

       totalNumberOfClients.value = (await totalClientsPath.get()).data().Klienci

       if (!clientResponse.docs.length) {
         disableNextButton.value = true
         toast.add({ severity: 'info', detail: 'Wczytano wszystkich klientów', life: 4000 })
       }

       recivedClients.value = clientResponse.docs.map(doc => doc.data())
       recivedVehicles.value = vehicleResponse.docs.map(doc => doc.data())

       isLoading.value = false
       disableNextButton.value = false

       if (req == 'all' || clientResponse.docs.length < limit.value) {
         disableNextButton.value = true
         toast.removeAllGroups()
         toast.add({ severity: 'info', detail: 'Wczytano wszystkich klientów', life: 4000 })
       }
     }

     const confirmDeleteModal = async (clientData, operation) => {

       confirm.require({
         message: operation == 'removeClient' ?
           `Czy napewno chcesz usunąć klienta o podanym numerze telefonu: ${clientData['Tel']}?` : 'Jezeli sie to wyswietla to jest cos do poprawy!',
         header: operation == 'removeClient' ? `Usuń klienta` : 'Jezeli sie to wyswietla to jest cos do poprawy!',
         icon: 'pi pi-exclamation-triangle',
         acceptClass: 'p-button-success',
         rejectClass: 'p-button-danger',
         acceptLabel: 'Tak',
         rejectLabel: 'Nie',
         accept: async () => {
           const { Tel } = clientData

             const confirmDelete = await DeleteFunc('client', MainPath, Tel)
             if (confirmDelete !== false) {
               recivedClients.value = recivedClients.value.filter(client => client.Tel != Tel)
               toast.removeAllGroups()
               toast.add({ severity: 'success', detail: 'Pomyślnie usunięto dane klienta', life: 4000 })
             }
         },
         reject: async () => {}
       })
     }

     function openClientEditForm(item) {
       store.commit('setTargetClient', item)
       Router.push(`/klient/${item.Tel}/edytuj`)
     }

     function openClientAddForm() {
       Router.push(`/klient/dodaj`)
     }

     function openVehicleEditForm(item) {
       store.commit('setTargetCar', item)
       Router.push(`/pojazd/${item.VIN}/edytuj`)
     }

     function openVehicleAddForm(Tel) {
       store.commit('setNumberForNewVehicle', Tel)
       Router.push('/pojazd/dodaj')
     }

     function redirectToCarDetails(car, data) {
       store.commit('setTargetCar', car)
       store.commit('setTargetClient', data)
       Router.push(`/szczegoly/${car.VIN}`)
     }

     function redirectToClientDetails(client) {
       store.commit('setTargetClient', client)
       Router.push(`/szczegoly/client/${client.Tel}`)
     }

     function onlyCars(clientTel) {
       return recivedVehicles.value.map(car => car).filter(item => item?.Tel == clientTel)
     }

     function showEvent(e) {
       searchValue.value = e.target.value

       if (searchValue.value.trim().length > 2) tableFilters['global'].value = searchValue.value.trim()
       else tableFilters['global'].value = ''
     }

     async function copyValue(e) {
       const text = e.target?.innerText
       await copyToClipboard(text)
       toast.add({
         severity: 'info',
         summary: 'Wartość skopiowana',
         detail: `Wartość "${text}" została skopiowana do schowka`,
         life: 3000
       })
     }


     onMounted(() => {
       if(localStorage.getItem('countClientPages')) countClientPages.value = JSON.parse(localStorage.getItem('countClientPages'))
       getClientsFromFirebase()
       limit.value = 50
     })

     return {
       recivedClients,

       openClientEditForm,
       openVehicleEditForm,

       openVehicleAddForm,
       openClientAddForm,

       onlyCars,
       getClientsFromFirebase,
       totalNumberOfClients,
       disableNextButton,
       redirectToCarDetails,
       redirectToClientDetails,

       FilterMatchMode,
       DataTable,
       Column,
       Divider,

       tableFilters,
       clearTableFilters,

       copyValue,

       confirmDeleteModal,

       isLoading,
       showEvent,
       searchValue,
       countClientPages,

       relocateFunc
     }

   }
 }
</script>
<style scoped>

.fa-plus,
.fa-minus{
  font-size: 0.75rem!important;
  display: flex;
  align-items: center;
}

.fa-car, .fa-edit, .fa-trash-alt, .fa-info-circle{
  font-size: 1.66rem;
}

.Cars:last-child > .p-divider{
  display: none;
}

@media(max-width:1370px){
  .lowerMargin{
    margin-left: -16px;
  }
}
@media(max-width:1280px){
  .lowerMargin{
    margin-left: 0px;
  }
  .DescriptionDisplayNone{
    display: none;
  }
}

@media(max-width:500px){
  .smallerFontOnPhones{
    font-size: 0.9rem;
  }
  .width160OnPhones{
    width: 160px!important;
  }
}
</style>