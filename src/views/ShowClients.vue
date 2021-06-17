<template>
  <ConfirmDialog :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}" />
  <div class="p-d-flex p-flex-column p-ai-center">

    <Button label="Dodaj Klienta" icon="pi pi-user-plus" @click="openClientAddForm()"
      class="p-button-secondary p-mt-5 removeMarginLeft" />

    <DataTable :value="recivedClients" responsiveLayout="stack" breakpoint="1250px" stripedRows 
    showGridlines v-model:filters="tableFilters" filterDisplay="menu" :loading="!recivedClients" 
    class="p-my-5" dataKey="Tel">
      <template #header>
        <div class="p-d-flex p-jc-between columnOnSmallScreen">
          <Button icon="pi pi-filter-slash" label="Wyczyść" class="p-button-outlined" @click="clearTableFilters()" />
              <Button class="p-button-secondary" @click="getClientsFromFirebase('all')" 
                  label="Załaduj wszystkich klientów" v-if="!disableNextButton" icon="pi pi-download"/>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="tableFilters['global'].value" placeholder="Wyszukaj..." class="mobileWidth"/>
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
              <i class="fas fa-edit p-pr-3" v-tooltip.right="'Edytuj dane klienta'" @click="openClientEditForm(data)"></i>
              <i class="fas fa-trash-alt" v-tooltip.right="'Usuń klienta z jego pojazdami'"
                      @click="confirmDeleteModal(data, 'removeClient', onlyCars(data).length)"></i>
            </div>
            <div class="p-d-flex p-flex-row">
              <i class="fas fa-info-circle p-pr-2" v-tooltip.right="'Szczegółowe dane klienta'"></i>
              <i class="fas fa-plus" v-tooltip.right="'Przypisz pojazd do klienta'" @click="openVehicleAddForm(data.Tel)"><i class="fas fa-car"></i></i>
            </div>
          </div>

        </template>
      </Column>
      <Column field="Tel" header="Numer Telefonu" class="p-text-center" style="width:125px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column">
            <div class="pointer" @dblclick="copyValue($event)">{{data.Tel}}</div>
            <div class="pointer" @dblclick="copyValue($event)" v-if="data.Tel2"> {{ data.Tel2 }}</div>
          </div>
        </template>
      </Column>
      <Column field="Imie" header="Imie" class="p-text-center" style="width:145px">
      <template #body="{data}">
          <div class="pointer" @dblclick="copyValue($event)">{{data.Imie}}</div>
        </template></Column>
      <Column field="Opis" header="Opis" class="p-text-center" style="width:250px">
      <template #body="{data}">
        <div v-html="data.Opis" class="p-px-4 p-text-wrap mobileWrap" ></div>
      </template>
      </Column>
      <!-- <Column field="Adres" header="Adres" class="p-text-center"></Column> -->
      <Column header="Pojazd" class="p-text-center" style="width:250px" field="Marka" >
        <template #body="{data}"> 
          <!-- zamiast pisac SlotProps.data moge uzyc destrukturyzacji i skrocic zapis -->
          <div class="p-d-flex p-flex-column"> <!-- trzeba bylo oplesc to jeszcze w jednego DIVa, bo inaczej pod telefony zle wyswietlalo pojazdy -->
            <div v-for="car in onlyCars(data)" :id="`id${car.VIN}`" :key="car.VIN"
            class="p-d-flex p-flex-column Cars">
            <div class="p-d-flex p-flex-row p-ai-center p-jc-between">
              <div class="p-d-flex p-flex-column">
                <div class="p-text-center p-text-wrap p-text-bold pointer" @dblclick="copyValue($event)">{{`${car.Marka} ${car.Model}`}}</div>
                <div class="p-text-nowrap p-text-truncate pointer" style="width:200px; max-width:225px" @dblclick="copyValue($event)">{{car.VIN}}</div>
              </div>
              <div class="p-d-flex p-flex-row p-jc-end p-ai-center">
                <i class="fas fa-info" v-tooltip.top="'Szczegóły pojazdu'" @click="redirectToCarDetails(car)"></i>
                <i class="fas fa-edit p-pr-1 p-pl-2" v-tooltip.top="'Edytuj dane pojazd'" @click="openVehicleEditForm(car)"></i>
                <i class="fas fa-trash-alt" v-tooltip.top="'Usuń pojazd'" 
                @click="confirmDeleteModal(data, 'removeCar', car.VIN)"></i>
              </div>
            </div>
            <Divider class="lookForLast" />
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
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast"

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Divider from 'primevue/divider';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";

import copyToClipboard from '@/components/copyToClipboard.js'

import { DeleteFunc } from '@/components/EditMoveDeleteOptions.js'

