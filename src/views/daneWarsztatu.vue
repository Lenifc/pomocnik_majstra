<template>
  <div>
    <h1>Dane warsztatu, które będą widoczne na fakturze</h1>
    <div v-for="object in entries" :key="object">
      <div class="row">
        <label :for="object[0]">{{ object[0].replace('_', ' ') }}</label>
        <input type="text" :id="object[0]" :value="object[1]" @keyup="handleInputChange">

      </div>
    </div>
    <button class="btn" @click="updateDetails">Aktualizuj</button>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const entries = ref()
    const recivedData = ref()

    const workshopDetails = firebase.firestore()
      .collection('warsztat')
      .doc('DaneDoFaktur')

    async function getWorkshopDetails() {
      const docs = await workshopDetails.get()
      recivedData.value = docs.data()
      entries.value = Object.entries(docs.data()).sort()
    }

    function handleInputChange(e) {
      recivedData.value[e.target.id] = e.target.value
      console.log(recivedData.value);
    }

    function updateDetails() {
      workshopDetails.update(recivedData.value)
    }

    onMounted(() => getWorkshopDetails())


    return {
      entries,
      handleInputChange,
      updateDetails
    }
  }


}
</script>

<style>

</style>