<template>
  <div class="container column">
    <button class="btn" @click="openClientAddForm()">Dodaj Klienta</button>

    <table class="showElements" v-if="recivedClients">
      <tr>
        <th class="hideUnder900"></th>
        <th></th>
        <th>Imie klienta:</th>
        <th>Numer telefonu:</th>
        <th class="hideUnder1340">Adres:</th>
        <th class="hideUnder1100">Uwagi:</th>
        <th>Pojazdy:</th>
      </tr>

      <tr v-for="(client, index) in recivedClients" :key="client.id" :id="`id${client.Tel}`">
        <td class="id hideUnder900">{{index+1}}</td>
        <td class="buttons-section width-42">
          <i class="fas fa-edit" @click="openClientEditForm(client)"></i>
          <i class="fas fa-plus" @click="openVehicleAddForm(client.Tel)"><i class="fas fa-car"></i></i>
          <i class="fas fa-trash-alt" @click="openDeleteModal(client, 'removeClient', onlyCars(client).length)"></i>
          </td>
        <td class="wrap">{{client.Imie }}</td>
        <td class="wrapSpace bold width-130">{{client.Tel }} {{ client.Tel2 ? `(${client.Tel2})` : ''}}</td>
        <td class="hideUnder1340">{{ client.Adres }}</td>
        <td class="wrap width-280 hideUnder1100">{{ client.Opis }}</td>

        <div class="borders width-300">
          <div v-for="car in onlyCars(client)" :id="`id${car.VIN}`" :key="car.VIN">
            <div v-if="car.VIN" class="row">
              <div class="left column">
                <div>{{ car.Marka }} {{ car.Model }}</div>
                <div>{{ car.VIN }}</div>
              </div>
              <div class="right row">
                <router-link :to="`/details/${car.VIN}`"><i class="fas fa-info"></i></router-link>
                <i class="fas fa-edit" @click="openVehicleEditForm(car)"></i>
                <i class="fas fa-trash-alt" @click="openDeleteModal(client, 'removeCar', car.VIN)"></i>
              </div>
            </div>
          </div>
        </div>
        
      </tr>

    </table>
    <button class="btn"
          @click="getClientsFromFirebase('more')" v-if="!disableNextButton">Załaduj więcej klientów</button>
        <Modal :message="modalMsg" :operation="Operation" v-if="showModal" @true="(status) => modalResponse(status)" @false="modalResponse(false)" />

  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import PopupFunc from '@/components/PopupFunc'

import Modal from '@/components/Modal.vue'

import { DeleteFunc } from '@/components/EditMoveDeleteOptions.js'

