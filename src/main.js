import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import { createI18n } from 'vue-i18n'

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

createApp(App).use(store).use(router).use(i18n).mount('#app')
