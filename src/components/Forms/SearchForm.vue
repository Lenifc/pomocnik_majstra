<template>
<div>
  <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center p-pt-5 p-text-center">
    <Card class="p-mx-0 p-mx-md-3 p-my-3 p-my-md-0">
      <template #title>
        Wyszukaj pojazd po numerze VIN
      </template>
      <template #content>
        <InputText name="searchClient" v-model="searchVIN" maxlength="17" style="width: min(100%, 200px)"
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
        <InputText name="searchClient" v-model="searchNumber" style="width: min(100%, 200px)"
          v-tooltip.top.focus="'- 7 cyrf dla numeru stacjonarnego \n- 9 cyfr dla numeru komórkowego'" />
      </template>
      <template #footer>
        <Button @click="validSearchData" icon="pi pi-search" class="p-button-primary searchBtn phoneBtn" label="Szukaj" />
      </template>
    </Card>
  </div>
<SearchResults :outputData="outputData" v-if="outputData?.length" :searchType="searchType" class="p-pt-5"/>

</div>
 
</template>

<script>
import { ref } from 'vue'
import firebase from 'firebase/app'
import validPhoneNum from '@/components/validPhoneNum.js'
import validateVIN from '@/components/validateVIN.js'

import SearchResults from '@/components/SearchResults.vue'

import { useToast } from "primevue/usetoast"

export default {
  components:{
    SearchResults
  },
  setup(){
    const searchNumber = ref('')
    const searchVIN = ref('')
    const outputData = ref()
    const ticketsHistory = ref([])

    const toast = useToast()

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
      outputData.value = ""

      if (searchOption == 'VIN') {
        searchType.value = 'VIN'
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
        else toast.add({severity:'warn', summary: 'Nieprawidłowa wartość', detail:`Nie udało się wyszukać pojazdu o podanym numerze VIN.`, life: 5000})

      }
      if (searchOption == 'phoneNum') {
        searchType.value = 'phoneNum'
        const clients = firebase.firestore()
          .collection('warsztat')
          .doc('Klienci').collection("Numery").doc(searchData)

        const response = await clients.get()
        if(response.exists) {
          outputData.value = [response.data()]
        }
        else toast.add({severity:'warn', summary: 'Nieprawidłowa wartość', detail:`Nie udało się wyszukać klienta o podanym numerze telefonu.`, life: 5000})
      }
    }


    return{
        searchNumber,
        searchVIN,
        validSearchData,
        outputData,

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