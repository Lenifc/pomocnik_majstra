<template>
  <div>
    <h3 class="p-text-center">Wyszukaj pojazd na którym ma być wykonane zlecenie</h3>
    <DataTable :value="recivedClients" dataKey="id" responsiveLayout="stack" stripedRows showGridlines :paginator="true" :rows="countClientPages || 20"
      class="p-datatable-sm p-pt-4 p-text-center" v-model:filters="tableFilters" filterDisplay="menu"
      :loading="isLoading" breakpoint="888px">
      <template #header>
        <div class="p-d-flex p-jc-between p-flex-column p-flex-sm-row">
          <Button icon="pi pi-filter-slash" label="Wyczyść" class="p-button-outlined" @click="clearTableFilters()" />
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText placeholder="Wyszukaj..." v-model="searchValue" @keyup="showEvent($event)" v-tooltip.bottom="'Wyszukiwanie aktywuje się po podaniu 3 znaków'" />
          </span>
        </div>
      </template>
      <template #empty>
        <div>Brak wyników</div>
      </template>
      <template #loading>
        Pobieranie danych z serwera...
      </template>
      <Column style="width: 4%; min-width:3rem" class="p-text-center">
        <template #body="{index}">
          {{index+1}}
        </template>
      </Column>
      <Column field="Imie" header="Imie klienta:" class="p-text-center"/>
      <Column field="Tel2" class="p-d-none" />
      <Column field="Tel" header="Numer kontaktowy:" class="p-text-nowrap p-text-center p-px-2">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column">
            <div>{{data.Tel}}</div>
            <div v-if="data.Tel2">{{data.Tel2}}</div>
          </div>
        </template>
      </Column>
      <Column header="Pojazdy" field="Pojazdy" style="width:350px">
        <template #body="{data}">
          <div>
            <div v-for="car in onlyCars(data.Tel)" :id="`id${car.VIN}`" :key="car.VIN" class="Cars">
              <div if="car.VIN" class="p-d-flex p-flex-row p-jc-between">
                <div class="left p-d-flex p-flex-column p-p-2">
                  <div>{{ car.Marka }} {{ car.Model }}</div>
                  <div class="p-text-nowrap p-text-truncate" style="max-width:200px">{{ car.VIN }}</div>
                </div>
                <div class="right p-d-flex p-flex-row p-ai-center">
                  <RadioButton name="select" v-model="selectedCar" :value="[car, data]" class="p-mr-2" />
                  <Button class="p-button-primary submit" v-if="selectedCar?.[0] == car"
                    @click="$emit('openClientModal', 'false')" label="Dodaj" />
                </div>
              </div>
              <Divider />
            </div>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, ref, reactive, watch } from 'vue'
import { useStore } from 'vuex'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterMatchMode } from "primevue/api";

import { useToast } from "primevue/usetoast"


require('firebase/firestore')

 export default {
   emits:['openClientModal'],
   setup() {
     
     const store = useStore()
     const toast = useToast()

     const recivedClients = ref([])
     const recivedVehicles = ref()
     const unassignedVehicles = ref()
     const filteredNumbers = ref()

     const isLoading = ref(true)
     const searchValue = ref()

     const limit = ref(100)
     const lastDoc = ref(0)
     const disableNextButton = ref(true)
     const selectedCar = ref()
     const filterInput = ref('')
     const countClientPages = ref()

   const tableFilters = reactive({
      'global': { value: '', matchMode: FilterMatchMode.CONTAINS }
    })
    const clearTableFilters = () => {
      inittableFilters();
    }
    const inittableFilters = () => {
      tableFilters.value = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
      }
    }

     const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

     const vehiclePath = firebase.firestore()
       .collection('warsztat').doc('Pojazdy').collection('VIN')

     async function getClientsFromFirebase(req) {
       if(req == 'more') limit.value += 100

      const clientPath = MainPath
      .orderBy("Ostatnia_Aktualizacja", "desc") 

      //  let clientResponse = await clientPath.get({source: 'cache'})
       let clientResponse = await clientPath.get()
       let vehicleResponse = await vehiclePath.get()

       lastDoc.value = clientResponse.docs[clientResponse.docs.length - 1]

       if (!clientResponse.docs.length) {
        disableNextButton.value = true
        toast.add({ severity: 'info', detail: 'Wczytano wszystkie pojazdy.', life: 4000})
       }

        // dodano filtr zapobiegajacy wyswietlaniu na liscie pojazdow nieprzypisanych
       recivedVehicles.value = vehicleResponse.docs.map(doc => doc.data())
       recivedClients.value = clientResponse.docs.map(doc => doc.data()).filter(client => Object.values(recivedVehicles.value).some((car) => car.Tel == client.Tel))
       recivedClients.value = [...recivedClients.value, {Tel: 'NIEPRZYPISANE'}]
       unassignedVehicles.value = recivedVehicles.value.map(car => car).filter(item => !item.Tel)

      disableNextButton.value = false
        if (clientResponse.docs.length < limit.value) {
          disableNextButton.value = true
          toast.add({ severity: 'info', detail: 'Wczytano wszystkie pojazdy.', life: 4000})
        }
          isLoading.value = false

         recivedClients.value.map(client => client['Pojazdy'] = (Object.values(client).filter(item => item instanceof Object)).map(car => `${car.Marka} ${car.Model} ${car.VIN} `))
     }

     function onlyCars(clientTel) {
        return recivedVehicles.value.map(car => car).filter(item => {
          return clientTel == 'NIEPRZYPISANE' ? !item.Tel : item?.Tel == clientTel })
     }

        function showEvent(e){
      searchValue.value = e.target.value

      if(searchValue.value.trim().length > 2) tableFilters['global'].value = searchValue.value.trim()
      else tableFilters['global'].value = ''
    }

     onMounted(() => {
       if(localStorage.getItem('countClientPages')) countClientPages.value = JSON.parse(localStorage.getItem('countClientPages'))
       getClientsFromFirebase()
     })

     watch(() => selectedCar.value, () => store.commit('setSelectedCarForTicket', selectedCar.value))


     return {

       recivedClients,
       recivedVehicles,
       unassignedVehicles,
       filteredNumbers,

       filterInput,

       onlyCars,
       getClientsFromFirebase,
       disableNextButton,

       selectedCar,

      DataTable,
      Column,
      showEvent,
      searchValue,

      isLoading,
      tableFilters,
      clearTableFilters,
      countClientPages
       
     }

   }
 }
</script>

<style>
.Cars:last-child > .p-divider{
  display: none;
}
</style>