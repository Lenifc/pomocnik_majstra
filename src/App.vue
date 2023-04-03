<template>
    <ViewWrapper>
        <router-view
            v-if="authOK"
            :key="$route.name"
            @logout="logOutFromAccount"
        ></router-view>
        <CardLogin
            v-else-if="!dataLoading"
            @login-with-email-and-password="handleLoginWithEmailAndPassword"
            @o-auth="handleOAuthLogin"
        />
    </ViewWrapper>
</template>

<script>
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
import ViewWrapper from '@/layout/ViewWrapper.vue'
import CardLogin from '@/components/views/CardLogin.vue'
import ROUTES from '@/router/routes'
import {
    signOut,
    handleLoginWithEmail,
    handleOAuth,
} from '@/components/helpers/auth.js'

export default {
    components: {
        ViewWrapper,
        CardLogin,
    },
    computed: {
        authOK: {
            get() {
                return !!this.$store.state.auth?.user
            },
        },
        dataLoading: {
            get() {
                return !!this.$store.state.auth?.dataLoading
            },
        },
    },
    methods: {
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
        async handleLoginWithEmailAndPassword(credentials) {
            try {
                await handleLoginWithEmail(credentials)
                this.$toast.success(this.$t('toast.success.login_success'))
                this.$router.push(ROUTES.DASHBOARD)
            } catch (error) {
                this.$toast.error(this.$t(error.message))
            }
        },
        async handleOAuthLogin() {
            try {
                await handleOAuth()
                this.$toast.success(this.$t('toast.success.login_success'))
                this.$router.push(ROUTES.DASHBOARD)
            } catch (error) {
                this.$toast.error(this.$t(error.message))
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
