<template>
{{ carDetails }}

<Button label="Edytuj" @click="EditFunc()" />
<a class="p-button-text p-link" target="_blank" rel="noreferrer" :href="`https://pl.vindecoder.pl/${carDetails?.['VIN']}`">Sprawdź dane pojazdu po nr VIN </a>

</template>

<script>
import OrderForm from '@/components/Forms/OrderForm.vue'
import { DeleteFunc } from '@/components/EditMoveDeleteOptions'
  
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import Button from 'primevue/button';

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const carDetails = ref()

    function HandleFunc(e) {
      const target = e.target.innerText
      const id = e.target.parentElement.parentElement.parentElement.id
      if (target == 'Usuń') DeleteFunc(id, route.params.collectionPath, route.params.ticketDetails)
    }

    function EditFunc() {
      // caly czas w pamieci store mam zapisane dane pojazdu, wiec nie musze ich na nowo przesylac, a jedynie przekierowac routerem do formularza
      router.push(`/pojazd/${carDetails.value?.['VIN']}/edytuj`)
    }

    onMounted(() => {
      // w przypadku proby wejscia bezposrednio z linku odesle nas do ostatniej strony ze wzgledu na brak danych w pamieci
      if(!store.state?.targetCar){
        router.go(-1)
      }else{
        carDetails.value = store.state?.targetCar
      }
    })

    return {
      carDetails,

      HandleFunc,
      OrderForm,
      EditFunc,

      Button
    }
  }
}
</script>

<style>
</style>