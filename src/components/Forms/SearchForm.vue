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
    <div class="output">
      {{outputData }}
    </div>
</div>
 
</template>

<script>
import { ref } from 'vue'
import PopupFunc from '@/components/PopupFunc'
import firebase from 'firebase/app'
import validPhoneNum from '@/components/validPhoneNum.js'

export default {
setup(){
    const searchNumber = ref('')
    const searchVIN = ref('')
    const outputData = ref('')

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
    if (searchVIN.value.trim().length == 17) {
      searchInFirestore(searchVIN.value, 'VIN')
      return
    }
    return PopupFunc('error', 'Popraw numer VIN')
  }
   PopupFunc('info', 'Nie można szukać pustego pola')
}

    async function searchInFirestore(searchData, searchType) {
      outputData.value = ""

      if (searchType == 'VIN') {
        const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery")

        const response = await clients.get()
         outputData.value = response.docs.map(doc => doc.data()).filter(doc => doc[searchData])
          console.log(outputData.value[0]);
        if(outputData.value[0]) return
        else PopupFunc('warning', 'Nie udało się wyszukać pojazdu o podanym numerze VIN.')

      }
      if (searchType == 'phoneNum') {
        const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery").doc(searchData)

        const response = await clients.get()
        if(response.exists) {
          outputData.value = response.data()
          console.log(outputData.value);
        }
        else PopupFunc('warning', 'Nie udało się wyszukać klienta o podanym numerze telefonu.')
      }
    }


    return{
        searchNumber,
        searchVIN,
        validSearchData,
        outputData,

        searchInFirestore
    }
}
}
</script>

<style>

</style>