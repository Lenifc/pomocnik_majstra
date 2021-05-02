<template>
<div class="column">
  <h1>SZCZEGÓŁY numeru {{$route.params.ticketDetails}}</h1>
  <div class="cars-details" v-if="carDetails">

        <h1 style="color: red"> {{carDetails[0]}} </h1>

        <div :id="title" style="color: white" >

          <div>Dodane_Czas: {{ carDetails[1]['Dodane_Czas'] }}</div>
          <div>Marka: {{ carDetails[1]['Marka'] }}</div>
          <div>Model: {{ carDetails[1]['Model'] }}</div>
          <div>Rok_prod: {{ carDetails[1]['Rok_prod'] || 'Brak danych!'}}</div>
          <div>VIN: {{ carDetails[1]['VIN'] }}</div>
          <div>Przebieg: {{ carDetails[1]['Przebieg'] }}</div>
          <div>Opis: {{ carDetails[1]['Opis'] }}</div>

          <button class="btn" @click="HandleFunc($event)">Edytuj</button>
          <button class="btn" @click="HandleFunc($event)">Usuń</button>
          <button class="btn" @click="HandleFunc($event)">Przenieś</button>
          <button class="btn" @click="HandleFunc($event)">PDF</button>
        </div>

  </div>
</div>
<OrderForm v-if="openEditor" :edit="openEditor" /> 
<!-- Jezeli createTicket wczyta prop edit to pobierze ze store dane pojazdu do autouzupelnienia - funkcje zrobic w createTicket i watch na edit -->

</template>

<script>
import firebase from 'firebase/app'
import PopupFunc from '@/components/PopupFunc.js'
import OrderForm from '@/components/Forms/OrderForm.vue'
import { DeleteFunc } from '@/components/EditMoveDeleteOptions'
  
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import createPDF from '@/components/CreatePDF'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const openEditor = ref(false)

    const carDetails = ref()
    const cars = ref()

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')


    function fetchData() {
      tickets.collection(route.params.collectionPath).doc(route.params.ticketDetails)
        .get().then(recived => {
          console.log(recived.data())
          // console.log(Object.entries(recived.data()))
          cars.value = Object.entries(recived.data()).filter(item => item[0] != 'timeStamp')

          const directCar = (cars.value.filter(car => car[1].id == store.state.carDetails.id))[0]
          carDetails.value = directCar ? directCar : cars.value[1]
          
          console.log(carDetails.value);

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
      if(target == 'PDF') createPDF()
      // if (target == 'Przenieś') MoveFunc(id)
    }

    function EditFunc() {
      openEditor.value = true

      router.push(`/edytuj/${route.params.collectionPath}/${route.params.ticketDetails}`)
    }

    onMounted(() => {
      //tutaj zrobic sprawdzenie czy cos jest w localstorage / indexedDB
      fetchData()
    })

    // ponizej fix na przejscie z details/... to zlecen
    watch(() => route.params.ticketDetails, () => {
      if (route.path.includes('details')) fetchData()
    })
    watch(() => route.params.collectionPath, () => route.path.includes('details') ? fetchData() : '')

    return {
      carDetails,

      HandleFunc,
      OrderForm,
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