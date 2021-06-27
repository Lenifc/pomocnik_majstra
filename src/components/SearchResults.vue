<template>
<div class="p-d-flex  p-flex-column p-jc-center p-ai-center">
  <h3 class="p-pt-6 p-text-center"> Wyniki wyszukiwania:</h3>
  <div v-for="client in outputData" :key="client.id" class="p-pb-4 p-pt-3" style="width:90%; max-width:1000px">
    <Card class="relative">
      <template #header>
        <div class="p-text-center p-pt-3">
          <h3>Klient:</h3>
        </div>
        <div class="toolbarClient">
          <Button class="p-button-danger p-mr-2 p-button-rounded" icon="pi pi-trash" v-tooltip.right="'Usuń dane klienta'" @click="confirmDeleteModal(client, 'removeClient', FilterOnlyCars(outputData).length)"/>
          <Button class="p-button-primary p-button-rounded" icon="pi pi-pencil" v-tooltip.top="'Edytuj dane klienta'" @click="openEditClientForm(client)"/>
        </div>
      </template>
      <template #content>
        <div class="client">
          <div class="p-my-1"><span class="p-text-bold">Imie:</span> {{ client['Imie']}}</div>
          <div class="p-my-1"><span class="p-text-bold">Numer telefonu:</span> {{ client['Tel']}}</div>
          <div v-if="client.Tel2" class="p-my-1"><span class="p-text-bold">Dodatkowy numer telefonu:</span> {{ client['Tel2']}}</div>
          <div v-if="client.kodPocztowy && client.Miejscowosc && client.Ulica">
            <div class="p-my-1"><span class="p-text-bold">{{ client['kodPocztowy'] }}</span> {{ client['Miejscowosc'] }}</div>
            <div class="p-my-1"><span class="p-text-bold">Ulica:</span> {{ client['Ulica']}}</div>
          </div>
          <div v-if="client.Opis" class="p-my-1"><span class="p-text-bold">Opis:</span> <span v-html="client['Opis']"></span></div>
        </div>
            <Divider />
        <div class="vehicles">
          <h3 v-if="FilterOnlyCars(client).length" class="p-text-center">Pojazdy klienta:</h3>
          <h3 v-else>Klient nie posiada przypisanych pojazdów</h3>
          <div class="vehicle relative" v-for="car in FilterOnlyCars(client)" :key="car.VIN">
            <div class="toolbarVehicle">
              <Button class="p-button-danger p-mr-2 p-button-rounded" icon="pi pi-trash" v-tooltip.top="'Usuń dane pojazdu'" @click="confirmDeleteModal(client, 'removeCar', car.VIN)" />
              <Button class="p-button-primary p-button-rounded" icon="pi pi-pencil" v-tooltip.left="'Edytuj dane pojazdu'" @click="openEditVehicleForm(car)"/>
            </div>
            <div class="p-my-1 p-text-bold">{{ `${car['Marka']} ${car['Model']} ${car['Wersja_Rocznik'] || ''}`}}</div>
            <div class="p-my-1"><span class="p-text-bold">VIN:</span> {{car['VIN']}}</div>
            <div class="p-my-1"><span class="p-text-bold">Numer rejestracyjny:</span> {{car['Numer_rejestracyjny']}}</div>
            <div class="p-my-1"><span class="p-text-bold">Paliwo:</span> {{car['Paliwo']}}</div>
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


export default {
  props:['outputData'],
setup(props) {

  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const store = useStore()

  const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

    function FilterOnlyCars(data) {
      return Object.values(data).filter(obj => obj instanceof Object && obj.VIN)
    }

    function openEditClientForm(client){
      router.push(`/klient/${client['Tel']}/edytuj`)
    }

    function openEditVehicleForm(car){
      store.commit('setTargetCar', car)
      router.push(`/pojazd/${car['VIN']}/edytuj`)
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
            if (confirmDelete !== false) {
              router.push('/')
              toast.removeAllGroups()
              toast.add({severity:'success', detail:'Pomyślnie usunięto dane klienta', life: 4000})
          }
          }
          if (operation == 'removeCar') {
            console.log(clientData);
            const confirmDelete = await DeleteFunc('car', MainPath, Tel, target, JSON.parse(JSON.stringify(clientData))) // prosta konwersja proxy do objektu
            if (confirmDelete !== false) {
              props.outputData.map(client => {
                if (client.Tel == Tel) delete client[`${target}`]
              })
              toast.removeAllGroups()
              toast.add({severity:'success', detail:'Pomyślnie usunięto pojazd z listy klienta.', life: 4000})
            }
          }
        },
        reject: () => {}
      });
    }

    return {
      TicketsHistory,
      FilterOnlyCars,

      openEditClientForm,
      openEditVehicleForm,
      confirmDeleteModal,



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
</style>