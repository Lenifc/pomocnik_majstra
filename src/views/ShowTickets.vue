<template>
<div class="column">
<h1>{{collectionPath}}</h1>
<!-- <input type="text" placeholder="searchbar" disabled> -->
        <div class="showElements" v-if="!isLoading">
        <h1 v-for="uniqueNumber in allNumbers" :key="uniqueNumber">
          <router-link :to="'/details/' + collectionPath + '/' + uniqueNumber">{{ uniqueNumber }}</router-link>
          </h1>
        <button class="btn"
          @click="getMoreData" v-if="!disableNextButton">Załaduj kolejne zlecenia</button>
      </div>
        <img class="loader" src="@/assets/spinner.gif" v-if="isLoading">
      </div>
</template>

<script>

import { onMounted, ref, watch} from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import PopupFunc from '@/components/PopupFunc.js'

import firebase from 'firebase/app'
require('firebase/firestore')

export default ({

  setup() {
    const route = useRoute()
    const store = useStore()

    //
    let items = ref(null) // MAMY TUTAJ DOSTEP DO WSZYSTKICH DANYCH Z POBRANYCH DOKUMENTOW BEZ timeStamp
    //

    let lastDoc = ref(0)
    let disableNextButton = ref(false)
    let limit = ref(10)
    let collectionPath = ref(route.path.substring(1))
    let isLoading = ref(true)
    const allNumbers = ref([])


    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')


    async function getDataFromFirebase() {
      disableNextButton.value = false

      const collectionReference = tickets.collection(collectionPath.value).orderBy('timeStamp', 'desc')
        .limit(limit.value || 10)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]

      items.value = data.docs.map(doc => Object.entries(doc.data()).filter(item => item[0] != 'timeStamp') )
      store.commit('setFetchedItems', items.value)

      // filtruje same numery aby wyswietlic je na ekranie glownym
      allNumbers.value = items.value.map(number => number[0][1]['Tel'])

      isLoading.value = false

      if (data.docs.length < limit.value) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
      }
    }

    async function getMoreData() {

      const collectionReference = tickets.collection(collectionPath.value).orderBy('timeStamp', 'desc')
        .startAfter(lastDoc.value || 0)
        .limit(limit.value || 10)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]
      console.log("Ilosc doladowanych zlecen: " + data.docs.length)

      if (!data.docs.length) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
      } else {

        items.value.push(...data.docs.map(doc => Object.entries(doc.data()).filter(item => item[0] != 'timeStamp') ))
        allNumbers.value = items.value.map(number => number[0][1]['Tel'])
        store.commit('setFetchedItems', items.value)

        if (data.docs.length < limit.value) {
          disableNextButton.value = true
          PopupFunc('warning', 'Wczytano już wszystkie zlecenia.')
        }
      }
    }

    onMounted(() => {
      collectionPath.value = route.path.substring(1)
      getDataFromFirebase()
    })

    watch(() => route.path, () => {
      // console.log(route.path)
      if (route.path == '/obecne' || route.path == '/wolne' || route.path == '/zakonczone') {
        collectionPath.value = route.path.substring(1)
        getDataFromFirebase()
      }
    })
    

    return {
      getMoreData,

      items,
      disableNextButton,

      collectionPath,
      isLoading,
      allNumbers
    }

  },
})
</script>

<style scoped>
.loader {
  width: 150px;
}
</style>

