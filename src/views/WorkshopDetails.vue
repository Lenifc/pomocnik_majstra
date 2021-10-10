<template>
  <div class="p-d-flex p-flex-column p-ai-center p-pt-4">
    <Card style="width: min(620px, 100%)">
      <template #title>
        <h3 class="p-mx-3 p-text-center p-my-3">Dane warsztatu, które będą widoczne na fakturze oraz na stronie głównej
        </h3>
      </template>
      <template #content class="p-d-flex p-ai-center p-jc-center">
        <div v-if="!isLoading" style="width: min(550px, 100%)">
          <span class="p-float-label p-mt-4">
            <Textarea type="text" id="workshopName" v-model="workshop.nazwaWarsztatu" :autoResize="true"
              style="width: 100%" />
            <label for="workshopName">Nazwa warsztatu</label>
          </span>
          <div class="p-d-flex p-flex-column p-flex-md-row ">
            <div class="p-d-flex p-flex-row">
              <span class="p-float-label p-mt-4">
                <InputMask mask="999-999-999" id="workshopPhoneNumber" v-model="workshop.numerTelefonu"
                          style="width:120px" />
                <label for="workshopPhoneNumber">Numer kontaktowy</label>
              </span>
              <span class="p-float-label p-mt-4 p-ml-2">
                <InputText type="text" id="workshopEmail" v-model="workshop.email" style="width: 100%" />
                <label for="workshopEmail">E-mail</label>
              </span>
            </div>
            
            <span class="p-float-label p-mt-4 p-ml-md-2">
              <InputMask mask="999-999-99-99" id="workshopID" v-model="workshop.NIP" style="width: 150px" />
              <label for="workshopID">NIP</label>
            </span>
          </div>

          <div class="p-d-flex p-flex-column p-flex-md-row">
            <div class="p-d-flex p-flex-row">
              <span class="p-float-label p-mt-4">
                <InputMask mask="99-999" id="workshopZipCode" v-model="workshop.kodPocztowy" style="width: 90px" />
                <label for="workshopZipCode">Kod pocztowy</label>
              </span>
              <span class="p-float-label p-mt-4 p-ml-2">
                <InputText type="text" id="workshopCity" v-model="workshop.miejscowosc" style="width: 100%" />
                <label for="workshopCity">Miejscowość</label>
              </span>
            </div>
            
            <span class="p-float-label p-mt-4 p-ml-md-2">
              <InputText type="text" id="workshopAddress" v-model="workshop.adres" style="width: 100%"/>
              <label for="workshopAddress">Ulica oraz numer budynku</label>
            </span>
          </div>
      
          <span class="p-float-label p-mt-4">
            <InputMask mask="99-9999-9999-9999-9999-9999-9999" id="workshopBankAcc" 
                      v-model="workshop.kontoBankowe" style="width: 100%" />
            <label for="workshopBankAcc">Konto bankowe</label>
          </span>
          <span class="p-float-label p-mt-4">
            <Textarea id="invoiceFooter" v-model="workshop.stopka" :autoResize="true" style="width: 100%"/>
            <label for="invoiceFooter">Stopka do faktur</label>
          </span>
          </div>
        </template>
      <template #footer>
        <div class="p-d-flex p-flex-column p-ai-center">
          <Button label="Aktualizuj informacje" class="p-button-secondary p-mt-4 p-mb-4" 
                @click="updateDetails" icon="pi pi-cloud-upload" v-if="!isLoading"/>
          <ProgressSpinner animationDuration="0.5s" v-if="isLoading" /> 
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, reactive, ref } from 'vue'

import InputMask from 'primevue/inputmask';
import Textarea from 'primevue/textarea';
import { useToast } from "primevue/usetoast"
import ProgressSpinner from 'primevue/progressspinner';

export default {
  components:{
    InputMask,
    Textarea,
    ProgressSpinner
  },
  setup() {
    const recivedData = ref()
    const isLoading = ref(true)
    const checkOffline = ref()
    const workshop = reactive({
      nazwaWarsztatu: '',
      kodPocztowy: '',
      miejscowosc: '',
      adres: '',
      email: '',
      numerTelefonu: '',
      NIP: '',
      kontoBankowe: '',
      stopka: ''
    })

    const toast = useToast()

    const workshopDetails = firebase.firestore()
      .collection('warsztat')
      .doc('DaneDoFaktur')

    async function getWorkshopDetails() {
      const docs = await workshopDetails.get().catch(() => toast.add({severity:'error', summary: 'Odczyt danych', detail: 'Wystąpił błąd wczytywania danych', life: 5000}))
      isLoading.value = false
      recivedData.value = docs?.data()

      if(recivedData.value) fillInputs()
    }

    function handleInputChange(e) {
      recivedData.value[e.target.id] = e.target.value
    }

    function fillInputs(){
      workshop.nazwaWarsztatu = recivedData.value?.nazwaWarsztatu
      workshop.kodPocztowy = recivedData.value?.kodPocztowy
      workshop.miejscowosc = recivedData.value?.miejscowosc
      workshop.adres = recivedData.value?.adres
      workshop.email = recivedData.value?.email
      workshop.numerTelefonu = recivedData.value?.numerTelefonu
      workshop.NIP = recivedData.value?.NIP
      workshop.kontoBankowe = recivedData.value?.kontoBankowe
      workshop.stopka = recivedData.value?.stopka
    }

    function updateDetails() {
      workshopDetails.update(workshop).then(() => {
        toast.removeAllGroups()
        toast.add({severity:'success', summary: 'Aktualizacja', detail:'Dane warsztatu zostały zaktualizowane', life: 4000})
      }).then(() => clearTimeout(checkOffline.value)).catch((err) => {
        if(err.code == 'permission-denied') toast.add({severity:'error', summary: 'Aktualizacja', detail: 'To konto nie posiada uprawnień do wykonywania zmian!', life: 6000})
        else toast.add({severity:'error', summary: 'Aktualizacja', detail: err.message, life: 5000})
        clearTimeout(checkOffline.value)
      })
      checkOffline.value = setTimeout(() => {
        toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Dane zostaną zaktualizowane po przywróceniu połączenia.', life: 0})
      }, 2500)
    }

    onMounted(() => getWorkshopDetails())


    return {
      handleInputChange,
      updateDetails,
      isLoading,
      workshop,

      InputMask,
      Textarea,
      ProgressSpinner
    }
  }


}
</script>

<style>
</style>