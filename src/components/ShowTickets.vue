<template>
<h1>{{collectionPath}}</h1>
<!-- <input type="text" placeholder="searchbar" disabled> -->
        <div class="showElements" @click="openDetails($event)">
        <h1 v-for="item in items" :key="item">{{ item }}</h1>
        <button class="btn"
          @click="getMoreData" v-if="!disableNextButton">Załaduj kolejne zlecenia</button>
      </div>
</template>

<script>

import { onMounted, ref} from 'vue'
import {useStore} from 'vuex'

import firebase from 'firebase/app'
require('firebase/firestore')

export default ({

  setup() {

    let items = ref(null)
    let lastDoc = ref(0)
    let disableNextButton = ref(false)
    let limit = ref(10) 
    let collectionPath = ref('obecne')

    const store = useStore()

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

        function PopupFunc(status, msg) {
      // console.log(status);

      const myNotification = window.createNotification({
        closeOnClick: true,

        displayCloseButton: false,
        positionClass: 'nfc-bottom-right',
        showDuration: 6000,

        // success, info, warning, error, and none
        theme: status
      })
      myNotification({
        title: status,
        message: msg,
      })
    }


        function openDetails(e) {

      if (e.target.tagName == 'H1' && e.target.innerText) {
        // showDetailsWindow.value = true

        // fetch data from database
        tickets.collection(collectionPath.value).doc(e.target.innerText)
          .get().then(showData => showNumberDetails(showData.data()))
      } else return

    }

    function showNumberDetails(data) {

      console.log(data);
      console.log("Ilosc pojazdow: " + (Object.keys(data).length - 1))
    }

    onMounted(() => {
      getDataFromFirebase()
    })

    store.watch((state) => state.refreshTickets, () => {
      getDataFromFirebase()
    })
    store.watch((state) => state.dataPath, (dataPath) => {
      console.log('newPath: ' + dataPath);
      collectionPath.value = dataPath
      getDataFromFirebase()
    })

  return{
    getMoreData,
    openDetails,

    items, 
    disableNextButton,

    collectionPath
  }


  },
})
</script>

