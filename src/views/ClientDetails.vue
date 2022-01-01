<template>
<div class="p-pt-5">
  <Card style="max-width:600px; margin: 0 auto" class="relative">
      <template #title>
        <div class="closeForm" @click="$router.go(-1)">&times;</div>
        <div class="p-text-center">Szczegóły klienta {{ clientDetails?.Imie }}</div>
      </template>
      <template #content>
        <div class="p-text-bold p-my-2 p-pl-3">id: {{clientDetails?.id}}</div>
        <div class="p-my-1 p-pl-3">Tel. kontaktowy: {{ `${clientDetails?.Tel} ${clientDetails?.Tel2 ? ' ; ' + clientDetails?.Tel2 : ''}` }}</div>
        <div class="p-my-1 p-pl-3">Rodzaj klienta: {{ clientDetails?.Rodzaj == 'Firma' ? 'Firma / JDG' : 'Klient prywatny' }}</div>
        <div class="p-my-1 p-pl-3" v-if="clientDetails?.Rodzaj == 'Firma'">NIP: {{ clientDetails?.NIP }}</div>
        <div class="p-my-1 p-pl-3"
          v-if="clientDetails?.KodPocztowy && clientDetails?.Miejscowosc && clientDetails?.Ulica"> 
          {{ `${clientDetails?.KodPocztowy} ${clientDetails?.Miejscowosc} - ul. ${clientDetails?.Ulica}` }}</div>
        <div class="p-my-1 p-pl-3">Ilość pojazdów przypisanych do klienta: {{ clientDetails ? totalCars : ''}}</div>
        <div class="p-my-1 p-pl-3" v-if="clientDetails?.Opis">Dodatkowe informacje:</div>
        <div class="p-my-1 p-pl-5" v-if="clientDetails?.Opis" v-html="clientDetails?.Opis"></div>
      </template>
      <template #footer>
        <div class="p-d-flex p-flex-column p-flex-sm-row p-jc-center">
          <Button label="Edytuj dane klienta" @click="openEditClientForm()" icon="pi pi-pencil" />
          <Button label="Usuń klienta" class="p-button-danger p-mx-0 p-mx-sm-3 p-my-3 p-my-sm-0" icon="pi pi-trash" @click="confirmDeleteModal(clientDetails)"/>
          <Button label="Przypisz pojazd" class="p-button-success" icon="pi pi-car" @click="$router.push('/pojazdy/')"/>
        </div>
      </template>
    </Card>
</div>
</template>

<script>
import firebase from 'firebase/app'

import { DeleteFunc } from '@/components/EditMoveDeleteOptions'
import { useToast } from "primevue/usetoast"
import { useConfirm } from "primevue/useconfirm"
  
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  setup() {
    // const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const toast = useToast()
    const confirm = useConfirm()

    const clientDetails = ref()
    const clientCars = ref()
    const totalCars = ref(0)

    const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')


    function openEditClientForm() {
      // caly czas w pamieci store mam zapisane dane pojazdu, wiec nie musze ich na nowo przesylac, a jedynie przekierowac routerem do formularza
      router.push(`/klient/${clientDetails.value?.['Tel']}/edytuj`)
    }

    const confirmDeleteModal = (clientData, operation, target) => {
      confirm.require({
        message: `Czy napewno chcesz usunąć klienta o podanym numerze telefonu: ${clientData['Tel']}?`,
        header: `Usuń klienta`,
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-success',
        rejectClass: 'p-button-danger',
        acceptLabel: 'Tak',
        rejectLabel: 'Nie',
        accept: async () => {
          const { Tel } = clientData

            const confirmDelete = await DeleteFunc('client', MainPath, Tel, target)
            if (confirmDelete !== false) {
              router.push('/klienci')
              toast.removeAllGroups()
              toast.add({severity:'success', detail:'Pomyślnie usunięto dane klienta', life: 4000})
          }
        },
        reject: () => {}
      });
    }

     async function countVehicles(){
        const vehiclesPath = firebase.firestore().collection('warsztat').doc('Pojazdy').collection('VIN').where('Tel', '==', clientDetails?.value?.Tel)

        let getTotal = (await vehiclesPath.get()).size
        totalCars.value = getTotal
        }

    onBeforeMount(() => {
      // w przypadku proby wejscia bezposrednio z linku odesle nas do ostatniej strony ze wzgledu na brak danych w pamieci
      if(!store.state?.targetClient){
        router.push('/klienci')
      }else{
        clientDetails.value = store.state?.targetClient
        countVehicles()
      }
    })

    return {
      clientDetails,
      clientCars,
      totalCars,

      openEditClientForm,

      countVehicles,
      confirmDeleteModal
    }
  }
}
</script>

<style>
</style>