<template>
    <ViewWrapper>
        <router-view @logout="logOutFromAccount"></router-view>
        <RouteChangeGuard @route-changed="checkAuthStatus" />
    </ViewWrapper>
</template>

<script>
import ViewWrapper from '@/layout/ViewWrapper.vue'
import firebase from 'firebase/app'
import firebaseConfig from '@/firebase.js'
require('firebase/auth')
require('firebase/firestore')
require('firebase/functions')

firebase.initializeApp(firebaseConfig)

firebase.firestore().settings({
    merge: true, // wylacza ostrzezenie w logach
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
})
firebase.firestore().enablePersistence() // daje dostep do danych w trybie offline poprzez cache

// import po inicjalizaji apki firebase
import RouteChangeGuard from '@/components/helpers/RouteChangeGuard.vue'
import ROUTES from '@/router/routes'
import { signOut } from '@/components/helpers/auth.js'

const auth = firebase.auth()

export default {
    components: {
        ViewWrapper,
        RouteChangeGuard,
    },
    created() {
        this.checkAuthStatus()
    },
    methods: {
        checkAuthStatus() {
            auth.onAuthStateChanged(user => {
                if (user && this.$route.path === ROUTES.LOGIN)
                    return this.$router.push(ROUTES.DASHBOARD)
                user
                    ? this.$store.commit('setAuth', user)
                    : this.$router.push(ROUTES.LOGIN)
            })
        },
        async logOutFromAccount() {
            try {
                await signOut()
                this.$store.commit('signOut')

                this.$router.push(ROUTES.MAIN_SCREEN)
                this.$toast.info(this.$t('toast.info.logged_out'))
            } catch (error) {
                this.$toast.error(error.message)
            }
        },
    },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600');
*,
*:before,
*:after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    font-size: 10px;
}

body {
    background-color: var(--custom-very-dark-blue);
    color: var(--grayscale-light);
    font-size: 1.8rem;
    font-family: 'Source Sans Pro', sans-serif;
    width: 100vw;
    height: 100vh;
}
</style>
