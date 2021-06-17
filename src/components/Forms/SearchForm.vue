<template>
<div class="column">
  <div class="p-d-flex p-flex-column p-flex-md-row p-jc-between p-mt-4 p-text-center border">
    <Card class="p-m-3">
      <template #title>
        Wyszukaj pojazd po numerze VIN
      </template>
      <template #content>
        <InputText type="text" name="searchClient" v-model="searchVIN"
          v-tooltip.top.focus="'Poprawny format to 17 znaków'" />
      </template>
      <template #footer>
        <Button @click="validSearchData" icon="pi pi-search" class="p-button-secondary searchBtn vinBtn" label="Szukaj" 
        id="vin" />
      </template>
    </Card>
      <!-- <Divider layout="vertical" /> -->
    <Card class="p-m-3">
      <template #title >
        Wyszukaj klienta po numerze telefonu
      </template>
      <template #content>
        <InputText type="text" name="searchClient" v-model="searchNumber"
          v-tooltip.top.focus="'- 7 cyrf dla numeru stacjonarnego \n- 9 cyfr dla numeru komórkowego'" />
      </template>
      <template #footer>
        <Button @click="validSearchData" icon="pi pi-search" class="p-button-secondary searchBtn phoneBtn" label="Szukaj" />
      </template>
    </Card>
  </div>


    <div class="output" v-for="client in outputData" :key="client.id">
      <div class="client">
        <h3>Klient:</h3><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i>
        <div>Imie: {{ client['Imie']}}</div>
        <div>Numer telefonu: {{ client['Tel']}}</div>
        <div v-if="client['Tel2']">Dodatkowy numer telefonu: {{ client['Tel2']}}</div>
        <div v-if="client['Adres']">Adres: {{ client['Adres']}}</div>
        <div v-if="client['Opis']">Opis: {{ client['Opis']}}</div>
      </div>
      <div class="vehicles">
        <h3 v-if="true">Pojazdy klienta:</h3>
        <h3 v-else>Klient nie posiada przypisanych pojazdów</h3>
        <div class="vehicle" v-for="car in FilterOnlyCars(client)" :key="car.VIN">
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
          <button @click="callTicketsHistory(car['VIN'], client['Tel'])">Historia zleceń pojazdu</button>
        </div>
      </div>
      <div class="tickets">
        <h3>ZLECENIA POKI CO WYSWIETLAJA SIE TYLKO W KONSOLI VUE!</h3>
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

import Card from 'primevue/card';
import Divider from 'primevue/divider';

let _ = require('lodash')

export default {
setup(){
    const searchNumber = ref('')
    const searchVIN = ref('')
    const outputData = ref('')
    const ticketsHistory = ref([])

function validSearchData(e) {
  let target = e.target.classList
  let buttons = document.querySelectorAll('.searchBtn')
  let vinBtn = document.querySelector('.vinBtn')
  let phoneBtn = document.querySelector('.phoneBtn')

  buttons.forEach(btn => btn.classList.remove('active'))

  if (target.contains('phoneBtn') && searchNumber.value.trim()) {
    let legitPhoneNum = validPhoneNum(searchNumber.value.trim())
    if (legitPhoneNum) {
      searchNumber.value = legitPhoneNum
      phoneBtn.classList.add('active')
      searchInFirestore(searchNumber.value, 'phoneNum')
      return
    }
    return PopupFunc('error', 'Popraw numer telefonu')
  }
  if (target.contains('vinBtn') && searchVIN.value.trim()) {
    let VINNumber = validateVIN(searchVIN.value)
    vinBtn.classList.add('active')
    if (!VINNumber) {
      PopupFunc('error', 'Popraw numer VIN')
    } else{
      searchInFirestore(VINNumber, 'VIN')
    }
    }
  }


    async function searchInFirestore(searchData, searchType) {
      outputData.value = ""

      if (searchType == 'VIN') {
        const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery")
          .where(`${searchData}.VIN`, '==', searchData)

        const response = await clients.get()

        let allClients = []
         response.docs.map(doc => {
           let docResponse = doc.data()
          allClients.push(docResponse)
         })
         outputData.value = allClients

        if(Object.values(outputData.value).length) return
        else PopupFunc('warning', 'Nie udało się wyszukać pojazdu o podanym numerze VIN.')

      }
      if (searchType == 'phoneNum') {
        const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery").doc(searchData)

        const response = await clients.get()
        if(response.exists) {
          outputData.value = [response.data()]
        }
        else PopupFunc('warning', 'Nie udało się wyszukać klienta o podanym numerze telefonu.')
      }
    }

    function callTicketsHistory(VIN, phoneNum){
      const paths = ['wolne', 'obecne', 'zakonczone']

      paths.forEach(path => fetchTicketHistory(path, VIN, phoneNum))
    }

    async function fetchTicketHistory(path, VIN, phoneNum) {
      console.log(path, VIN, phoneNum);

      const clients = firebase.firestore()
        .collection('warsztat')
        .doc('zlecenia').collection(path)
        .doc(phoneNum)

      const response = await clients.get()
      let outData = response.data()

      outData = outData ? Object.entries(outData).filter(item => item[0] != 'timeStamp') : ''
      outData = _.flattenDeep(outData)

      let readyData = outData.filter(item => (item instanceof Object && item.VIN == VIN) ? item : '')

       if(readyData) ticketsHistory.value.push([path, readyData])

      if (!ticketsHistory.value) PopupFunc('warning', 'Nie znaleziono historii pojazdu.')
      if(ticketsHistory.value.length == 3) console.log(ticketsHistory.value)
      
    }

    function FilterOnlyCars(data){
      return Object.values(data).filter(obj => obj instanceof Object)
    }


    return{
        searchNumber,
        searchVIN,
        validSearchData,
        outputData,

        searchInFirestore,
        ticketsHistory,
        callTicketsHistory,
        FilterOnlyCars,

        Card,
        Divider
    }
}
}
</script>

<style>
.active{
  background-color: var(--green-600)!important;
}
</style>