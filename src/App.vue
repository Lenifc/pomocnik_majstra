<template>
  <MainScreen />
</template>

<script>
import MainScreen from '@/MainScreen.vue'

import firebase from 'firebase/app'
import firebaseConfig from '@/firebase.js'
require('firebase/auth')
require('firebase/firestore')
require('firebase/functions')

firebase.initializeApp(firebaseConfig)

firebase.firestore().settings({
  merge: true, // wylacza ostrzezenie w logach
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
})
firebase.firestore().enablePersistence() // daje dostep do danych w trybie offline poprzez cache


export default {
  components:{
    MainScreen
  },
  setup() {},
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600');
*, *:before, *:after{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
html{
  font-size: 10px;
}

body{
  background-color: var(--main-background-color);
  color: var(--main-text-color);
  font-size: 1.6rem;
}


</style>
