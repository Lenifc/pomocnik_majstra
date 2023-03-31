import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { useRoute } from 'vue-router'
import store from './store'
import { createI18n } from 'vue-i18n'
import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-bootstrap.css'

// predefiniowane kolory
import '@/assets/colors/colors.css'

// import translacji
import pl from '@/assets/translations/pl.json'
import en from '@/assets/translations/en.json'

// konfiguracja i18n
const i18n = createI18n({
    locale: 'pl',
    fallbackLocale: 'pl',
    messages: { pl, en },
})

const route = useRoute()

const app = createApp(App)

app.use(store).use(ToastPlugin).use(router).use(route).use(i18n).mount('#app')
