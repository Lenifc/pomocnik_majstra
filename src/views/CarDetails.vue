<template>
  <div class="p-pt-5">
    <Card style="max-width:1100px" class="relative">
      <template #title>
        <div class="closeForm" @click="$router.go(-1)">&times;</div>
        <div class="p-text-center p-my-2">Szczegółowe dane pojazdu:
          {{ `${carDetails?.Marka} ${carDetails?.Model} ${carDetails?.Wersja_Rocznik || ''}` }}</div>
      </template>
      <template #content>
        <div class="p-d-flex p-flex-column p-flex-lg-row p-jc-center" @dblclick="copyValue($event)">
          <div class="p-d-flex p-flex-column" style="max-width:290px">
            <div class="p-d-flex p-flex-row p-mb-1">
              <div class="p-text-bold p-mr-2">Klient: </div>
              <div class="copy">{{ carDetails?.['Tel'] }}</div>
            </div>
            <div class="p-d-flex p-flex-row p-mb-1">
              <div class="p-text-bold p-mr-2">Marka: </div>
              <div class="copy">{{ carDetails?.['Marka'] }}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Model: </div>
              <div class="copy">{{ carDetails?.['Model'] }}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rok produkcji / Generacja: </div>
              <div class="copy">{{ carDetails?.['Wersja_Rocznik'] || ''}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">VIN: </div>
              <div class="copy">{{ carDetails?.['VIN'] }}</div>
            </div>
            <a class="p-button-text p-link" target="_blank" rel="noreferrer" v-if="carDetails?.['VIN']"
              :href="`https://pl.vindecoder.pl/${carDetails?.['VIN']}`" style="width:250px">Sprawdź dane pojazdu po nr VIN </a>
            <div class="p-d-flex p-flex-row p-my-1" v-if="carDetails?.['Numer_rejestracyjny']">
              <div class="p-text-bold p-mr-2">Numer rejestracyjny: </div>
              <div class="copy">{{ carDetails?.['Numer_rejestracyjny'] || 'Nie wprowadzono danych'}}</div>
            </div>
          </div>
          <div class="p-ml-0 p-mt-4 p-mt-lg-0 p-ml-lg-4 p-d-flex p-flex-column" style="max-width:280px">
            <h4 class="p-jc-start">Silnik:</h4>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Pojemność[cm<sup>3</sup>]: </div>
              <div class="copy">{{ carDetails?.['Silnik_Pojemnosc'] || 'Nie wprowadzono danych' }}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Moc[KM]: </div>
              <div class="copy">{{ carDetails?.['Silnik_Moc'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Kod/Oznaczenie: </div>
              <div class="copy">{{ carDetails?.['Silnik_Kod'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rodzaj paliwa: </div>
              <div class="copy">{{ carDetails?.['Paliwo'] || 'Nie wprowadzono danych'}}</div>
            </div>
          </div>
          <div class=" p-ml-0 p-mt-4 p-mt-lg-0 p-ml-lg-4 p-d-flex p-flex-column">
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Przebieg: </div>
              <div class="copy">{{ carDetails?.['Przebieg'] + ' km' || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rodzaj napędu: </div>
              <div class="copy">{{ carDetails?.['Naped'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1">
              <div class="p-text-bold p-mr-2">Rodzaj skrzyni biegów: </div>
              <div class="copy">{{ carDetails?.['SkrzyniaBiegow'] || 'Nie wprowadzono danych'}}</div>
            </div>
            <div class="p-d-flex p-flex-row p-my-1" v-if="carDetails?.['Opis']">
              <div class="p-text-bold p-mr-2">Dodatkowe informacje: </div>
              <div v-html="carDetails?.['Opis']"></div>
            </div>
          </div>

        </div>
        <TicketsHistory :VIN="carDetails?.['VIN']" :Tel="carDetails?.['Tel']" />
      </template>
      <template #footer>
        <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center p-mb-3">
          <Button label="Edytuj dane pojazdu" @click="openEditVehicleForm()" icon="pi pi-pencil" />
          <Button :label="`Usuń pojazd klienta ${carDetails?.['Tel']}`" @click="confirmDeleteModal(clientDetails, 'removeCar', carDetails.VIN)"
            class="p-button-danger p-ml-0 p-ml-md-3 p-mt-3 p-mt-md-0" icon="pi pi-trash" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { callTicketsHistory } from '@/components/fetchTicketHistory.js'
import TicketsHistory from '@/components/TicketsHistory.vue'
import { DeleteFunc, relocateCarToUnassigned } from '@/components/EditMoveDeleteOptions.js'

import firebase from 'firebase/app'
  
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm";

import copyToClipboard from '@/components/copyToClipboard.js'



export default {
  components:{
    TicketsHistory
  },
  setup() {
    // const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const toast = useToast()
    const confirm = useConfirm()

    const carDetails = ref()
    const clientDetails = ref()

     const allTickets = ref()
     const isThereAnyTicket = ref()

    const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

    function openEditVehicleForm() {
      // caly czas w pamieci store mam zapisane dane pojazdu, wiec nie musze ich na nowo przesylac, a jedynie przekierowac routerem do formularza
      router.push(`/pojazd/${carDetails.value?.['VIN']}/edytuj`)
    }

    async function copyValue(e){
      const text = e.target?.innerText
      if(e.target.classList.contains('copy')) {
        await copyToClipboard(text)
        toast.add({severity:'info', summary: 'Wartość skopiowana', detail:`Wartość "${text}" została skopiowana do schowka`, life: 3000})
      }
    }

    const confirmDeleteModal = async (clientData, operation, target) => {
      allTickets.value = await callTicketsHistory(target)

       setTimeout(() => {
        //  console.log(allTickets.value)
         isThereAnyTicket.value = allTickets.value.some(ticket => ticket[1].length > 0)
       }, 500)

      confirm.require({
        message: operation == 'removeCar' ? 
            `Czy na pewno chcesz usunąć pojazd klienta ${clientData?.Tel}\n o numerze VIN: ${target}?` : 'Jezeli sie to wyswietla to jest cos do poprawy!',
        header: `Usuń pojazd`,
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-success',
        rejectClass: 'p-button-danger',
        acceptLabel: 'Tak',
        rejectLabel: 'Nie',
        accept: async () => {
          const { Tel } = clientData
          if (operation == 'removeCar') {
            if(isThereAnyTicket.value == false || clientData['Tel'] == '000-000-000'){
            const confirmDelete = await DeleteFunc('car', MainPath, Tel, target, JSON.parse(JSON.stringify(clientData))) // prosta konwersja proxy do objektu
            if (confirmDelete !== false) {
              toast.removeAllGroups()
              toast.add({severity:'success', detail:'Pomyślnie usunięto pojazd z listy klienta.', life: 4000})
              router.go(-1)
            }
            } else if(isThereAnyTicket.value == true){
              const confirmDelete = await relocateCarToUnassigned('car', MainPath, Tel, target, JSON.parse(JSON.stringify(clientData)), 'doNotCount') // prosta konwersja proxy do objektu
               if (confirmDelete !== false) {
                 toast.removeAllGroups()
                  toast.add({severity:'success', detail:'Pomyślnie usunięto pojazd z listy klienta.', life: 4000})
                  router.go(-1)
               }
             }
            }
          },
        reject: () => {}
      });
    }

    onBeforeMount(() => {
      // w przypadku proby wejscia bezposrednio z linku odesle nas do ostatniej strony ze wzgledu na brak danych w pamieci
      // ew. zamiast powrotu mozna zrobic pobranie danych z firebase
      if(!store.state?.targetCar){
        router.go(-1)
      }else{
        carDetails.value = store.state?.targetCar
        clientDetails.value = store.state?.targetClient
      }
    })

    return {
      carDetails,
      clientDetails,
      confirmDeleteModal,

      openEditVehicleForm,

      copyValue,
      TicketsHistory,
    }
  }
}
</script>

<style>
</style>