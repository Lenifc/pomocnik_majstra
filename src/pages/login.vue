<template>
    <CardBase closeable :width="400" @close="closeCard">
        <template #title>
            <div>{{ $t('login_screen.title') }}</div>
        </template>
        <div class="login-screen">
            <div class="inputs">
                <InputBase id="username" v-model="credentials.username">
                    <template #label>
                        {{ $t('login_screen.email') }}
                    </template>
                </InputBase>
                <InputBase
                    id="password"
                    v-model="credentials.password"
                    type="password"
                >
                    <template #label>
                        {{ $t('login_screen.password') }}
                    </template>
                </InputBase>
            </div>
            <div class="buttons">
                <ButtonBase type="primary" @click="handleLoginWithEmail">
                    {{ $t('button.login') }}
                </ButtonBase>
                <ButtonBase
                    type="no-background"
                    @click="showPasswordResetScreen = true"
                >
                    {{ $t('button.remember_password') }}
                </ButtonBase>
                <!-- <ButtonBase
                    icon="pi pi-google"
                    type="secondary"
                    @click="handleOAuth"
                >
                    {{ $t('button.g-login') }}
                </ButtonBase> -->
            </div>
        </div>
    </CardBase>
</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import CardBase from '@/components/common/CardBase.vue'
import InputBase from '@/components/common/InputBase.vue'
import ButtonBase from '@/components/common/ButtonBase.vue'
import ROUTES from '@/router/routes'

import firebase from 'firebase/app'
require('firebase/auth')

const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()
const callLogs = firebase.functions().httpsCallable('userSignedIn')

export default {
    name: 'LoginPage',
    components: {
        CardBase,
        InputBase,
        ButtonBase,
    },
    data() {
        return {
            credentials: reactive({
                username: null,
                password: null,
            }),
            showPasswordResetScreen: ref(false),
        }
    },
    methods: {
        closeCard() {
            this.$router.push(ROUTES.MAIN_SCREEN)
        },
        async handleOAuth() {
            try {
                await auth.signInWithPopup(provider)
                this.checkAuthStatus()
                const provideData = auth.currentUser.providerData
                callLogs({ provideData })
            } catch (error) {
                console.log(error)
                this.$toast.error(error.message)
            }
        },
        checkAuthStatus() {
            auth.onAuthStateChanged(user => {
                if (user) this.$router.push(ROUTES.DASHBOARD)
            })
        },
        async handleLoginWithEmail() {
            const { username, password } = this.credentials

            if (username && password) {
                try {
                    await firebase
                        .auth()
                        .signInWithEmailAndPassword(username, password)
                    this.$toast.success(this.$t('toast.success.login_success'))
                    const provideData = auth.currentUser.providerData
                    callLogs({ provideData })
                    this.checkAuthStatus()
                } catch (error) {
                    const errorCode = error.code

                    if (errorCode == 'auth/invalid-email')
                        this.$toast.error(this.$t('toast.error.invalid_email'))
                    if (
                        errorCode == 'auth/wrong-password' ||
                        errorCode == 'auth/user-not-found'
                    )
                        this.$toast.error(this.$t('toast.error.invalid_data'))
                    if (errorCode == 'auth/network-request-failed')
                        this.$toast.error(this.$t('toast.error.network_issue'))
                }
            } else this.$toast.warning(this.$t('toast.fill_the_inputs'))
        },
    },
}
</script>

<style scoped lang="scss">
.login-screen {
    .inputs {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .buttons {
        padding-top: 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }
}
</style>
