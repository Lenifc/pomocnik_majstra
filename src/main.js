import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { useRoute } from 'vue-router'
import store from './store'
import { createI18n } from 'vue-i18n'
import { splitLangJson } from '@/assets/translations/i18n.js'

import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-bootstrap.css'

import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'
import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/bootstrap4-dark-blue/theme.css'
import Tooltip from 'primevue/tooltip'

// predefiniowane kolory
import '@/assets/colors/colors.css'

// import translacji
import langs from '@/assets/translations/langs.json?raw'

// konfiguracja i18n
const i18n = createI18n({
    locale: 'pl',
    fallbackLocale: 'pl',
    messages: splitLangJson(langs),
})

const route = useRoute()

const app = createApp(App)

app.directive('tooltip', Tooltip)

app.use(store)
    .use(PrimeVue, { ripple: true })
    .use(ToastPlugin)
    .use(router)
    .use(route)
    .use(i18n)
    .mount('#app')
