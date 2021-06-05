<template>
  <div class="p-d-flex p-flex-column p-ai-center p-ml-4">
    <Toast />
    <h2 class="p-mx-4 p-text-center p-my-3">Dane warsztatu, które będą widoczne na fakturze</h2>
    <div v-for="object in entries" :key="object">
        <div class="p-inputgroup p-mt-2 p-d-flex p-flex-column">
          <span class="p-inputgroup-addon p-text-center">
            <div>{{ object[0].replace('_', ' ') }}</div>
          </span>
          <InputText type="text" :id="object[0]" :value="object[1]" @keyup="handleInputChange" style="min-width:300px; width:33vw" />
        </div>
      </div>
      <ProgressSpinner animationDuration="0.5s" v-if="isLoading" /> 
    <Button label="Aktualizuj informacje" class="p-button-secondary p-mt-4 p-mb-6" 
    @click="updateDetails" icon="pi pi-cloud-upload" />
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, ref } from 'vue'

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useToast } from "primevue/usetoast"
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';

export default {
  setup() {
    const entries = ref()
    const recivedData = ref()
    const isLoading = ref(true)
    const checkOffline = ref()

    const toast = useToast()

    const workshopDetails = firebase.firestore()
      .collection('warsztat')
      .doc('DaneDoFaktur')

    async function getWorkshopDetails() {
      const docs = await workshopDetails.get()
      isLoading.value = false
      recivedData.value = docs.data()
      entries.value = Object.entries(docs.data()).sort()
    }

    function handleInputChange(e) {
      recivedData.value[e.target.id] = e.target.value
    }

    function updateDetails() {
      workshopDetails.update(recivedData.value).then(() => {
        toast.add({severity:'success', summary: 'Aktualizacja', detail:'Dane warsztatu zostały zaktualizowane', life: 0})
      }).then(() => clearTimeout(checkOffline.value)).catch((err) => {
        toast.add({severity:'error', summary: 'Aktualizacja', detail: err, life: 0})
      })
      checkOffline.value = setTimeout(() => {
        toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Dane zostaną zaktualizowane po przywróceniu połączenia.', life: 0})
      }, 3000)
    }

    onMounted(() => getWorkshopDetails())


    return {
      entries,
      handleInputChange,
      updateDetails,
      isLoading,

      InputText,
      Button,
      Toast,
      ProgressSpinner
    }
  }


}
</script>

<style>

</style>