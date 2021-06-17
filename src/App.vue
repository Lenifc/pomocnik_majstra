<template>
<div>
  <Toast />
  <Login v-if="!userSignedIn && showLoginForm" @login="(passedCredentials) => signInWithEmailAndPassword(passedCredentials)" @OAuth="loginWithGoogle()" />
  <Button icon="pi pi-sign-in" class="p-button-rounded p-button-primary signInBtn" @click="showLoginPanel()" v-tooltip.right="'Zaloguj'" v-if="!userSignedIn && showLogInButton" />

<!-- Przerobic aby osoba niezalogowana widziala tylko podstawowe dane kontaktowe do warsztatu(tel, mail,adres) i maly przycisk zaloguj dla admina-->

  <div class="signedIn" v-if="userSignedIn">
    <div class="container">

      <router-view></router-view>

    </div>
  </div>
    <sidebar-menu :menu="menu" width="255px" 
    :collapsed="false" v-if="userSignedIn"
    @item-click="onItemClick" />

</div>
</template>


<script>
import { ref, onMounted, watch } from 'vue'
import firebase from 'firebase/app'
import divider from '@/components/divider.vue'
import Login from '@/components/Forms/Login.vue'

import { useToast } from "primevue/usetoast"
import { useRouter } from 'vue-router'

import { SidebarMenu } from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

require('firebase/auth')
require('firebase/firestore')
import firebaseConfig from '@/firebase.js'
require('@/store/notifications.js')
require('@/store/notifications.css')


firebase.initializeApp(firebaseConfig)

firebase.firestore().settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

firebase.firestore().enablePersistence() // daje dostep do danych w trybie offline poprzez cache


export default {
  setup() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const auth = firebase.auth()
    const router = useRouter()

    const userSignedIn = ref(false)
    const items = ref(null)
    const showForm = ref(false)
    const showLogInButton = ref(false)
    const showLoginForm = ref(false)

    const toast = useToast()

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
            href: '/szukaj',
            title: 'Szukaj pojazd/klienta',
            icon: 'fa fa-search',
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
            href: '/klienci',
            title: 'Zarządzaj klientami',
            icon: 'fa fa-user',
          },
          // {
          //   disabled: true,
          //   title: 'Zarządzaj pojazdami',
          //   icon: 'fa fa-car',
          // },
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
    function showLoginPanel() {
      showLoginForm.value = true
      showLogInButton.value = false
    }

    function loginWithGoogle(){
      auth.signInWithPopup(provider).then(() => {
        checkAuthStatus()
        }).catch((error) => {
        toast.add({severity:'error', detail: error.message, life: 8000})
      })
      
    }

      const signInWithEmailAndPassword = (credentials) => {
        const {username, pwd } = credentials
        if(username && pwd){
          firebase.auth().signInWithEmailAndPassword(username, pwd).then(() => {
            toast.removeAllGroups()
            toast.add({severity:'success', summary: 'Logowanie', detail:'Zalogowano do panelu!', life: 2500})
            })
            .catch(error =>{
              const errorCode = error.code
              const errorMessage = error.message
              console.log(errorCode, errorMessage);
              if (errorMessage == 'The email address is badly formatted.') toast.add({severity:'error', summary:'Logowanie', detail: 'Popraw pole Email!', life: 8000})
              if (errorCode == 'auth/wrong-password' || errorCode == 'auth/user-not-found') toast.add({severity:'error', summary:'Logowanie', detail: 'Niepoprawne dane logowania do autoryzowanego konta', life: 8000})
              if(errorCode == 'auth/network-request-failed') {
                toast.removeAllGroups()
                toast.add({severity:'error', summary: 'Status offline', detail:'Nie można zalogować do panelu. Sprawdź połączenie i spróbuj ponownie', life: 0})
              }
            })
        } else toast.add({severity:'error', summary:'Logowanie', detail: 'Uzupełnij pola logowania!', life: 4000})
      }
      
    function logOutFromAccount() {
      auth.signOut().then(() => {
        checkAuthStatus()
        toast.add({severity:'info' ,detail:'Zostałeś wylogowany', life: 5000})
        // ponizej zerujemy wszystko co zostalo w pamieci
        firebase.firestore().terminate()
        localStorage.clear();
        indexedDB.deleteDatabase('firebaseLocalStorageDb');
        indexedDB.deleteDatabase('firestore/[DEFAULT]/baza-mech/main/');
        //
      }).then(() => firebase.firestore().clearPersistence())
      .then(() => router.push('/'))
        .catch((error) => {
        toast.add({severity:'error', detail: error.message, life: 8000})
      })
    }

    function checkAuthStatus() {
      auth.onAuthStateChanged(user => {
        if (user) {
          userSignedIn.value = true
        } else {
          userSignedIn.value = false
          showLogInButton.value = true
        }
      })
    }

    function onItemClick(e) {
      if (e.currentTarget.classList.contains('logout')) logOutFromAccount()
    }

    onMounted(() => {
      checkAuthStatus()
    })

    watch(() => userSignedIn.value, () => {
      showLogInButton.value = true
      showLoginForm.value = false
    })

    return {
      provider,
      auth,

      showLoginPanel,
      logOutFromAccount,

      userSignedIn,

      items,
      showForm,

      SidebarMenu,
      menu,
      onItemClick,

      showLogInButton,
      Login,
      signInWithEmailAndPassword,
      showLoginForm,
      loginWithGoogle
    }
  },

}
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
    /* background-color: #202847; */
    background-color: #20262E; /* bootstrap BGC dark */
    /* background-color: #17212F; materialize BGC dark */
    color: var(--text-color);
    position: relative;
    font-family: 'Source Sans Pro', sans-serif;
}

i{
  font-size: 1.5rem;
}

table{
  width: min(1400px, fit-content);
  max-width: 100%;
  border-collapse: collapse;
}

.signInBtn{
  position: fixed;
  top: 8px;
  left: 8px;
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

.details a{
  color:crimson;
  font-weight: bold;
}

.loader {
  width: 150px;
}

.container{
    margin: 0 auto;
    padding-left: max(56px, 10%);
    width: min(94%, 1400px);

    /* border:1px solid red; */
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
    color: rgb(50, 50, 50);
    font-weight: bold;
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

.column{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.row{
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.btn.success{
  background-color: #42b983;
  color: white;
}

.btn.failed{
  background-color: crimson;
  color: white;
}

i{
  cursor: pointer;
}

.pointer{
  cursor: pointer;
}

</style>
