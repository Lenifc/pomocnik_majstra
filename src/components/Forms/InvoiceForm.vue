<template>
<div class="p-my-6">
  <Button label="Generuj" class="p-d-flex p-mx-auto" @click="createPDF()" />
  <div class="card p-my-6">
    <div class="card-content">
      <div class="card-header p-mt-4">
        <div class="p-d-flex p-flex-row p-jc-between p-ai-center">
          <div class="invoice-logo p-d-flex p-flex-row p-ai-center">
            <div style="width: 80px"><img alt="workshopLogo" src="@/assets/logo.svg" style="width: 100%"></div>
            <div class="workshopTitle p-text-uppercase p-text-bold">Warsztat_XD</div>
          </div>
          <div class="invoice-title p-text-right p-text-bold">
            FAKTURA nr {{ randomIndex }}/{{ getYear }}
          </div>
          <div>Data wystawienia: {{ getTodaysDate }}</div>
        </div>
        <div class="p-mt-4">
          <h3 class="p-text-uppercase">Sprzedawca</h3>
          <div>{{ workshopDetails?.['nazwaWarsztatu'] }}</div>
          <div>{{ `${workshopDetails?.['kodPocztowy']} ${workshopDetails?.['miejscowosc']}`}}</div>
          <div>{{ workshopDetails?.['adres'] }}</div>
          <div>NIP: {{ workshopDetails?.['NIP'] }}</div>
          <div>Tel: {{ workshopDetails?.['numerTelefonu'] }}</div>
          <div>email: {{ workshopDetails?.['email'] }}</div>
          <div>nr konta bankowego: {{ workshopDetails?.['kontoBankowe'] }}</div>
        </div>

        <div class="p-mt-3" v-if="clientDetails">
          <h3 class="p-text-uppercase">Nabywca</h3>
          <div>{{ clientDetails?.['Imie'] }}</div>
          <div v-if="clientDetails?.['NIP']">NIP: {{ clientDetails?.['NIP'] }}</div>
          <div>Tel: {{ clientDetails?.['Tel'] }}</div>
          <div v-if="clientDetails?.['KodPocztowy'] && clientDetails?.['Miejscowosc']">
            {{ `${clientDetails?.['KodPocztowy']} ${clientDetails?.['Miejscowosc']} `}}
            </div>
          <div>{{ clientDetails?.['Ulica'] }}</div>
        </div>
        <div class="p-mt-2" v-else><h3>Dane klienta zostały usunięte z bazy!</h3></div>

      </div>
      <div class="card-main p-mt-4">
        <DataTable v-if="ticketDetails?.['Wykonane_uslugi_czesci'].length" :value="ticketDetails?.['Wykonane_uslugi_czesci']" responsiveLayout="scroll">
          <Column header="l.p." class="p-text-center">
          <template #body="{index}">
            {{index+1}}
          </template></Column>
          <Column field="part_service_Name" header="Towar / Usługa" class="p-text-left"></Column>
          <Column field="quantity" header="Ilość [szt./l.]" class="p-text-center"></Column>
          <Column field="price_net" header="Cena netto[zł]" class="p-text-right"></Column>
          <Column field="totalCost_net" header="Wartość netto[zł]" class="p-text-right"></Column>
          <Column field="tax" header="Stawka VAT" class="p-text-center">
          <template #body="{data}">
            {{data.tax}}%
          </template>
          </Column>
          <Column field="price_gross" header="Cena brutto[zł]" class="p-text-right"></Column>
          <Column field="totalCost_gross" header="Wartość brutto[zł]" class="p-text-right"></Column>
        </DataTable>

        <div class="p-mt-5 p-mb-3">
          <div v-html="calcTotalCosts(ticketDetails?.['Wykonane_uslugi_czesci'])"></div>
          <div>Płatność gotówką</div>
        </div>     
        
        <div v-if="carDetails">{{ `${carDetails?.['Marka']?.toUpperCase()} ${carDetails?.['Model']} ${carDetails?.['Wersja_Rocznik'] || ''}, ${
          carDetails?.['VIN']}, ${carDetails?.['Numer_rejestracyjny'] || ''} ${carDetails?.['Przebieg'] ?  ', Stan licznika: ' + carDetails?.['Przebieg'] + 'km' : ''}`}}</div>
          <div v-else><h3>Dane pojazdu zostały usunięte z bazy!</h3></div>
      </div>
      <div class="p-d-flex p-flex-row p-jc-evenly p-mt-10">
        <div class="client p-w-150 p-text-center">
          <Divider />
          Podpis nabywcy
        </div>
        <div class="seller p-w-150 p-text-center">
          <Divider />
          Podpis Sprzedającego
        </div>
      </div>
      <div class="card-footer p-text-center p-mt-6">
        <span>{{ workshopDetails?.['stopka'] }}</span>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from "primevue/usetoast"

