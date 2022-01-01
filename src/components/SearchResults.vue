<template>
<div class="p-d-flex  p-flex-column p-jc-center p-ai-center">
      <div class="p-d-flex p-flex-row p-jc-center p-pt-4" v-if="resultData && resultData.length">
      <Button @click="() => {
        $store.commit('setSearchData', null) 
        resultData = null }" icon="pi pi-ban" class="p-button-secondary" label="Wyczyść dane wyszukiwania" />
    </div>
  <h3 class="p-pt-6 p-text-center"> Wyniki wyszukiwania:</h3>
  <div class="p-pb-4 p-pt-3" style="width:100%; max-width:1000px">
    <Card class="relative">
      <template #header>
        <h3 class="p-text-center p-pt-4" v-if="!client">POJAZD NIE POSIADA PRZYPISANEGO KLIENTA</h3>
        <div v-else>
          <div class="p-text-center p-pt-3">
            <h3>Klient:</h3>
          </div>
          <div class="toolbarClient">
            <Button class="p-button-danger p-mr-2 p-button-rounded" icon="pi pi-trash" v-tooltip.right="'Usuń dane klienta'" @click="confirmDeleteModal(client, 'removeClient', resultData[1]?.length)"/>
            <Button class="p-button-primary p-button-rounded" icon="pi pi-pencil" v-tooltip.top="'Edytuj dane klienta'" @click="openEditClientForm(client)"/>
          </div>
        </div>
      </template>
      <template #content>
        <div class="client">
          <div class="p-my-1"><span v-if="client?.Imie" class="p-text-bold">Imie:</span> {{ client?.['Imie']}}</div>
          <div class="p-my-1"><span v-if="client?.Tel" class="p-text-bold">Numer telefonu:</span> <a class="p-text-bold mouse-pointer"
                    @click="openClientDetails(client)">{{ client?.['Tel']}}</a>
          </div>
          <div v-if="client?.Tel2" class="p-my-1"><span class="p-text-bold">Dodatkowy numer telefonu:</span> {{ client?.['Tel2']}}</div>
          <div v-if="client?.kodPocztowy && client?.Miejscowosc && client?.Ulica">
            <div class="p-my-1"><span class="p-text-bold">{{ client?.['kodPocztowy'] }}</span> {{ client?.['Miejscowosc'] }}</div>
            <div class="p-my-1"><span class="p-text-bold">Ulica:</span> {{ client?.['Ulica']}}</div>
          </div>
          <div v-if="client?.Opis" class="p-my-1"><span class="p-text-bold">Opis:</span> <span v-html="client?.['Opis']"></span></div>
        </div>
            <Divider />
        <div class="vehicles">

          <h3 v-if="resultData?.[1]" class="p-text-center">Pojazdy klienta:</h3>
          <h3 v-else>Klient nie posiada przypisanych pojazdów</h3>
          <div class="vehicle relative" v-for="car in resultData?.[1]" :key="car.VIN">
            <div class="toolbarVehicle">
              <Button class="p-button-danger p-mr-2 p-button-rounded" icon="pi pi-trash" v-tooltip.top="'Usuń dane pojazdu'" @click="confirmDeleteModal(car, 'removeCar', car.VIN)" />
              <Button class="p-button-primary p-button-rounded" icon="pi pi-pencil" v-tooltip.left="'Edytuj dane pojazdu'" @click="openEditVehicleForm(car)"/>
            </div>
            <div class="p-my-1 p-text-bold">{{ `${car['Marka']} ${car['Model']} ${car['Wersja_Rocznik'] || ''}`}}</div>
            <div class="p-my-1"><span class="p-text-bold">VIN:</span> <a class="p-text-bold mouse-pointer"
                    @click="openCarDetails(car)">{{car['VIN']}}</a>
            </div>
            <div class="p-my-1"><span class="p-text-bold">Numer rejestracyjny:</span> {{car['Numer_rejestracyjny']}}</div>
            <div class="p-my-1"><span class="p-text-bold">Paliwo:</span> {{car['Paliwo'].name || car['Paliwo']}}</div>
            <div class="p-my-1" v-if="car['Przebieg']"><span class="p-text-bold">Przebieg:</span> {{car['Przebieg']}} km</div>
            <div class="p-my-1" v-if="car['Silnik_Pojemnosc']"><span class="p-text-bold">Pojemność silnika:</span> {{car['Silnik_Pojemnosc']}} cm<sup>3</sup></div>
            <div class="p-my-1" v-if="car['Silnik_Moc']"><span class="p-text-bold">Moc:</span> {{car['Silnik_Moc']}} KM</div>
            <div class="p-my-1" v-if="car['Silnik_Kod']"><span class="p-text-bold">Oznaczenie silnika:</span> {{car['Silnik_Kod']}}</div>
            <div class="p-my-1" v-if="car['Naped']"><span class="p-text-bold">Napęd:</span> {{car['Naped']}}</div>
            <div class="p-my-1" v-if="car['SkrzyniaBiegow']"><span class="p-text-bold">Skrzynia:</span> {{car['SkrzyniaBiegow']}}</div>
            <TicketsHistory :VIN="car?.['VIN']" :Tel="client?.['Tel']" />
            <Divider />
          </div>
        </div>
      </template>
    </Card>
  </div>
  </div>
