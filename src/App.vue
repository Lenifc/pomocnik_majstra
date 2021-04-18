<template>
<div>

<!--  -->
<!-- Przerobic aby osoba niezalogowana widziala tylko podstawowe dane kontaktowe do warsztatu(tel, mail,adres) i maly przycisk zaloguj dla admina-->
  <div class="signedOut" v-if="!userSignedIn && showLogInButton">
    <div class="container">
      <button class="btn signInBtn" @click="logInToAccount()">Zaloguj</button>
    </div>
  </div>

  <div class="signedIn" v-if="userSignedIn">
    <div class="container">

      <router-view></router-view>

    </div>
    <sidebar-menu :menu="menu" width="255px" 
    :collapsed="false" 
    @item-click="onItemClick" />
  </div>

</div>
</template>


<script>
import { ref, onMounted } from 'vue'
import firebase from 'firebase/app'
import divider from '@/components/divider.vue'

import PopupFunc from '@/components/PopupFunc.js'

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

    let userSignedIn = ref(false)
    let items = ref(null)
    let showForm = ref(false)
    let showLogInButton = ref(false)

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
            href: '/dodaj',
            class: 'newDataBtn',
            title: 'Dodaj nowe zlecenie',
            icon: 'fa fa-plus',
            // icon: 'mdiMonitor', // customowa klasa
          },
          {
            href: '/wolne',
            title: 'Wolne',
            icon: 'fa fa-parking',
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
            component: divider
          },
          {
            // href: '/szukaj',
            title: 'Szukaj numer telefonu',
            icon: 'fa fa-search',
            disabled: true
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
            icon: 'fa fa-tools',
            disabled: true
          },
          {
            href: '/DaneWarsztatu',
            title: 'Dane do faktury',
            icon: 'fas fa-file-invoice-dollar'
          },
          {
            title: 'Zarządzaj stanowiskami',
            icon: 'fa fa-car',
            disabled: true
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
        console.log(user?.uid);
        if (user) {
          userSignedIn.value = true
        } else {
          userSignedIn.value = false
          showLogInButton.value = true
        }
        // console.log("Zalogowany: " + userSignedIn.value);
      })
    }

    function onItemClick(e) {
      if (e.currentTarget.classList.contains('logout')) logOutFromAccount()
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

      items,
      showForm,

      SidebarMenu,
      menu,
      onItemClick,

      showLogInButton
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
    font-size: 18px;
    background-color: #202847;
    color: white;
    position: relative;
    font-family: 'Source Sans Pro', sans-serif;
}

i{
  font-size: 1.5rem;
}

table{
  width: min(1500px, 100%);
  border-collapse: collapse;
}

tr{
  margin: 0;
}

tr th{
  padding: 2px 4px;
}

td{
  width: max-content;
  padding: 0 10px;
  white-space:wrap;
  overflow: hidden;
  border: 3px solid green;
}

.moreOptions{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 6px;
}

.noWrap{
  white-space:nowrap;
}

.details a{
  color:crimson;
  font-weight: bold;
}

.loader {
  width: 150px;
}

.container{
    margin: 0 auto;
    padding-left: min(100px, 16%);
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

a{
  color:whitesmoke;
  text-decoration: none;
}


.btn{
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    box-shadow: 1px 1px 5px #555;
    font-size: 1.05rem;
    color: white;
    font-weight: bold;
}

.newDataDiv{
    display: block;
    position: fixed;
    top:0;
    left: 0;
    background-color: rgb(204, 204, 204);
    color: black;
    width: 100vw;
    height: 100vh;
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
.btn:hover,
h1:hover{
    cursor: pointer;
}

.showElements{
    margin-top: 128px;
    text-align: center;
}

.v-sidebar-menu .vsm--link_active {
  background-color: black!important;
  box-shadow: inset 3px 0 0 0 greenyellow!important;;

}
/* .mdiMonitor{
  background-image: url('./assets/icons/monitor.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 80%;
  fill: white;
} */

.column{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border: 2px solid red;
}

.row{
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 24px;
  width: 90%;
}


.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
  color: black
}

.modal-container {
  width: min(600px, 80%);
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-body {
  margin: 20px 0;
}

.modal-footer{
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
}

.modal-default-button {
  display: block;
  margin-top: 1rem;
  font-weight: bold;
  color: white
}

.btn.success{
  background-color: #42b983;
}

.btn.failed{
  background-color: crimson;
}



.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}







@media (max-width: 1050px) {
  
}
</style>
