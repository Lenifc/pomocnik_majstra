<template>
<div class="column">
<h1>{{collectionPath}}</h1>
<!-- <input type="text" placeholder="searchbar" disabled> -->
        <table class="showElements" v-if="!isLoading && allCars.length">
          <tr>
              <th>Szczegóły:</th>
              <th>Czas dodania zlecenia:</th>
              <th>Imie:</th>
              <th>Numer telefonu:</th>
              <th>Pojazd:</th>
              <th>VIN:</th>
              <th>Numer rejestracyjny:</th>
              <th v-if='collectionPath == "zakonczone"'>Koszt:</th>
              <th v-if='collectionPath == "zakonczone"'>Data zakonczenia zlecenia:</th>
              <th>OPCJE</th>
          </tr>
        <tr v-for="car in allCars" :id="`${car['Marka']} ${car['Model']} ${car['Dodane_Czas']}`" :key="car['Dodane_Czas']" class="mainTicketDetails">
              <td class="details"><router-link :to="'/details/' + collectionPath + '/' + car['Tel']">Wbijaj wariat</router-link></td>
              <td class="dodane_czas">{{ car['Dodane_Czas'] }}</td>
              <td class="imieKlienta">{{ car['Imie'] }}</td>
              <td class="numerTelefonu noWrap">{{ car['Tel'] }}</td>
              <td class="marka_model_wersja">{{ `${car['Marka']} ${car['Model']} ${(car['Rok_prod'] || "")}`}}</td>
              <td class="VIN noWrap">{{ car['VIN'] }}</td>
              <td class="numer_rejestracyjny">{{ car['Numer_rejestracyjny'] }}</td>
              <td class="Zakonczone_Czas" v-if='collectionPath == "zakonczone"'>{{ car['Zakonczone_Czas'] }}</td>
              <td class="Koszt" v-if='collectionPath == "zakonczone"'>{{ car['Koszt'] }}</td>
              <td>
                <div class="moreOptions">
                  <i class="fas fa-edit" title="Edytuj zlecenie" @click="HandleOptions($event, car['Tel'])"/>
                  <i class="fas fa-arrows-alt" title="Zmień status zlecenia" @click="HandleOptions($event, car['Tel'])"/>
                  <i class="fas fa-trash-alt" title="Usuń zlecenie" @click="HandleOptions($event, car['Tel'])" />
                </div>
               
              </td>
        </tr>
      </table>
        <button class="btn"
          @click="getMoreData" v-if="!disableNextButton">Załaduj kolejne zlecenia</button>
        <img class="loader" src="@/assets/spinner.gif" v-if="isLoading">
      </div>
</template>

<script>

import { onMounted, ref, watch} from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import PopupFunc from '@/components/PopupFunc.js'

import firebase from 'firebase/app'
require('firebase/firestore')
let _ = require('lodash')

import { DeleteFunc, RelocateTicket } from '@/components/EditMoveDeleteOptions'

export default ({

  setup() {
    const route = useRoute()
    const store = useStore()

    let recivedItems = ref(null) // MAMY TUTAJ DOSTEP DO WSZYSTKICH DANYCH Z POBRANYCH DOKUMENTOW BEZ timeStamp
    const allCars = ref()

    let lastDoc = ref(0)
    let disableNextButton = ref(false)
    let limit = ref(10)
    let collectionPath = ref(route.path.substring(1))
    let isLoading = ref(true)


    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')


    async function getDataFromFirebase() {
      disableNextButton.value = false

      const collectionReference = tickets.collection(collectionPath.value).orderBy('timeStamp', 'desc')
        .limit(limit.value || 10)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]

      recivedItems.value = data.docs.map(doc => Object.entries(doc.data()).filter(item => item[0] != 'timeStamp') )
      recivedItems.value = _.flattenDeep(recivedItems.value)
      store.commit('setFetchedItems', recivedItems.value)
      
      allCars.value = recivedItems.value.filter(item => item instanceof Object ? item : '')

      isLoading.value = false

      if (data.docs.length < limit.value) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
      }
    }

    async function getMoreData() {

      const collectionReference = tickets.collection(collectionPath.value).orderBy('timeStamp', 'desc')
        .startAfter(lastDoc.value || 0)
        .limit(limit.value || 10)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]
      console.log("Ilosc doladowanych zlecen: " + data.docs.length)

      if (!data.docs.length) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
      } else {

        recivedItems.value.push(...data.docs.map(doc => Object.entries(doc.data()).filter(item => item[0] != 'timeStamp') ))
        recivedItems.value = _.flattenDeep(recivedItems.value)
        store.commit('setFetchedItems', ...recivedItems.value)

        allCars.value = recivedItems.value.filter(item => item instanceof Object ? item : '')

        if (data.docs.length < limit.value) {
          disableNextButton.value = true
          PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
        }
      }
    }

    function HandleOptions(e, tel){
      const target = e.currentTarget.parentElement.parentElement.parentElement.id
      const button = e.currentTarget

      if(button.classList.contains('fa-edit')) openEditor(target, tel)
      if(button.classList.contains('fa-arrows-alt')) openMoveModal(target, tel)
      if(button.classList.contains('fa-trash-alt')) openDeleteModal(target, tel)
    }

    function openEditor(id, tel){
      console.log(id, tel)
    }
    function openMoveModal(id, tel){
      // tutaj dodac modal z zapytaniem czy chce kontynuowac
      let carData = []

     for(let i = 0; i < recivedItems.value.length; i++){
       if(recivedItems.value[i] == id) carData[recivedItems.value[i]] = recivedItems.value[i+1]
     }

     RelocateTicket(id, carData, collectionPath.value, 'zakonczone', tel)
    }
    async function openDeleteModal(id, tel){
      // tutaj dodac modal z zapytaniem czy chce kontynuowac

        await DeleteFunc(id, collectionPath.value, tel)
        document.querySelector('.showElements').removeChild(document.getElementById(id)) // usuwam go z widoku tabeli
      
    }

    
    onMounted(() => {
      collectionPath.value = route.path.substring(1)
      getDataFromFirebase()
    })

    watch(() => route.path, () => {
      // console.log(route.path)
      if (route.path == '/obecne' || route.path == '/wolne' || route.path == '/zakonczone') {
        collectionPath.value = route.path.substring(1)
        getDataFromFirebase()
      }
    })
    

    return {
      getMoreData,

      recivedItems,
      disableNextButton,

      collectionPath,
      isLoading,
      allCars,

      HandleOptions
    }

  },
})
</script>

