<template>
<div>

  <div class="signedOut" v-if="!userSignedIn">
    <div class="container">
      <button class="btn signInBtn" @click="logInToAccount()">Zaloguj</button>
    </div>
  </div>

  <div class="signedIn" v-if="userSignedIn">
    <div class="container">
      <CreateNewTicket v-if="showForm" 
      @EmitDataToParent="(preparedData) => sendDataToFirebase(preparedData)" 
      @closeForm="(hide) => showForm = hide" 
      />

      <div class="showElements" @click="openDetails($event)">
        <h1 v-for="item in items" :key="item">{{ item }}</h1>
        <button class="btn"
          @click="getMoreData" v-if="!disableNextButton">Załaduj kolejne zlecenia</button>
      </div>

      <div class="showDetails" v-if="showDetailsWindow"></div>
    </div>
    <sidebar-menu :menu="menu" width="250px" @item-click="onItemClick" />
    <router-view></router-view>
  </div>

</div>
</template>


<script>
import { ref, onMounted } from 'vue'
import firebase from 'firebase/app'
import divider from '@/components/divider.vue'
import CreateNewTicket from '@/components/CreateNewTicket.vue'

import { SidebarMenu } from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

require('firebase/auth')
require('firebase/firestore')
require('@/store/notifications.js')
require('@/store/notifications.css')


const firebaseConfig = {
  apiKey: "AIzaSyCj7WjnSKdPZr7ima0GMz_0NwHB5AqP2xU",
  authDomain: "baza-mech.firebaseapp.com",
  databaseURL: "https://baza-mech.firebaseio.com",
  projectId: "baza-mech",
  storageBucket: "baza-mech.appspot.com",
  messagingSenderId: "413485233738",
  appId: "1:413485233738:web:0209efffbb22a6fab098b3"
};

firebase.initializeApp(firebaseConfig)


