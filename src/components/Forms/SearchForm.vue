<template>
<div class="container column">
    <div class="row">
        <div class="column">
            <label for="searchClient">Wyszukaj klienta po numerze telefonu</label>
            <input type="text" name="searchClient" placeholder="7 lub 9 cyfrowy numer" v-model="searchNumber">
        </div>
        <p>Lub</p>
        <div class="column">
            <label for="searchVehicle">Wyszukaj pojazd po numerze VIN</label>
            <input type="text" name="searchClient" placeholder="17 znaków" v-model="searchVIN">
        </div>

    </div>
    <button @click="validSearchData" class="btn">Szukaj</button>
    <div class="output" v-if="outputData">
      <div class="client">
        <h3>Klient:</h3><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i>
        <div>Imie: {{ outputData['Imie']}}</div>
        <div>Numer telefonu: {{ outputData['Tel']}}</div>
        <div v-if="outputData['Tel2']">Dodatkowy numer telefonu: {{ outputData['Tel2']}}</div>
        <div v-if="outputData['Adres']">Adres: {{ outputData['Adres']}}</div>
        <div v-if="outputData['Opis']">Opis: {{ outputData['Opis']}}</div>
      </div>
      <div class="vehicles">
        <h3 v-if="clientCars">Pojazdy klienta:</h3>
        <h3 v-else>Klient nie posiada przypisanych pojazdów</h3>
        <div class="vehicle" v-for="car in clientCars" :key="car.VIN">
          <hr>
          <i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i>
          <div class="brand">{{ `${car['Marka']} ${car['Model']} ${car['Wersja_Rocznik'] || ''}`}}</div>
          <div class="VIN">VIN: {{car['VIN']}}</div>
          <div class="numberPlates">Numer rejestracyjny: {{car['Numer_rejestracyjny']}}</div>
          <div class="fuel">Paliwo: {{car['Paliwo']}}</div>
          <div class="milage" v-if="car['Przebieg']">Przebieg: {{car['Przebieg']}}km</div>
          <div class="engine" v-if="car['Silnik']">Silnik/Moc: {{car['Silnik']}}</div>
          <div class="drive" v-if="car['Naped']">Napęd: {{car['Naped']}}</div>
          <div class="gearbox" v-if="car['SkrzyniaBiegow']">Skrzynia: {{car['SkrzyniaBiegow']}}</div>
          <button @click="callTicketsHistory(car.VIN)">Historia zleceń pojazdu</button>
        </div>
      </div>
      <div class="tickets">
        <h3>ZLECENIA POKI CO WYSWIETLAJA SIE TYLKO W KONSOLI!</h3>
      </div>
      <div class="actions">
        
      </div>
    </div>

</div>
 
</template>

<script>
import { ref } from 'vue'
import PopupFunc from '@/components/PopupFunc'
import firebase from 'firebase/app'
import validPhoneNum from '@/components/validPhoneNum.js'
import validateVIN from '@/components/validateVIN.js'

let _ = require('lodash')

export default {
setup(){
    const searchNumber = ref('')
    const searchVIN = ref('')
    const outputData = ref('')
    const clientCars = ref()
    const ticketsHistory = ref([])

function validSearchData() {
  if (searchNumber.value.trim() && searchVIN.value.trim()) {
    PopupFunc('warning', 'Zdecyduj się, szukasz klienta czy pojazdu?')
    return
  }
  if (searchNumber.value.trim()) {
    let legitPhoneNum = validPhoneNum(searchNumber.value.trim())
    if (legitPhoneNum) {
      searchNumber.value = legitPhoneNum
      searchInFirestore(searchNumber.value, 'phoneNum')
      return
    }
    return PopupFunc('error', 'Popraw numer telefonu')
  }
  if (searchVIN.value.trim()) {
    let VINNumber = validateVIN(searchVIN.value)
    if (!VINNumber) {
      PopupFunc('error', 'Popraw numer VIN')
    } else{
      searchInFirestore(VINNumber, 'VIN')
    }
    } else PopupFunc('info', 'Nie można szukać pustego pola')
  }


    async function searchInFirestore(searchData, searchType) {
      outputData.value = ""

      if (searchType == 'VIN') {const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery")

        const response = await clients.get()
         let outData = outputData.value = response.docs.map(doc => doc.data()).filter(doc => doc[searchData])
         outputData.value = Object.assign({}, ...outData) // usuwam zewnetrzna warstwe tablicy

         clientCars.value = Object.values(outputData.value).filter(obj => obj instanceof Object)
         console.log(outputData.value);
        if(outputData.value) return
        else PopupFunc('warning', 'Nie udało się wyszukać pojazdu o podanym numerze VIN.')

      }
      if (searchType == 'phoneNum') {
        const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery").doc(searchData)

        const response = await clients.get()
        if(response.exists) {
          outputData.value = response.data()

          clientCars.value = Object.values(outputData.value).filter(obj => obj instanceof Object)
          console.log(outputData.value);
        }
        else PopupFunc('warning', 'Nie udało się wyszukać klienta o podanym numerze telefonu.')
      }
    }

    function callTicketsHistory(VIN){
      const paths = ['wolne', 'obecne', 'zakonczone']

      paths.forEach(path => fetchTicketHistory(path, VIN))
    }

    async function fetchTicketHistory(path, VIN) {
      const clients = firebase.firestore()
        .collection('warsztat')
        .doc('zlecenia').collection(path)

      const response = await clients.get()
      let outData = outputData.value = response.docs.map(doc => Object.entries(doc.data()).filter(item => item[0] != 'timeStamp'))
      outData = _.flattenDeep(outData)

      let readyData = outData.filter(item => (item instanceof Object && item.VIN == VIN) ? item : '')
      console.log(readyData, path);

       ticketsHistory.value.push([readyData, path])

      if (!ticketsHistory.value) PopupFunc('warning', 'Nie znaleziono historii pojazdu.')
    }


    return{
        searchNumber,
        searchVIN,
        validSearchData,
        outputData,

        searchInFirestore,
        clientCars,
        ticketsHistory,
        callTicketsHistory,
        
    }
}
}
</script>

<style>

</style>