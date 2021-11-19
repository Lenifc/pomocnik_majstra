<template>
  <div class="p-d-flex p-flex-column">
    <div class="p-d-flex p-flex-column p-ai-center p-jc-center">
    <Button label="Dodaj Pojazd" icon="pi pi-plus-circle" @click="openVehicleAddForm()"
      class="p-button-outlined p-button-success p-d-flex p-ai-center p-mt-5" />
        <Button class="p-button-secondary p-flex column p-mt-3" @click="getVehiclesFromFirebase('all')" label="Załaduj wszystkie pojazdy" 
                v-if="!disableNextButton" :icon="(!recivedVehicles || isLoading) ? 'pi pi-spin pi-spinner' : 'pi pi-download'" />
      </div>
    

    <DataTable :value="recivedVehicles" responsiveLayout="stack" breakpoint="1280px" stripedRows :paginator="true" :rows="countClientPages || 20"
    showGridlines v-model:filters="tableFilters" filterDisplay="menu" :loading="!recivedVehicles || isLoading" 
    class="p-my-5" dataKey="VIN">
      <template #header>
        <div class="p-d-flex p-jc-between p-flex-column p-flex-sm-row">
          <Button icon="pi pi-filter-slash" label="Wyczyść" class="p-button-outlined" @click="clearTableFilters()" v-tooltip.bottom="`Wyczyść filtry`" />
                  <div class="p-my-3 p-my-sm-0 p-text-center">Wczytano {{ recivedVehicles?.length }} z {{ totalNumberOfVehicles }} pojazdów</div>
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
              <i class="fas fa-edit p-pr-3" v-tooltip.bottom="'Edytuj dane pojazdu'" @click="openVehicleEditForm(data)"></i>
              <i class="fas fa-trash-alt" v-tooltip.right="'Usuń pojazd z bazy'"
                      @click="confirmDeleteModal(data, data.VIN)"></i>
            </div>
            <div class="p-d-flex p-flex-row">
              <i class="fas fa-info-circle p-pr-2" v-tooltip.bottom="'Szczegółowe dane klienta'" @click="redirectToCarDetails(data)"></i>
              <i class="pi pi-user-plus size2" v-if="!data?.Tel" v-tooltip.right="'Przypisz pojazd do klienta'" @click="openVehicleEditForm(data)"></i>
              <i class="pi pi-user-minus size2" v-if="data?.Tel" v-tooltip.right="'Usuń pojazd z bazy'" @click="relocateFunc(data, data.VIN)"></i>
            </div>
          </div>

        </template>
      </Column>
      <Column field="Tel2" class="p-d-none" />
      <Column field="Tel" header="Numer Telefonu Klienta" class="p-text-center" style="min-width:125px; max-width:145px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.Tel}}</div>
          </div>
        </template>
      </Column>
      <Column field="Marka" header="Pojazd" class="p-text-center" style="width:175px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{`${data.Marka} ${data.Model}`}}</div>
            <div class="pointer">{{`${data.Wersja_Rocznik || ''}`}}</div>
          </div>
        </template>
      </Column>
      <Column field="Model" class="p-d-none" />
      <Column field="Wersja_Rocznik" class="p-d-none" />
      <Column field="Numer_rejestracyjny" header="Numer rejestracyjny" class="p-text-center" style="width:120px; overflow:hidden ">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.Numer_rejestracyjny}}</div>
          </div>
        </template>
      </Column>
      <Column field="VIN" header="Numer VIN" class="p-text-center" style="max-width:250px; overflow: hidden">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.VIN}}</div>
          </div>
        </template>
      </Column>
      <Column field="Przebieg" header="Przebieg" class="p-text-center" style="width:150px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.Przebieg}} {{data.Przebieg ? 'km' : null}}</div>
          </div>
        </template>
      </Column>
      <Column field="Opis" header="Opis" class="p-text-center" style="width:250px">
      <template #body="{data}">
        <div v-html="data.Opis" class="p-px-3 p-text-wrap" ></div>
      </template>
      </Column>
    </DataTable>

    <Button class="p-button-secondary p-mb-6" @click="getVehiclesFromFirebase('more')" 
    label="Załaduj więcej pojazdów" v-if="!disableNextButton" icon="pi pi-download" />

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
import { callTicketsHistory } from '@/components/fetchTicketHistory.js'