import firebase from 'firebase/app'

import Skeleton from 'primevue/skeleton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Divider from 'primevue/divider';

import createPDF from '@/components/CreatePDF'

export default {
  setup() {

    const store = useStore()
    const router = useRouter()
    const dataToFetch = ref()
    const ticketDetails = ref()
    const clientDetails = ref()
    const carDetails = ref()
    const workshopDetails = ref()
    const toast = useToast()


    const randomIndex = computed(() => Math.floor((Math.random()*123)+2))
    const getYear = computed(() => new Date().getFullYear())
    const getTodaysDate = computed(() => new Date().toLocaleDateString())

    async function fetchTicketDetails() {

      const ticketPath = firebase.firestore()
        .collection('warsztat').doc('zlecenia').collection('zakonczone').doc(`zlecenie-${store.state.invoiceData.ticketID}`)

      ticketPath.get().then(recived => {
        ticketDetails.value = recived.data()
      }).catch(err => console.log(err))
    }

    async function fetchClientDetails() {

      const clientPath = firebase.firestore()
        .collection('warsztat').doc('Klienci').collection('Numery').doc(dataToFetch.value.phoneNum)

      clientPath.get().then(recived => {
        // odfiltrowuje pojazdy przypisane do klienta i zostawiam same dane klienta
        // filtrowanie zamienia nam Obiekt na tablice, wiec w nastepnym kroku musimy przywrocic stan Obiektu
        if(recived.data()){
        let clientResponse = Object.entries(recived.data()).filter(item => !(item[1] instanceof Object))

        // zamieniam tablice z powrotem na obiekt, ktory zawiera keys oraz values
        clientDetails.value = Object.fromEntries(clientResponse.map(item => [item[0], item[1]]))

        // odfiltrowuje ten jeden konkretny pojazd przypisany do klienta
        let response = Object.entries(recived.data()).filter(item => item ?.[1]['VIN'] == dataToFetch.value.vehicleVIN)
        carDetails.value = response[0][1]
        } else{
          toast.add({severity:'warn', detail:`Dane klienta o podanym numerze zostały usunięte z bazy`, life: 5000})
        }
      }).catch(err => console.log(err))
    }

    async function fetchWorkshopDetails(){

      const workshopPath = firebase.firestore()
        .collection('warsztat').doc('DaneDoFaktur')

      workshopDetails.value = (await workshopPath.get()).data()
    }

      function calcTotalCosts(order) {
      let totalGross = 0
      let totalNet = 0
      if(order) order.forEach(item => {
        totalGross += Number(item['totalCost_gross'])
        totalNet += Number(item['totalCost_net'])
      })
      return `<h2>Do zapłaty:  <span class="p-text-bold" style="color: var(--pink-600)">${totalGross.toFixed(2)}</span>zł
                <div class="p-text-normal" style="font-size: 1.1rem">Netto: <span style="color: var(--pink-600)">${totalNet.toFixed(2)}</span>zł</div>
              </h2>`
    }


    onMounted(() => {
      // w przypadku wejscia w link z wyszukiwarki, a nie z przycisku cofnie nas do poprzedniej strony
      // klikniecie w przycisk zapisuje potrzebne nam dane do wykonania Fetch requestu
      dataToFetch.value = store.state.invoiceData
      if (!dataToFetch.value || Object.values(dataToFetch.value).length < 1) router.go(-1)
      else {
        fetchTicketDetails()
        fetchClientDetails()
        fetchWorkshopDetails()
      }
    })
    return {
      dataToFetch,
      ticketDetails,
      clientDetails,
      carDetails,
      workshopDetails,
      calcTotalCosts,

      randomIndex,
      getYear,
      getTodaysDate,

      createPDF,

      Skeleton,
      DataTable,
      Column,
      Divider
    }

  }
}
</script>

<style scoped>
.card{
  color:black;
  background-color: rgb(235, 235, 235);
  border: 3px solid black;
  border-radius: 6px;
  max-width: 960px;
  margin: 0 auto;
}
.card-content{
  padding: 8px 20px;
}
.p-mt-10{
  margin-top: 96px;
}
.p-w-150{
  width:150px
}
</style>