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
                <ButtonBase
                    type="primary"
                    @click="$emit('login-with-email-and-password', credentials)"
                >
                    {{ $t('button.login') }}
                </ButtonBase>
                <ButtonBase
                    type="no-background"
                    @click="showPasswordResetScreen = true"
                >
                    {{ $t('button.remember_password') }}
                </ButtonBase>
                <!-- disabled till the OAuth fix -->
                <ButtonBase
                    v-if="false"
                    icon="pi pi-google"
                    type="secondary"
                    @click="$emit('o-auth')"
                >
                    {{ $t('button.g-login') }}
                </ButtonBase>
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

export default {
    name: 'LoginPage',
    components: {
        CardBase,
        InputBase,
        ButtonBase,
    },
    emits: ['o-auth', 'login-with-email-and-password'],
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
            this.$router.push(-1 || ROUTES.DASHBOARD)
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