require('firebase/firestore')

 export default {

   setup() {
     const store = useStore()
     const Router = useRouter()
     const toast = useToast()
     const confirm = useConfirm();

     const recivedClients = ref()
     const recivedVehicles = ref()
     const limit = ref(50)
    //  const lastDoc = ref(0)
     const disableNextButton = ref(true)
     const countClientCars = ref(0)

    const tableFilters = ref({
      'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
    const clearTableFilters = () => {
      tableFilters.value = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
      }
    }

     const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

     async function getClientsFromFirebase(req) {
       if(req == 'more') limit.value += 100

      let clientPath = MainPath
      .orderBy("Ostatnia_Aktualizacja", "desc")
       .limit(limit.value)

       if(req == 'all') clientPath = MainPath.orderBy("Ostatnia_Aktualizacja", "desc")

       let clientResponse = await clientPath.get()

      //  lastDoc.value = clientResponse.docs[clientResponse.docs.length - 1]

       if (!clientResponse.docs.length) {
        disableNextButton.value = true
        toast.add({severity:'info', detail:'Wczytano wszystkich klientów', life: 4000})
       }

       recivedClients.value = clientResponse.docs.map(doc => doc.data())

      disableNextButton.value = false
        if(req == 'all' || clientResponse.docs.length < limit.value) {
          disableNextButton.value = true
          toast.add({severity:'info', detail:'Wczytano wszystkich klientów', life: 4000})
     }
     }

        const confirmDeleteModal = (clientData, operation, target) => {
      confirm.require({
        message: operation == 'removeClient' ?
          `Czy napewno chcesz usunąć klienta o podanym numerze telefonu: ${clientData['Tel']}?` : 
          (operation == 'removeCar' ? 
            `Czy na pewno chcesz usunąć pojazd klienta ${clientData.Tel}\n o numerze VIN: ${target}?` : 'Jezeli sie to wyswietla to jest cos do poprawy!'),
        header: operation == 'removeClient' ?
          `Usuń klienta` : (operation == 'removeCar' ? `Usuń pojazd` : 'Jezeli sie to wyswietla to jest cos do poprawy!'),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-success',
        rejectClass: 'p-button-danger',
        acceptLabel: 'Tak',
        rejectLabel: 'Nie',
        accept: async () => {
          const { Tel } = clientData

          if (operation == 'removeClient') {
            const confirmDelete = await DeleteFunc('client', MainPath, Tel, target)
            if (confirmDelete !== false) recivedClients.value = recivedClients.value.filter(client => client.Tel != Tel)
          }
          if (operation == 'removeCar') {
            const confirmDelete = await DeleteFunc('car', MainPath, Tel, target, JSON.parse(JSON.stringify(clientData))) // prosta konwersja proxy do objektu
            if (confirmDelete !== false) {
              recivedClients.value.map(client => {
                if (client.Tel == Tel) delete client[`${target}`]
              })
            }
          }
        },
        reject: () => {}
      });
    }

     function openClientEditForm(item) {
       store.commit('setTargetClient', item)
       Router.push(`/klient/${item.Tel}/edytuj`)
     }

     function openClientAddForm(){
       Router.push(`/klient/dodaj`)
     }

     function openVehicleEditForm(item) {
       store.commit('setTargetCar', item)
       Router.push(`/pojazd/${item.VIN}/edytuj`)
     }

     function openVehicleAddForm(Tel){
       store.commit('setNumberForNewVehicle', Tel)
       Router.push('/pojazd/dodaj')
     }

     function redirectToCarDetails(car){
       store.commit('setTargetCar', car)
       Router.push(`/details/${car.VIN}`)
     }

    function onlyCars(client){
      return Object.values(client).filter(item => item instanceof Object)
    }

    async function copyValue(e){
      const text = e.target?.innerText
      await copyToClipboard(text)

      toast.add({severity:'info', summary: 'Wartość skopiowana', detail:`Wartość "${text}" została skopiowana do schowka`, life: 3000})
    }


     onMounted(() => {
       getClientsFromFirebase()
        limit.value = 50
     })

     return {
       recivedClients,
       recivedVehicles,

       openClientEditForm,
       openVehicleEditForm,

       openVehicleAddForm,
       openClientAddForm,

       onlyCars,
       getClientsFromFirebase,
       disableNextButton,
       countClientCars,
       redirectToCarDetails,

       FilterMatchMode,
       DataTable,
       Column,
       Divider,

       tableFilters,
       clearTableFilters,

       copyValue,

       confirmDeleteModal,
       ConfirmDialog
     }

   }
 }
</script>
<style scoped>

.fa-plus{
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
.removeMarginLeft{
  margin-left: -120px;
}

/* @media(max-width:1250px){
  .Cars > .p-divider{
  display: none;
} */
/* } */

@media(max-width:800px){
  .columnOnSmallScreen{
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  .removeMarginLeft{
    margin-left:0px
  } 
}
</style>