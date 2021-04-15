<template>
<div class="column">
  <h1>SZCZEGÓŁY numeru {{$route.params.ticketDetails}}</h1>
  <div class="cars-details">

    <vue-collapsible-panel-group >
      <vue-collapsible-panel v-for="(car, index) in cars" :key="index+car[0]" :id="car[0]" :expanded="false">
        <template #title :id="car[0]">
          <!--  -->
          <!-- PROBLEM Z OTWIERANIEM SIE KILKU DETALI NA RAZ!! -->
          <!--  -->
          {{`${car[1]['Marka']} ${car[1]['Model']} ${car[1]['Rok_prod'] || ''}`}}
        </template>
        <template #content>

          <div>Dodane_Czas: {{ car[1]['Dodane_Czas'] }}</div>
          <div>Marka: {{ car[1]['Marka'] }}</div>
          <div>Model: {{ car[1]['Model'] }}</div>
          <div>Rok_prod: {{ car[1]['Rok_prod'] || 'Brak danych!'}}</div>
          <div>VIN: {{ car[1]['VIN'] }}</div>
          <div>Przebieg: {{ car[1]['Przebieg'] }}</div>
          <div>Opis: {{ car[1]['Opis'] }}</div>

          <button class="btn" @click="HandleFunc($event)">Edytuj</button>
          <button class="btn" @click="HandleFunc($event)">Usuń</button>
          <button class="btn" @click="HandleFunc($event)">Przenieś</button>
        

        </template>
      </vue-collapsible-panel>
    </vue-collapsible-panel-group>

  </div>
</div>
<CreateNewTicket v-if="openEditor" :edit="openEditor" /> 
<!-- Jezeli createTicket wczyta prop edit to pobierze ze store dane pojazdu do autouzupelnienia - funkcje zrobic w createTicket i watch na edit -->


</template>

<script>
import firebase from 'firebase/app'
import PopupFunc from '@/components/PopupFunc.js'
import CreateNewTicket from '@/views/CreateNewTicket.vue'
import { DeleteFunc } from '@/components/EditMoveDeleteOptions'

import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { VueCollapsiblePanelGroup, VueCollapsiblePanel } from '@dafcoe/vue-collapsible-panel'
import '@dafcoe/vue-collapsible-panel/dist/vue-collapsible-panel.css'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const openEditor = ref(false)
    // console.log(route.params)

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    let cars = ref()

    function fetchData() {
      tickets.collection(route.params.collectionPath).doc(route.params.ticketDetails)
        .get().then(recived => {
          // console.log(recived.data())
          // console.log(Object.entries(recived.data()))
          cars.value = Object.entries(recived.data()).filter(item => item[0] != 'timeStamp')
          // console.log(cars.value);

          console.log(`Ilosc pojazdow: ${cars.value.length}`)

        }).catch(() => {
          cars.value = ''
          PopupFunc('error', 'Wystąpił problem ze znalezieniem danego numeru: \n' + route.params.ticketDetails)
        })
    }

    function HandleFunc(e) {
      const target = e.target.innerText
      const id = e.target.parentElement.parentElement.parentElement.id
      if (target == 'Usuń') DeleteFunc(id, route.params.collectionPath, route.params.ticketDetails)
      if (target == 'Edytuj') EditFunc(id)
      // if (target == 'Przenieś') MoveFunc(id)
    }

    function EditFunc(id) {
      const findNeededCar = cars.value.filter(car => car[0] == id)

      let storeIt = JSON.parse(JSON.stringify(...findNeededCar))
      store.commit('fillPassedData', storeIt)
      openEditor.value = true

      router.push(`/edytuj/${route.params.collectionPath}/${route.params.ticketDetails}`)
    }

    onMounted(() => {
      console.log(store.state.fetchedItems) // zamiast fetchowac bede porownywal dane z ogolnej puli STORE i polepsze PWA/zmniejsze ilosc danych z firestore
      fetchData()
    })

    // ponizej fix na przejscie z details/... to zlecen
    watch(() => route.params.ticketDetails, () => {
      if (route.path.includes('details')) fetchData()
    })
    watch(() => route.params.collectionPath, () => route.path.includes('details') ? fetchData() : '')

    return {
      cars,
      VueCollapsiblePanelGroup,
      VueCollapsiblePanel,

      HandleFunc,
      CreateNewTicket,
      openEditor
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
  width: max(300px, 50%)
}
</style>