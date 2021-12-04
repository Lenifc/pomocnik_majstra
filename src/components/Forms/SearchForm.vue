<template>
<div>
  <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center p-pt-5 p-text-center">
    <Card class="p-mx-0 p-mx-md-3 p-my-3 p-my-md-0">
      <template #title>
        Wyszukaj pojazd po numerze VIN
      </template>
      <template #content>
        <label for="searchByVIN"></label>
        <InputText name="searchClient" id="searchByVIN" v-model="searchVIN" maxlength="17" style="width: min(100%, 200px)"
          v-tooltip.top.focus="'Poprawny format to 17 znaków'" />
      </template>
      <template #footer>
        <Button @click="validSearchData" icon="pi pi-search" class="p-button-primary searchBtn vinBtn" label="Szukaj" 
        id="vin" />
      </template>
    </Card>
    <Card class="p-mx-0 p-mx-md-3 p-my-3 p-my-md-0">
      <template #title >
        Wyszukaj klienta po numerze telefonu
      </template>
      <template #content>
        <label for="searchByPhoneNum"></label>
        <InputText name="searchClient" id="searchByPhoneNum" v-model="searchNumber" style="width: min(100%, 200px)"
          v-tooltip.top.focus="'- 7 cyrf dla numeru stacjonarnego \n- 9 cyfr dla numeru komórkowego'" label="Szukaj klienta po numerze telefonu"/>
      </template>
      <template #footer>
        <Button @click="validSearchData" icon="pi pi-search" class="p-button-primary searchBtn phoneBtn" label="Szukaj" />
      </template>
    </Card>
  </div>
<SearchResults :outputVehicles="outputVehicles" :outputClient="outputClient"  v-if="outputClient?.length || outputVehicles?.length" class="p-pt-5"/>

</div>
 
</template>

<script>
import { onMounted, ref } from 'vue'
import firebase from 'firebase/app'
import validPhoneNum from '@/components/validPhoneNum.js'
import validateVIN from '@/components/validateVIN.js'

import SearchResults from '@/components/SearchResults.vue'

import { useToast } from "primevue/usetoast"
import { useStore } from 'vuex'

export default {
  components:{
    SearchResults
  },
  setup(){
    const searchNumber = ref('')
    const searchVIN = ref('')
    const outputClient = ref('')
    const outputVehicles = ref('')
    const ticketsHistory = ref([])

    const toast = useToast()
    const store = useStore()

    const searchType = ref('')

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
    return toast.add({severity:'warn', summary: 'Nieprawidłowa wartość', detail:`Popraw numer telefonu`, life: 3500})
  }
  if (target.contains('vinBtn') && searchVIN.value.trim()) {
    let VINNumber = validateVIN(searchVIN.value)
    vinBtn.classList.add('active')
    if (!VINNumber) {
      toast.add({severity:'warn', summary: 'Nieprawidłowa wartość', detail:`Popraw numer VIN`, life: 3500})
    } else{
      searchInFirestore(VINNumber, 'VIN')
    }
    }
  }

    async function searchInFirestore(searchData, searchOption) {
      outputVehicles.value = ""
      outputClient.value = ""

      if (searchOption == 'VIN') {
        searchForCars(searchData)
      }
      if (searchOption == 'phoneNum') {
        searchForClient(searchData)
      }
    }

    async function searchForClient(data, order){
      searchType.value = 'phoneNum'
        const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery").doc(data)

        const response = (await clients.get()).data()
        // console.log('CLIENT', response)

        if(response) {
          outputClient.value = response
          store.commit('setSearchData', [outputClient.value, outputVehicles.value])

          if(order != 2) await searchForCars(response.Tel, 2)
        }
        else {
          if(order != 2) toast.add({severity:'warn', summary: 'Nieprawidłowa wartość', detail:`Nie udało się wyszukać klienta o podanym numerze telefonu.`, life: 5000})
        }
    }


    async function searchForCars(data, order){
        searchType.value = 'VIN'
        let vehicle
        order && order == 2 ? 
          vehicle = firebase.firestore()
                .collection('warsztat')
                .doc('Pojazdy').collection("VIN").where('Tel', '==', data) : 
           vehicle = firebase.firestore()
                .collection('warsztat')
                .doc('Pojazdy').collection("VIN").doc(data)

        let response 
        
        order && order == 2 ? response = await vehicle.get() : response = (await vehicle.get()).data()

        if(response){
          order && order == 2 ? response = response.docs?.map(doc => doc.data()) : response = [response]
          // console.log('CAR', response)

          outputVehicles.value = response
          store.commit('setSearchData', [outputClient.value, outputVehicles.value])

          if(response?.[0]?.Tel) await searchForClient(response[0].Tel, 2)
        }
        else {
          if(!order) toast.add({severity:'warn', summary: 'Nieprawidłowa wartość', detail:`Nie udało się wyszukać pojazdu o podanym numerze VIN.`, life: 5000})
        }
    }

    onMounted(() =>{
      if(store.state.searchData) {
        // console.log('MOUNTED', store.state.searchData);
        outputClient.value = store.state.searchData[0]
        outputVehicles.value = store.state.searchData[1]
      }
    })


    return{
        searchNumber,
        searchVIN,
        validSearchData,
        outputClient,
        outputVehicles,

        searchInFirestore,
        ticketsHistory,
        SearchResults,
        searchType
    }
}
}
</script>

<style>
.active{
  background-color: var(--green-600)!important;
  color: white!important;
}
</style>