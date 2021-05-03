<template>
  <div class="container column">
    <button class="btn" @click="openClientAddForm()">Dodaj Klienta</button>

    <table class="showElements" v-if="recivedClients">
      <tr>
        <th></th>
        <th></th>
        <th>Imie klienta:</th>
        <th>Numer telefonu:</th>
        <th>Adres:</th>
        <th>Uwagi:</th>
        <th>Pojazdy:</th>
      </tr>

      <tr v-for="(client, index) in recivedClients" :key="client.id" :id="`id${client.Tel}`">
        <td class="id">{{index+1}}</td>
        <td class="width-60 buttons-section">
          <i class="fas fa-edit" @click="openClientEditForm(client)"></i>
          <i class="fas fa-plus" @click="openVehicleAddForm(client.Tel)"><i class="fas fa-car"></i></i>
          <i class="fas fa-trash-alt" @click="openDeleteModal(client, 'removeClient')"></i>
          </td>
        <td class="wrap">{{client.Imie }}</td>
        <td class="wrapSpace bold width-140">{{client.Tel }} {{ client.Tel2 ? `(${client.Tel2})` : ''}}</td>
        <td>{{ client.Adres }}</td>
        <td class="wrap width-200">{{ client.Opis }}</td>

        <div v-for="car in onlyCars(client)" :id="`id${car.VIN}`" :key="car.VIN" class="borders row align-center">
          <div v-if="car.VIN" class="row">
            <div class="left">
              <div>{{ car.Marka }} {{ car.Model }}</div>
              <div>{{ car.VIN }}</div>
            </div>
            <div class="right row">
              <i class="fas fa-edit" @click="openVehicleEditForm(car)"></i>
              <i class="fas fa-trash-alt" @click="openDeleteModal(client, 'removeCar', car.VIN)"></i>
            </div>
          </div>
        </div>
      </tr>

    </table>
        <Modal :message="modalMsg" :operation="Operation" v-if="showModal" @true="(status) => modalResponse(status)" @false="modalResponse(false)" />

  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

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

     const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

      const clientPath = MainPath.orderBy('Ostatnia_Aktualizacja', 'desc')
       .limit(30)


     async function getClientsFromFirebase() {
       let clientResponse = await clientPath.get({ includeMetadataChanges: true })

       recivedClients.value = clientResponse.docs.map(doc => doc.data())
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
      if (operation == 'removeClient') modalMsg.value = `Czy na pewno chcesz usunąć klienta o numerze ${data['Tel']}?`
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
             const confirmDelete = await DeleteFunc('client', MainPath, Tel)
             if (confirmDelete !== false) document.querySelector(`#id${Tel}`).remove() // usuwam go z widoku tabeli
           }
           if (Operation.value == 'removeCar') {
             const confirmDelete = await DeleteFunc('car', MainPath, Tel, DeleteTargetCar.value, JSON.parse(JSON.stringify(store.state.clientData))) // prosta konwersja proxy do objektu
             if (confirmDelete !== false) document.querySelector(`#id${DeleteTargetCar.value}`).remove() // usuwam go z widoku tabeli
           }
         }
        return showModal.value = false
    }

     onMounted(() => getClientsFromFirebase())
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

       onlyCars
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

.borders{
  border-right: 3px solid green;
  height: 100%;
  padding: 6px 4px;
  position: relative;
}

.borders::after{
  content: '';
  position: absolute;
  top: -1px;
  left: 0px;
  width: 100%;
  height: 2px;
  background-color: green; 
}
.borders::before{
  content: '';
  position: absolute;
  bottom: -2px;
  left: -2px;
  width: 101%;
  height: 3px;
  background-color: green;
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

.left{
  border: 2px solid yellow;
  width: 150%;
}

.right.row{
  align-items: center;
  justify-content: flex-end;
  padding: 0;
}

.width-60{
  width: 60px;
}
.width-140{
  width: 140px;
  min-width: 130px;
  max-width: 140px;
}
.width-200{
  width: 200px;
}

.align-center{
  align-items: center;
  width: 100%;
}

tr:nth-child(even){
  background-color: #444;
}

</style>