<template>
<div class="column">
<h1>{{collectionPath}}</h1>
<input type="text" placeholder="searchbar" disabled>
        <table class="showElements" v-if="!isLoading && allCars.length">
          <tr>
              <th>l.p.</th>
              <th>Szczegóły:</th>
              <th>Czas dodania zlecenia:</th>
              <th>Imie:</th>
              <th>Numer telefonu:</th>
              <th>Pojazd:</th>
              <th>VIN:</th>
              <th>Numer rejestracyjny:</th>
              <th v-if='collectionPath == "zakonczone"'>Data zakonczenia zlecenia:</th>
              <th v-if='collectionPath == "zakonczone"'>Koszt:</th>
              <th>OPCJE</th>
          </tr>
        <tr v-for="(car, index) in allCars" :id="car['id']" :key="car['id']" class="mainTicketDetails">
              <td>{{ index+1 }}</td>
              <td class="details" @click="redirectToDetails(car)" style="cursor: pointer; font-weight: bold">Szczegóły</td>
              <td class="dodane_czas width-110">{{ car['Dodane_Czas'] }}</td>
              <td class="imieKlienta wrap width-200">{{ car['Imie'] }}</td>
              <td class="numerTelefonu noWrap bold">{{ car['Tel'] }}</td>
              <td class="marka_model_wersja">{{ `${car['Marka']} ${car['Model']} ${(car['Wersja_Rocznik'] || "")}`}}</td>
              <td class="VIN noWrap">{{ car['VIN'] }}</td>
              <td class="numer_rejestracyjny noWrap">{{ car['Numer_rejestracyjny'] }}</td>
              <td class="Zakonczone_Czas" v-if='collectionPath == "zakonczone"'>{{ car['Zakonczone_Czas'] }}</td>
              <td class="Koszt" v-if='collectionPath == "zakonczone"'>{{ car['Koszt'] }}</td>
              <td>
                <div class="moreOptions">
                  <i class="fas fa-edit" title="Edytuj zlecenie" @click="HandleOptions($event, car)"/>
                  <i class="fas fa-arrows-alt" title="Zmień status zlecenia" @click="HandleOptions($event, car)"/>
                  <i class="fas fa-trash-alt" title="Usuń zlecenie" @click="HandleOptions($event, car)" />
                </div>
               
              </td>
        </tr>
      </table>
        <button class="btn"
          @click="getDataFromFirebase('more')" v-if="!disableNextButton">Załaduj kolejne zlecenia</button>
        <img class="loader" src="@/assets/spinner.gif" v-if="isLoading">
          <transition name="modal">
            <Modal :message="modalMsg" :operation="Operation" v-if="showModal" @true="(status, newLocation) => modalResponse(status, newLocation || '')" @false="modalResponse(false)" />
          </transition>
      </div>
</template>

<script>

import { onMounted, ref, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PopupFunc from '@/components/PopupFunc.js'
import Modal from '@/components/Modal.vue'

import firebase from 'firebase/app'
require('firebase/firestore')
let _ = require('lodash')

import { DeleteFunc, RelocateTicket } from '@/components/EditMoveDeleteOptions'

export default ({

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const recivedItems = ref(null) // MAMY TUTAJ DOSTEP DO WSZYSTKICH DANYCH Z POBRANYCH DOKUMENTOW BEZ timeStamp
    const allCars = ref()

    const lastDoc = ref(0)
    const disableNextButton = ref(true)
    const limit = ref(40)
    const collectionPath = ref(route.path.substring(1))
    const isLoading = ref(true)
    const showModal = ref(false)
    const modalMsg = ref('')
    const Operation = ref()


    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')


    async function getDataFromFirebase(req) {
      if(req == 'more') limit.value += 40
      
      const collectionReference = tickets.collection(collectionPath.value).orderBy('timeStamp', 'desc')
        .limit(limit.value || 40)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]

      recivedItems.value = data.docs.map(doc => Object.entries(doc.data()).filter(item => item[0] != 'timeStamp'))
      recivedItems.value = _.flattenDeep(recivedItems.value)
      store.commit('setFetchedItems', recivedItems.value)

      allCars.value = recivedItems.value.filter(item => item instanceof Object ? item : '')

      isLoading.value = false

      disableNextButton.value = false
      if (data.docs.length < limit.value) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
      }
    }

    function redirectToDetails(carData) {

      store.commit('setCarDetails', carData)
      router.push(`/details/${collectionPath.value}/${carData['Tel']}/${carData['id']}`)
    }

    function HandleOptions(e, car) {
      // const target = e.currentTarget.parentElement.parentElement.parentElement.id
      const button = e.currentTarget

      if (button.classList.contains('fa-edit')) openEditor(car)
      if (button.classList.contains('fa-arrows-alt')) openModal(car, 'relocate')
      if (button.classList.contains('fa-trash-alt')) openModal(car, 'remove')
    }

    function openEditor(carInfo) {
      store.commit('setTargetCar', carInfo)
      router.push(`/edytuj/${collectionPath.value}/${carInfo['Tel']}`)
    }

    function openModal(carInfo, operation) {
      Operation.value = operation
      store.commit('setTargetCar', carInfo)
      if (operation == 'remove') modalMsg.value = `Czy na pewno chcesz usunąć zlecenie numeru ${carInfo['Tel']}?`
      if (operation == 'relocate') {
        modalMsg.value = `Gdzie przenosimy zlecenie ${carInfo['Tel']}?`

      }
      showModal.value = true
    }

    async function modalResponse(response, newLocation) {
      const { id,Tel } = store.state.targetCar

      if (Operation.value == 'remove') {
        if (response == true) {
          const currentPath = tickets.collection(collectionPath.value)
          const confirmDelete = await DeleteFunc('ticket', currentPath, Tel, '', id)
          if(confirmDelete !== false) document.querySelector('.showElements').removeChild(document.getElementById(id)) // usuwam go z widoku tabeli
        }
        return showModal.value = false
      }
      if (Operation.value == 'relocate') {

        if (response == true) {
          let carData = []

          for (let i = 0; i < recivedItems.value.length; i++) {
            if (recivedItems.value[i] == id) {
              carData[recivedItems.value[i]] = recivedItems.value[i + 1]
              store.commit('setTargetCar', carData)
            }
          }
          const confirmDelete = await RelocateTicket('ticket', carData, tickets, collectionPath.value, newLocation, Tel)
         if(confirmDelete !== false) document.querySelector('.showElements').removeChild(document.getElementById(id)) // usuwam go z widoku tabeli
        }
      }
      return showModal.value = false
    }


    onMounted(() => {
      collectionPath.value = route.path.substring(1)
      limit.value = 40
      getDataFromFirebase()
    })

    watch(() => route.path, () => {
      limit.value = 40
      if (route.path == '/obecne' || route.path == '/wolne' || route.path == '/zakonczone') {
        collectionPath.value = route.path.substring(1)
        getDataFromFirebase()
      }
    })


    return {
      getDataFromFirebase,

      recivedItems,
      disableNextButton,

      collectionPath,
      isLoading,
      allCars,

      HandleOptions,
      redirectToDetails,

      Modal,
      showModal,
      modalResponse,
      modalMsg,
      Operation
    }

  },
})
</script>

