<template>
  <div class="container column">
    <button class="btn" @click="openClientAddForm()">Dodaj Klienta</button>

    <table class="showElements" v-for="client in recivedClients" :key="client.id" :id="`id${client.Tel}`">
      <tr>
        <th></th>
        <th>Imie klienta:</th>
        <th>Numer telefonu:</th>
        <th :class="{hide: !client.Tel2}">Dodatkowy numer telefonu:</th>
        <th :class="{hide: !client.Adres}">Adres:</th>
        <th>Pojazdy:</th>
      </tr>

      <tr :id="`id${client.Tel}`">
        <td>
          <i class="fas fa-edit" @click="openClientEditForm(client)"></i>
          <i class="fas fa-plus"><i class="fas fa-car" @click="openVehicleAddForm(client.Tel)"></i></i>
          <i class="fas fa-trash-alt" @click="openDeleteModal(client, 'removeClient')"></i>
          </td>
        <td class="wrap">{{client.Imie }}</td>
        <td class="noWrap bold">{{client.Tel }}</td>
        <td :class="{hide: !client.Tel2}">{{client.Tel2 }}</td>
        <td :class="{hide: !client.Adres}">{{ client.Adres }}</td>

        <div v-for="car in client" :id="`id${car.VIN}`" :key="car.VIN" class="mainTicketDetails">
          <div v-if="car.VIN" class="borders">
            <div>{{ car.Marka }} {{ car.Model }}</div>
            <div>{{ car.VIN }}</div>
            <div class="row">
              <i class="fas fa-edit" @click="openVehicleEditForm(car)"></i>
              <i class="fas fa-trash-alt" @click="openDeleteModal(client, 'removeCar', car.VIN)"></i>
            </div>
          </div>
<Modal :message="modalMsg" :operation="Operation" v-if="showModal" @true="(status, newLocation) => modalResponse(status, newLocation || '')" @false="modalResponse(false)" />

        </div>
      </tr>

    </table>

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

     const clientPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')


     async function getClientsFromFirebase() {
       let clientResponse = await clientPath.get()

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

     async function modalResponse(response) {
      const { Tel } = store.state.clientData

      if (Operation.value == 'removeClient') {
        if (response == true) {
          const confirmDelete = await DeleteFunc('client', clientPath, Tel)
          if(confirmDelete !== false) document.querySelector(`#id${Tel}`).remove() // usuwam go z widoku tabeli
        }
        return showModal.value = false
      }
      if(Operation.value == 'removeCar'){
        if (response == true) {
          const confirmDelete = await DeleteFunc('car', clientPath, Tel, DeleteTargetCar.value , JSON.parse(JSON.stringify(store.state.clientData)))
          if(confirmDelete !== false) document.querySelector(`#id${DeleteTargetCar.value}`).remove() // usuwam go z widoku tabeli
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
       openClientAddForm
     }

   }
 }
</script>

<style scoped>

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
  left: 0px;
  width: 101%;
  height: 3px;
  background-color: green;


}

.hide{
  display: none;
}

.fa-plus{
  font-size: 0.85rem!important;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}


table{
  margin: 12px 0;
}
</style>