import { DeleteFunc, relocateCarToUnassigned } from '@/components/EditMoveDeleteOptions.js'

 export default {

   setup() {
     const store = useStore()
     const Router = useRouter()
     const toast = useToast()
     const confirm = useConfirm()

     const searchValue = ref()
     const allTickets = ref()
     const isThereAnyTicket = ref()

     const recivedVehicles = ref()
     const limit = ref(50)
     const totalNumberOfVehicles = ref(0)
     const disableNextButton = ref(true)
     const isLoading = ref(true)
     const countClientPages = ref()

     const tableFilters = reactive({ 'global': { value: '', matchMode: FilterMatchMode.CONTAINS }})
     const clearTableFilters = () => { tableFilters['global'].value = '' }

     const MainPath = firebase.firestore()
       .collection('warsztat').doc('Pojazdy').collection('VIN')

     const totalVehiclesPath = firebase.firestore()
       .collection('warsztat').doc('Pojazdy')


    async function relocateFunc(carData, target, extraInfo) {
      const confirmUnassign = await relocateCarToUnassigned(carData, target)
        if (confirmUnassign !== false) {
          toast.removeAllGroups()
          if(carData.Tel) toast.add({severity:'success', detail:'Pomyślnie usunięto powiązanie pojazdu z klientem.', life: 4000})
          if(extraInfo) toast.add({severity:'info', detail:'Pojazd zawiera historię serwisową przez co nie można go całkowicie usunąć z bazy.', life: 8000})
          recivedVehicles.value.map(car => car.VIN == target ? car.Tel = '' : car)
        }
    }

     async function getVehiclesFromFirebase(req) {
       if (req == 'more') limit.value += 100

       let vehiclePath = MainPath
         .orderBy("Ostatnia_Aktualizacja", "desc")
         .limit(limit.value)

       if (req == 'all') {
         vehiclePath = MainPath.orderBy("Ostatnia_Aktualizacja", "desc")
         isLoading.value = true
       }

       let clientResponse = await vehiclePath.get()

       totalNumberOfVehicles.value = (await totalVehiclesPath.get()).data().Pojazdy

       if (!clientResponse.docs.length) {
         disableNextButton.value = true
         toast.add({ severity: 'info', detail: 'Wczytano wszystkie pojazdy', life: 4000 })
       }

       recivedVehicles.value = clientResponse.docs.map(doc => doc.data())

       isLoading.value = false
       disableNextButton.value = false

       if (req == 'all' || clientResponse.docs.length < limit.value) {
         disableNextButton.value = true
         toast.add({ severity: 'info', detail: 'Wczytano wszystkie pojazdy', life: 4000 })
       }
     }

     const confirmDeleteModal = async (vehicleData, target) => {
       // console.log(vehicleData, target);
       allTickets.value = await callTicketsHistory(target)

       setTimeout(() => {
        //  console.log(allTickets.value)
         isThereAnyTicket.value = allTickets.value.some(ticket => ticket[1].length > 0)
       }, 500)

       confirm.require({
         message: `Czy na pewno chcesz usunąć pojazd klienta ${vehicleData.Tel}\n o numerze VIN: ${target}?\n 123`,
         header: `Usuń pojazd`,
         icon: 'pi pi-exclamation-triangle',
         acceptClass: 'p-button-success',
         rejectClass: 'p-button-danger',
         acceptLabel: 'Tak',
         rejectLabel: 'Nie',
         accept: async () => {
           const { VIN } = vehicleData

            //  console.log(isThereAnyTicket.value)
             if(isThereAnyTicket.value == false){
               const confirmDelete = await DeleteFunc('car', MainPath, target) // prosta konwersja proxy do objektu
               if (confirmDelete !== false) {
                  recivedVehicles.value = recivedVehicles.value.filter(car => {
                    return car.VIN != VIN
                 })
                  toast.add({ severity: 'success', detail: 'Pomyślnie usunięto pojazd z listy klienta.', life: 4000})
               }
             }
                else if(isThereAnyTicket.value == true){
                  await relocateFunc(JSON.parse(JSON.stringify(vehicleData)), target, 'extraInfo') // prosta konwersja proxy do objektu
                }
             else{
               toast.add({ severity: 'warn', detail: 'To nie powinno sie pokazac, sprawdz logi....', life: 0})
             }
         },
         reject: async () => {}
       })
     }

     function openVehicleEditForm(item) {
       store.commit('setTargetCar', item)
       Router.push(`/pojazd/${item.VIN}/edytuj`)
     }

     function openVehicleAddForm() {
       Router.push('/pojazd/dodaj')
     }

     function redirectToCarDetails(car) {
       store.commit('setTargetCar', car)
       Router.push(`/szczegoly/${car.VIN}`)
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
       getVehiclesFromFirebase()
       limit.value = 50
     })

     return {
       recivedVehicles,

       openVehicleEditForm,
       openVehicleAddForm,
       redirectToCarDetails,

       getVehiclesFromFirebase,
       totalNumberOfVehicles,
       disableNextButton,

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

       relocateCarToUnassigned,
       relocateFunc
     }

   }
 }
</script>
<style scoped>

.pi-user-plus,
.pi-user-minus{
  font-size: 1.6rem;
  margin-left: 8px;
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