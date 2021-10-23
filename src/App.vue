<template>
<div>
  <Toast />
  <ConfirmDialog :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}" />
  <Login v-if="!userSignedIn && showLoginForm" @login="(passedCredentials) => signInWithEmailAndPassword(passedCredentials)" @OAuth="loginWithGoogle()" @pwdReset="email => PasswordReset(email)" @closeForm="hideLoginPanel" />
  <Button  v-if="!userSignedIn && showLogInButton" icon="pi pi-sign-in" class="p-button-rounded p-button-primary signInBtn" @click="showLoginPanel()" v-tooltip.right="'Zaloguj'" />

<!-- Przerobic aby osoba niezalogowana widziala tylko podstawowe dane kontaktowe do warsztatu(tel, mail,adres) i maly przycisk zaloguj dla admina-->
  <ContactInfo  v-if="!userSignedIn && showLogInButton" />
  <div class="signedIn" v-if="userSignedIn">
    <div class="container">

      <router-view></router-view>

    </div>
  </div>
    <sidebar-menu :menu="menu" width="245px" 
    :collapsed="menuCollapsed || false" v-if="userSignedIn"
    @item-click="onItemClick" />

</div>
</template>


<script>
import { ref, onMounted, watch } from 'vue'
import firebase from 'firebase/app'
import CustomDivider from '@/components/CustomDivider.vue'
import Login from '@/components/Login.vue'
import ContactInfo from '@/components/ContactInfo.vue'

import { useToast } from "primevue/usetoast"
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

import { SidebarMenu } from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

require('firebase/auth')
require('firebase/firestore')
require('firebase/functions')
import firebaseConfig from '@/firebase.js'
require('@/store/notifications.js')
require('@/store/notifications.css')


firebase.initializeApp(firebaseConfig)

firebase.firestore().settings({
  merge: true, // wylacza ostrzezenie w logach
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

firebase.firestore().enablePersistence() // daje dostep do danych w trybie offline poprzez cache


export default {
  components: {
    Login,
    ContactInfo,
    SidebarMenu,
  },
  setup() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const auth = firebase.auth()
    const router = useRouter()
    const route = useRoute()

    const userSignedIn = ref(false)
    const items = ref(null)
    const showForm = ref(false)
    const showLogInButton = ref(false)
    const showLoginForm = ref(false)

    const menuCollapsed = ref()

    const toast = useToast()

    const menu = [
          {
            header: 'Warsztat',
            hiddenOnCollapse: true,
          },
          {
            href: '/panel-glowny',
            title: 'Dashboard',
            icon: 'fa fa-desktop',
          },
          {
            href: '/klienci',
            title: 'Zarządzaj klientami',
            icon: 'fa fa-user',
          },
          {
            component: CustomDivider
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
            title: 'Oczekujące',
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
            component: CustomDivider
          },
          {
            href: '/szukaj',
            title: 'Szukaj pojazd/klienta',
            icon: 'fa fa-search',
          },
          {
            component: CustomDivider
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
            href: '/dane-warsztatu',
            title: 'Dane warsztatu',
            icon: 'fas fa-file-invoice-dollar'
          },
          {
            href: '/ustawienia',
            title: 'Ustawienia i pomoc',
            icon: 'fas fa-cogs',
          },
          {
            component: CustomDivider
          },
          {
              icon: 'fa fa-power-off',
              title: 'Wyloguj',
              class: 'logout'
          }
        ]
  

// tutaj mozna bylo zrobic switch (a = !a) zamiast dwoch funckji 
    function showLoginPanel() {
      showLoginForm.value = true
      showLogInButton.value = false
    }
    function hideLoginPanel() {
      showLoginForm.value = false
      showLogInButton.value = true
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
              toast.removeAllGroups()
              const errorCode = error.code
              const errorMessage = error.message

              if (errorMessage == 'The email address is badly formatted.') toast.add({severity:'error', summary:'Logowanie', detail: 'Popraw pole Email!', life: 8000})
              if (errorCode == 'auth/wrong-password' || errorCode == 'auth/user-not-found') toast.add({severity:'error', summary:'Logowanie', detail: 'Niepoprawne dane logowania do autoryzowanego konta', life: 8000})
              if (errorCode == 'auth/network-request-failed') toast.add({severity:'error', summary: 'Status offline', detail:'Nie można zalogować do panelu. Sprawdź połączenie i spróbuj ponownie', life: 0})
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

    function PasswordReset(email) {
      firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
          toast.removeAllGroups()
          toast.add({severity:'info', detail: 'Na podany adres email otrzymasz link do zresetowania hasła.', life: 8000})
        })
        .catch((error) => {
            toast.removeAllGroups()
            if (error.message == 'The email address is badly formatted.') toast.add({severity:'error', summary:'Błąd', detail: 'Popraw pole Email!', life: 8000})
            if (error.code == 'auth/user-not-found') toast.add({severity:'error', summary:'Błąd', detail: 'Brak konta o podanym adresie email', life: 8000})
            if (error.code == 'auth/network-request-failed') toast.add({severity:'error', summary: 'Status offline', detail:'Nie można wysłać przypomnienia. Sprawdź połączenie i spróbuj ponownie', life: 0})
        })
    }

    function checkAuthStatus() {
      auth.onAuthStateChanged(user => {
        if (user) {
          userSignedIn.value = true
        } else {
          userSignedIn.value = false
          showLogInButton.value = true
          router.push('/')
        }
      })
    }

    function onItemClick(e) {
      if (e.currentTarget.classList.contains('logout')) logOutFromAccount()
    }

    onMounted(() => {
      checkAuthStatus()
      if(localStorage.getItem('menuCollapsed')) menuCollapsed.value = JSON.parse(localStorage.getItem('menuCollapsed'))
    })

    watch(() => userSignedIn.value, () => {
      if( route.path == '/' && userSignedIn.value == true) router.push('/panel-glowny')
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
      menuCollapsed,
      menu,
      onItemClick,

      showLogInButton,
      Login,
      signInWithEmailAndPassword,
      showLoginForm,
      hideLoginPanel,
      loginWithGoogle,
      PasswordReset,
      ContactInfo
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
    font-family: 'Source Sans Pro', sans-serif;
}

i{
  font-size: 1.5rem;
}

.signInBtn{
  position: fixed;
  top: 8px;
  left: 8px;
}

.loader {
  width: 150px;
}

.container{
    margin: 0 auto;
    padding-left: 10%;
    width: min(98%, 1400px);
}

a{
  color:var(--yellow-200);
  text-decoration: none;
}

.closeForm{
    position: absolute;
    top:-10px;
    right: 10px;
    font-size: 3rem;
}

.v-sidebar-menu .vsm--link_active {
  background-color: black!important;
  box-shadow: inset 3px 0 0 0 greenyellow!important;
}

@media (max-width: 600px) {
  .v-sidebar-menu .vsm--link {padding-left: 8px; font-size: 15px}
  .v-sidebar-menu.vsm_expanded, .v-sidebar-menu.vsm_extended .vsm--link_active{width: 210px}
  .v-sidebar-menu.vsm_collapsed, .v-sidebar-menu.vsm_collapsed .vsm--link_active {width: 52px}
}

@media (max-width: 1550px){
  .container{
    padding-left: 60px;
}
}
@media (max-width: 600px){
  .container{
    padding-left: 50px;
}
}


.pointer, i, .closeForm:hover{
  cursor: pointer;
}

.relative{
  position: relative;
}
</style>
