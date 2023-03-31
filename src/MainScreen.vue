<template>
    <div class="main-screen">
        <Title>
            {{ $t('main_screen.hello') }}
        </Title>
        <ButtonBase class="login-button" type="primary" @click="handleClick">
            {{
                $store.state.auth?.user
                    ? $t('button.go_to_dashboard')
                    : $t('button.login')
            }}
        </ButtonBase>
    </div>
</template>
<script>
import Title from '@/components/common/Title.vue'
import ButtonBase from './components/common/ButtonBase.vue'
import ROUTES from '@/router/routes.js'

export default {
    name: 'MainScreen',
    components: {
        Title,
        ButtonBase,
    },
    methods: {
        handleClick() {
            this.$store.state.auth?.user
                ? this.$router.push(ROUTES.DASHBOARD)
                : this.$router.push(ROUTES.LOGIN)
        },
    },
}
</script>
<style scoped lang="scss">
.main-screen {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    align-items: center;
}
</style>
