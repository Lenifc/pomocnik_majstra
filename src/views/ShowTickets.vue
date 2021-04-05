<template>
<h1>{{collectionPath}}</h1>
<!-- <input type="text" placeholder="searchbar" disabled> -->
        <div class="showElements">
        <h1 v-for="item in items" :key="item">
          <router-link :to="'/details/' + collectionPath + '/' + item">{{ item }}</router-link>
          </h1>
        <button class="btn"
          @click="getMoreData" v-if="!disableNextButton">Załaduj kolejne zlecenia</button>
      </div>
</template>

<script>

import { onMounted, ref, watch} from 'vue'
import { useRoute } from 'vue-router'

import PopupFunc from '@/components/PopupFunc.js'

import firebase from 'firebase/app'
require('firebase/firestore')

export default ({

  setup() {
    const route = useRoute()

    let items = ref(null)
    let lastDoc = ref(0)
    let disableNextButton = ref(false)
    let limit = ref(10)
    let collectionPath = ref(route.path.substring(1))


    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    async function getDataFromFirebase() {
      disableNextButton.value = false

      const collectionReference = tickets.collection(collectionPath.value).orderBy('timeStamp', 'desc')
        .limit(limit.value || 10)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]
      items.value = data.docs.map(doc => doc.id)

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
        items.value.push(...data.docs.map(doc => doc.id))
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

      collectionPath
    }

  },
})
</script>

