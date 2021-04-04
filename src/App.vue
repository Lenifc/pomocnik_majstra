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
      @EmitDataToParent="({preparedData, pick}) => sendDataToFirebase(preparedData, pick)" 
      @closeForm="(hide) => showForm = hide" 
      />

      <ShowTickets />

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
import ShowTickets from '@/components/ShowTickets.vue'

import { useStore } from 'vuex'

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
    let disableNextButton = ref(false)
    let limit = ref(10) 

    const store = useStore()

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
            component: divider
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
            class: 'freeTickets',
            title: 'Wolne',
            icon: 'fa fa-parking',
          },
          {
            class: 'inProgressTickets',
            title: 'W trakcie realizacji',
            icon: 'fa fa-tasks',
          },
          {
            title: 'Zakończone',
            class: 'doneTickets',
            icon: 'fa fa-check',
          },
          {
            component: divider
          },
          {
            header: 'Ustawienia',
            hiddenOnCollapse: true,
          },
            {
            title: 'Kategorie i ceny',
            icon: 'fa fa-tools'
          },
          {
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
    }

    function checkAuthStatus() {
      auth.onAuthStateChanged(user => {
        if (user) {
          userSignedIn.value = true
        } else userSignedIn.value = false
        console.log("Zalogowany: " + userSignedIn.value);
      })
    }

    function sendDataToFirebase(preparedData, picked){
      let Tel = Object.values(preparedData)[0].Tel
      let timeStamp = Object.values(preparedData)[0]['Dodane_Czas']


         const collectionReference = tickets.collection(picked)
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
          store.commit('toggleRefresh')
          
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


    function onItemClick(e) {
      let ul = e.currentTarget.parentElement.parentElement

      ul.children.forEach(child => child.classList.remove('customActive'))

      e.currentTarget.classList.add('customActive')
      // TODO
      // Poprawic problem ze znikajaca klasa po odjechaniu myszka

      if (e.currentTarget.classList.contains('logout')) logOutFromAccount()
      if (e.currentTarget.classList.contains('newDataBtn')) showForm.value = true

      if (e.currentTarget.classList.contains('freeTickets')) store.commit('setPath', 'wolne')
      if (e.currentTarget.classList.contains('inProgressTickets')) store.commit('setPath', 'obecne')
      if (e.currentTarget.classList.contains('doneTickets')) store.commit('setPath', 'zakonczone')

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

      CreateNewTicket,
      sendDataToFirebase,

      items,
      showForm,

      showDetailsWindow,

      SidebarMenu,
      menu,
      onItemClick,

      disableNextButton,
      limit,

      ShowTickets,
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

.customActive{
  background-color: black!important;
  color:greenyellow!important;
}


h1:hover{
    cursor: pointer;
}
</style>
