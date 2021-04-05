<template>
  <h1>SZCZEGÓŁY</h1>
  <div class="">{{$route.params.ticketDetails}}</div>
  <ul class="cars">
    <li v-for="car in cars" :key="car">{{car}}</li>
  </ul>
</template>

<script>
import { useRoute } from 'vue-router'
import firebase from 'firebase/app'
import PopupFunc from '@/components/PopupFunc.js'
import { ref } from 'vue'
    
export default {
  setup() {
    const route = useRoute()
    console.log(route.params)

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')
    
    let cars = ref()


    tickets.collection(route.params.collectionPath).doc(route.params.ticketDetails)
      .get().then(recived =>{
        console.log(recived.data())
        console.log(`Ilosc pojazdow: ${Object.keys(recived.data()).length - 1}`)

      }).catch(() =>{
        PopupFunc('error', 'Wystąpił problem ze znalezieniem danego numeru')
      })



    return {
      cars
    }
  }
}
</script>

<style>

</style>