require('firebase/firestore')

 export default {
   components:{
     Modal
   },
   setup() {
     const store = useStore()
     const Router = useRouter()

     const recivedClients = ref()
     const recivedVehicles = ref()
     const showModal = ref(false)
     const modalMsg = ref('')
     const Operation = ref()
     const DeleteTargetCar = ref()
     const limit = ref(50)
     const lastDoc = ref(0)
     const disableNextButton = ref(true)
     const countClientCars = ref(0)

     const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

     async function getClientsFromFirebase(req) {
       if(req == 'more') limit.value += 50

      const clientPath = MainPath
      .orderBy("Ostatnia_Aktualizacja", "desc") // jak ujebie orderBy to doladowanie smiga i domyslnie sortuje po numerze tel.
       .limit(limit.value)

       let clientResponse = await clientPath.get()

       lastDoc.value = clientResponse.docs[clientResponse.docs.length - 1]

       if (!clientResponse.docs.length) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkich klientów.')
       }

       recivedClients.value = clientResponse.docs.map(doc => doc.data())

      disableNextButton.value = false
        if (clientResponse.docs.length < limit.value) {
          disableNextButton.value = true
          PopupFunc('warning', 'Wczytano już wszystkich klientów.')
        }
     }

     function openClientEditForm(item) {
       store.commit('setTargetClient', item)
       Router.push(`/klient/${item.Tel}/edytuj`)
     }

     function openClientAddForm(){
       Router.push(`/klient/dodaj`)
     }

     function openVehicleEditForm(item) {
       store.commit('setTargetCar', item)
       Router.push(`/pojazd/${item.VIN}/edytuj`)
     }

     function openVehicleAddForm(Tel){
       store.commit('setNumberForNewVehicle', Tel)
       Router.push('/pojazd/dodaj')
     }


    function openDeleteModal(data, operation, target) {
      Operation.value = operation
      DeleteTargetCar.value = target
      store.commit('setClientData', data)
      if (operation == 'removeClient') {
        modalMsg.value = `Czy na pewno chcesz usunąć klienta o numerze ${data['Tel']}?`
        countClientCars.value = target
      }
      if (operation == 'removeCar') modalMsg.value = `Czy na pewno chcesz usunąć pojazd klienta ${data.Tel}\n o numerze VIN: ${target}?`
      showModal.value = true
    }

    function onlyCars(client){
      return Object.values(client).filter(item => item instanceof Object)
    }

     async function modalResponse(response) {
         const { Tel } = store.state.clientData

         if (response == true) {
           if (Operation.value == 'removeClient') {

             const confirmDelete = await DeleteFunc('client', MainPath, Tel, countClientCars.value)
             if (confirmDelete !== false) document.querySelector(`#id${Tel}`).remove() // usuwam go z widoku tabeli
           }
           if (Operation.value == 'removeCar') {
             const confirmDelete = await DeleteFunc('car', MainPath, Tel, DeleteTargetCar.value, JSON.parse(JSON.stringify(store.state.clientData))) // prosta konwersja proxy do objektu
             if (confirmDelete !== false) document.querySelector(`#id${DeleteTargetCar.value}`).remove() // usuwam go z widoku tabeli
           }
         }
        return showModal.value = false
    }

     onMounted(() => {
       getClientsFromFirebase()
        limit.value = 50
     })

     return {

       recivedClients,
       recivedVehicles,

       openClientEditForm,
       openVehicleEditForm,

       showModal,
       modalMsg,
       modalResponse,
       openDeleteModal,
       Operation,
       openVehicleAddForm,
       openClientAddForm,

       onlyCars,
       getClientsFromFirebase,
       disableNextButton,
       countClientCars
     }

   }
 }
</script>

<style scoped>
table{
  width: fit-content;
  height: fit-content;
}

.buttons-section{
  padding: 8px 0;
}
.buttons-section i{
  padding: 4px 0;
}

.borders{
  border-right: 3px solid green;
  height: 100%;
  padding: 6px 4px;
  position: relative;
  display: grid;
  align-items: center;
}

.borders::after{
  content: '';
  position: absolute;
  top: -1px;
  left: 0px;
  width: 100%;
  height: 3px;
  background-color: green; 
}
.borders::before{
  content: '';
  position: absolute;
  bottom: -1px;
  left: -1px;
  width: 101%;
  height: 2px;
  background-color: green;
}

.row{
  gap: 10px;
  width: 100%;
}

.fa-plus{
  font-size: 0.85rem!important;
  padding: 12px 0;
  display: flex;
  align-items: center;
  margin-left: 50%;
  transform: translateX(-50%)
}

i{
  width: fit-content;
  font-size: 1.66rem;
}
.left,
.right{
  padding: 8px 0;
}

.left.column{
  width: fit-content;
  padding-left: 4px;
}

.right.row{
  align-items: center;
  justify-content: flex-end;
  padding: 0;
}

.width-50{
  width: 50px;
}
.width-130{
  width: 130px;
  min-width: 130px;
}
.width-280{
  min-width: 200px;
  width: 280px;
}

.width-300{
  max-width: 300px;
}

.width-42{
  width: 42px;
}

tr:nth-child(even){
  background-color: #444;
}
</style>