export default {
  setup() {
    let provider = new firebase.auth.GoogleAuthProvider();
    let auth = firebase.auth()

    let userSignedIn = ref()
    let items = ref(null)
    let showForm = ref(false)

    let showDetailsWindow = ref(false)
    let lastDoc = ref(0)
    let disableNextButton = ref(false)
    let limit = ref(10) 

    const tickets = firebase.firestore()
                                .collection('warsztat')
                                .doc('zlecenia')

 
    const menu = [
          {
            header: 'Warsztat',
            hiddenOnCollapse: true,
          },
          {
            href: '/',
            title: 'Dashboard',
            icon: 'fa fa-desktop',
          },

          {
            header: 'Zlecenia',
            hiddenOnCollapse: true,
          },
          {
            class: 'newDataBtn',
            title: 'Dodaj nowe zlecenie',
            icon: 'fa fa-plus',
          },
          {
            href: '/obecne',
            title: 'W trakcie realizacji',
            icon: 'fa fa-tasks',
          },
          {
            href: '/zakonczone',
            title: 'Zakończone',
            icon: 'fa fa-check',
          },
          {
            header: 'Ustawienia',
            hiddenOnCollapse: true,
          },
            {
            href: '/',
            title: 'Kategorie i ceny',
            icon: 'fa fa-tools'
          },
          {
            href: '/',
            title: 'Zarządzaj stanowiskami',
            icon: 'fa fa-car'
          },
          {
            component: divider
          },
          {
              icon: 'fa fa-power-off',
              title: 'Wyloguj',
              class: 'logout'
          }
        ]
  


    // Log in with Google auth 
    function logInToAccount() {
      auth.signInWithPopup(provider).then(() => checkAuthStatus()).catch((error) => {
        PopupFunc('error', error.message)
      })
    }

    function logOutFromAccount() {
      auth.signOut().then(() => {
        checkAuthStatus()
        PopupFunc('info', 'Zostałeś wylogowany.')
      }).catch((error) => {
        PopupFunc('error', error.message)
      })
      //
      //  Podczas wylogowania DODAC czyszczenie wszystkich wartosci z pamieci
      //
    }

    function checkAuthStatus() {
      auth.onAuthStateChanged(user => {
        if (user) {
          userSignedIn.value = true
          getDataFromFirebase()
        } else userSignedIn.value = false
        console.log("Zalogowany: " + userSignedIn.value);
      })
    }

    // Zbiera dane z bazy, nastepnie zapisuje je w zmiennej i wyswietla
    async function getDataFromFirebase() {

      const collectionReference = tickets.collection('obecne').orderBy('timeStamp', 'desc')
        .limit(limit.value || 10)

      let data = await collectionReference.get()
      lastDoc.value = data.docs[data.docs.length - 1]
      items.value = data.docs.map(doc => doc.id)
    }

    async function getMoreData() {

      const collectionReference = tickets.collection('obecne').orderBy('timeStamp', 'desc')
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

    function sendDataToFirebase(preparedData){
      let Tel = Object.values(preparedData)[0].Tel
      let timeStamp = Object.values(preparedData)[0]['Dodane_Czas']


         const collectionReference = tickets.collection('obecne')
        let docReference = collectionReference.doc(Tel)

        docReference.get().then(function (doc) {
          if (doc.exists) {
            docReference.update({
                ...preparedData,
                timeStamp
              }).then(PopupFunc('success', 'Kolejne danie dodanie 👌'))
              .catch(err => PopupFunc("error", err.message))
          } else {
            docReference.set({
                ...preparedData,
                timeStamp
              }).then(PopupFunc('success', 'Danie dodanie 👌'))
              .catch(err => PopupFunc("error", err.message))
          }
          getDataFromFirebase()
          disableNextButton.value = false
        }).catch(function (err) {
          PopupFunc("error", err.message)
        })
      
    }

    // Show proper popup message in left bottom corner
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
        showDetailsWindow.value = true

        // fetch data from database
        tickets.collection('obecne').doc(e.target.innerText)
          .get().then(showData => showNumberDetails(showData.data()))
      } else return

    }

    function showNumberDetails(data) {

      console.log(data);
      console.log("Ilosc pojazdow: " + (Object.keys(data).length - 1))

      // draw all cars assigned to this phoneNumber
      // for (let key in data) {
      //   // console.log(data[key])
      //   template += `<li id="${data[key].Marka} ${data[key].Model} ${data[key].Dodane_Czas}">
      //   <h1>${data[key].Marka} ${data[key].Model} ${data[key].Rok_prod}</h1>`

      //   // sort elements that they will be always the same order
      //   Object.entries(data[key]).sort((curr, prev) => curr[0] > prev[0] ? 1 : -1).map(obj => {
      //     // console.log([obj[0], obj[1]])
      //     template += `<div>${obj[0]}: <span> ${(obj[1] || 'Brak Danych')}</span></div>`
      //   })
    }

    function onItemClick(e) {
      if (e.currentTarget.classList.contains('logout')) logOutFromAccount()
      if (e.currentTarget.classList.contains('newDataBtn')) showForm.value = true
    }

    onMounted(() => {
      checkAuthStatus()
    })

    return {
      provider,
      auth,

      logInToAccount,
      logOutFromAccount,

      userSignedIn,

      getDataFromFirebase,
      getMoreData,

      CreateNewTicket,
      sendDataToFirebase,

      items,
      showForm,

      openDetails,
      showDetailsWindow,

      SidebarMenu,
      menu,
      onItemClick,

      disableNextButton,
      limit,
    }
  },

}

//
//
// https://vuejsexamples.com/
//
//
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600');

*, *:before, *:after{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body{
    font-size: 16px;
    background-color: #202847;
    color: white;
    position: relative;
    font-family: 'Source Sans Pro', sans-serif;
}

.container{
    margin: 0 auto;
    width: min(96%, 1200px);
    display: flex;
    justify-content: center;
}

.signedOut{
    padding: 64px;
}

.signedIn{
    height: 100vh;
    justify-content: center;
    align-content: center;

}


.btn{
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    box-shadow: 1px 1px 5px #555;
    font-size: 1.05rem;
}
.signOutBtn{
    position: fixed;
    padding-left: 8px;
    top: 16px;
    right: 32px;
    font-size: 1.3rem;
}

.newDataDiv, 
.showDataDiv{
    display: block;
    position: fixed;
    top:0;
    left: 0;
    background-color: #eee;
    color: black;
    width: 100vw;
    height: 100vh;
}
.newDataDiv.opened,
.showDataDiv.opened{
    display: block;
}

.newDataForm{
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
}
.newDataForm > *{
    align-self: center;
}
.newDataForm input{
    padding: 4px;
    border: 1px solid gray;
    border-radius: 4px;
    box-shadow: none;
}

.closeForm{
    position: fixed;
    top:0;
    right: 20px;
    font-size: 4rem;
}
.closeForm:hover,
.btn:hover{
    cursor: pointer;
}

.newDataBtn{
    position: fixed;
    top: 20px;
    left: 20px;
    font-size: 1.3rem;
}

.showElements{
    margin-top: 128px;
    width: min(90%, 1000px);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}


h1:hover{
    cursor: pointer;
}
</style>