</template>

<script>
import firebase from 'firebase/app'

import TicketsHistory from '@/components/TicketsHistory.vue'
import { DeleteFunc } from '@/components/EditMoveDeleteOptions.js'

import { useRouter } from 'vue-router'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm"
import { useStore } from 'vuex'
import { onMounted, ref, watch } from '@vue/runtime-core'
import { callTicketsHistory } from '@/components/fetchTicketHistory.js'


export default {
  components:{
    TicketsHistory
  },
  props:['outputClient','outputVehicles'],
  setup(props) {

  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const store = useStore()
  const resultData = ref()
  const client = ref()
  const allTickets = ref()
  const isThereAnyTicket = ref()

  const clientPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')
  const vehiclePath = firebase.firestore()
       .collection('warsztat').doc('Pojazdy').collection('VIN')

    function openEditClientForm(client){
      store.commit('setTargetClient', client)
      router.push(`/klient/${client?.['Tel']}/edytuj`)
    }

    function openEditVehicleForm(car){
      store.commit('setTargetCar', car)
      router.push(`/pojazd/${car['VIN']}/edytuj`)
    }

    function openCarDetails(car){
      store.commit('setTargetCar', car)
      router.push(`/szczegoly/${car['VIN']}`)
    }

    function openClientDetails(client){
      store.commit('setTargetClient', client)
      router.push(`/szczegoly/client/${client?.['Tel']}`)
    }

            const confirmDeleteModal = async (clientData, operation, target) => {
      allTickets.value = await callTicketsHistory(target)

       setTimeout(() => {
        //  console.log(allTickets.value)
         isThereAnyTicket.value = allTickets.value.some(ticket => ticket[1].length > 0)
       }, 500)

      confirm.require({
        message: operation == 'removeClient' ?
          `Czy napewno chcesz usunąć klienta o podanym numerze telefonu: ${clientData['Tel']}?` : 
          (operation == 'removeCar' ? 
            `Czy na pewno chcesz usunąć pojazd klienta ${clientData?.Tel}\n o numerze VIN: ${target}?` : 'Jezeli sie to wyswietla to jest cos do poprawy!'),
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
            const confirmDelete = await DeleteFunc('client', clientPath, Tel, target)
            if (confirmDelete !== false) {
              router.push('/')
              toast.removeAllGroups()
              toast.add({severity:'success', detail:'Pomyślnie usunięto dane klienta', life: 4000})
          }
          }
          if (operation == 'removeCar') {
            if(isThereAnyTicket.value == false){
              const confirmDelete = await DeleteFunc('car', vehiclePath, target)
              if (confirmDelete !== false) {
                resultData.value[1].filter(car => car.VIN != target)
                toast.removeAllGroups()
                toast.add({severity:'success', detail:'Pomyślnie usunięto pojazd z listy klienta.', life: 4000})
              } else toast.add({severity:'info', detail:'Nie można usunąć pojazdu, który posiada historię serwisową.', life: 4000})
            } 
            else {
              toast.add({ severity: 'warn', detail: 'Pojazd posiada historię serwisową i nie może zostać całkowicie usunięty!', life: 6000})
            }
          }
        },
        reject: () => {}
      });
    }

    onMounted(() => {

      if(!props.outputClient && !props.outputVehicles){
        resultData.value = store.state.searchData
      } else resultData.value = [props.outputClient, props.outputVehicles]
        client.value = resultData.value[0]
    })

    // workaround na niedoczytujacego sie na poczatku klienta w przypadku wyszukiwania pojazdu po VIN
    watch(() => props.outputClient, () =>{
      if(!props.outputClient && !props.outputVehicles){
        resultData.value = store.state.searchData
      } else resultData.value = [props.outputClient, props.outputVehicles]
        client.value = resultData.value[0]
    })

    return {
      TicketsHistory,

      openEditClientForm,
      openEditVehicleForm,
      openCarDetails,
      openClientDetails,
      confirmDeleteModal,
      resultData,

      client
    }
}
}
</script>

<style>
.toolbarClient{
  position: absolute;
  top: 10px;
  left: 10px;
}
.toolbarVehicle{
  position: absolute;
  top: 0px;
  right: 0px;
}
.mouse-pointer{
  cursor: pointer;
}
</style>