<template>
  <div class="column">
    <h1>SZCZEGÓŁY zlecenia {{$route.params.ticketDetails}}</h1>
    <div class="cars-details" v-if="carDetails">

      <div :id="carDetails['id']" style="color: white" class="column">
        <div class="row">
          <div class="client">
            <div class="row">
              <h3>Klient:</h3>
              <div><i class="fas fa-edit"></i></div>
            </div>
            <div>Imie: {{ carDetails['Imie'] }}</div>
            <div>Numer Telefonu: {{ carDetails['Tel'] }}</div>
          </div>
          <div class="vehicle">
            <div class="row">
              <h3>Pojazd:</h3>
              <div><i class="fas fa-edit"></i></div>
            </div>
            <div>Marka: {{ carDetails['Marka'] }}</div>
            <div>Model: {{ carDetails['Model'] }}</div>
            <div v-if="carDetails['Rok_prod']">Rok_prod: {{ carDetails['Rok_prod'] }}</div>
            <div v-if="carDetails['VIN']"> VIN: {{ carDetails['VIN'] }}</div>
            <div v-if="carDetails['Numer_rejestracyjny']">Tablice: {{ carDetails['Numer_rejestracyjny'] }}</div>
            <div v-if="carDetails['Paliwo']">Paliwo: {{ carDetails['Paliwo'] }}</div>
            <div v-if="carDetails['Silnik']">Silnik: {{ carDetails['Silnik'] }}</div>
            <div v-if="carDetails['Naped']">Napęd: {{ carDetails['Naped'] }}</div>
            <div v-if="carDetails['SkrzyniaBiegow']">Skrzynia biegów: {{ carDetails['SkrzyniaBiegow'] }}</div>
            <div v-if="carDetails['Przebieg']">Przebieg: {{ carDetails['Przebieg'] }}</div>
            <div v-if="carDetails['Opis']">Opis: {{ carDetails['Opis'] }}</div>
          </div>
        </div>
            <div class="row">
              <h3>Szczegóły zlecenia:</h3>
              <div><i class="fas fa-edit"></i></div>
            </div>
        <div>Zlecenie dodane: {{ carDetails['Dodane_Czas'] }}</div>
        <div v-if="$route.params.collectionPath == 'zakonczone'">Zlecenie zakonczone:
          {{ carDetails['Zakonczone_Czas'] }}</div>
        <table v-if="carDetails['Wykonane_uslugi_czesci'].length">
          <tr>
            <th>Nazwa:</th>
            <th>Ilość:</th>
            <th>Netto[PLN]:</th>
            <th>Netto całość[PLN]:</th>
            <th>Stawka VAT:</th>
            <th>Brutto[PLN]:</th>
            <th>Brutto całość[PLN]:</th>
          </tr>
          <tr v-for="item in carDetails['Wykonane_uslugi_czesci']" :key="item">
            <td>{{ item['part_service_Name'] }}</td>
            <td>{{ item['quantity']}}</td>
            <td>{{ item['price_net']}}</td>
            <td>{{ item['totalCost_net']}}</td>
            <td>{{ item['tax']}}%</td>
            <td>{{ item['price_gross']}}</td>
            <td>{{ item['totalCost_gross']}}</td>
          </tr>
          <tr>
            <td>Suma Netto: </td>
            <td colspan="2">{{ ComputedShowTotalNet }} PLN</td>
          </tr>
          <tr>
            <td>Suma Brutto: </td>
            <td colspan="2">{{ ComputedShowTotalGross }} PLN</td>
          </tr>
        </table>

        <div class="row">
          <button class="btn" @click="HandleFunc($event)">Usuń</button>
          <button class="btn" @click="HandleFunc($event)">Przenieś</button>
          <button class="btn" @click="HandleFunc($event)"
            v-if="$route.params.collectionPath == 'zakonczone' && carDetails['Wykonane_uslugi_czesci'].length">Generuj Fakture</button>
        </div>

      </div>

    </div>
  <Modal :message="modalMsg" :operation="Operation" v-if="showModal" @true="(status, newLocation) => modalResponse(status, newLocation || '')" @false="modalResponse(false)" />
  
  </div>
</template>

<script>
import firebase from 'firebase/app'
import PopupFunc from '@/components/PopupFunc.js'
import { DeleteFunc } from '@/components/EditMoveDeleteOptions'

import Modal from '@/components/Modal.vue'
  
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const openEditor = ref(false)

    const showModal = ref(false)
    const modalMsg = ref('')

    const carDetails = ref()
    const showTotalNet = ref(0)
    const showTotalGross = ref(0)
    const ComputedShowTotalNet = computed(() => showTotalNet.value.toFixed(2))
    const ComputedShowTotalGross = computed(() => showTotalGross.value.toFixed(2))

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    const currentPath = tickets.collection(route.params.collectionPath)
    const currentPhoneNum = route.params.phoneNum


    function fetchData() {
      tickets.collection(route.params.collectionPath).doc(currentPhoneNum)
        .get().then(recived => {
          // console.log(recived.data())
          let response = Object.entries(recived.data()).filter(item => item?.[1]['id'] == route.params.ticketDetails)
          carDetails.value = response[0][1]

          if(carDetails.value['Wykonane_uslugi_czesci']){
            carDetails.value['Wykonane_uslugi_czesci'].forEach(item =>{
              showTotalGross.value += Number(item['totalCost_gross'])
              showTotalNet.value += Number(item['totalCost_net'])
            })
          }

        }).catch(() => {
          carDetails.value = ''
          PopupFunc('error', 'Wystąpił problem ze znalezieniem danego numeru: \n' + currentPhoneNum)
        })
    }
      

    async function HandleFunc(e) {
      const target = e.target.innerText
      const id = e.target.parentElement.parentElement.parentElement.id
      if (target == 'Usuń') {
        await DeleteFunc('ticket', currentPath, currentPhoneNum, '', route.params.ticketDetails)
        router.go(-1)
      }
      if (target == 'Edytuj') EditFunc(id)
      if(target == 'Generuj Fakture') {
        const invoiceData = {
          phoneNum: currentPhoneNum,
          vehicleVIN: carDetails.value['VIN'],
          ticketID: route.params.ticketDetails
        }
        store.commit('setInvoiceData', invoiceData)
        router.push('/generujFakture')
      }
      // if (target == 'Przenieś') MoveFunc(id)
    }

    function EditFunc() {
      openEditor.value = true

      router.push(`/edytuj/${route.params.collectionPath}/${currentPhoneNum}/${route.params.ticketDetails}`)
    }

    onMounted(() => {
      fetchData()
    })

    // ponizej fix na przejscie z details/... to zlecen
    watch(() => route.params.ticketDetails, () => {
      if (route.path.includes('details')) fetchData()
    })
    watch(() => route.params.collectionPath, () => route.path.includes('details') ? fetchData() : '')

    return {
      carDetails,

      HandleFunc,
      openEditor,
      ComputedShowTotalNet,
      ComputedShowTotalGross,

      showModal,
      modalMsg,
      Modal
    }
  }
}
</script>

<style>
.cars-details {
  margin-top: 128px;
  display: flex;
  justify-content: center;
  color: black;
  width: max(300px, 50%)
}
</style>