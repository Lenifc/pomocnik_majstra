import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/bootstrap4-dark-blue/theme.css'      //theme
import 'primevue/resources/primevue.min.css'                //core css
import 'primeicons/primeicons.css'          //icons
import 'primeflex/primeflex.css'
import Tooltip from 'primevue/tooltip';

import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice';

const app = createApp(App)

app.directive('tooltip', Tooltip);

app.use(store).use(router).use(PrimeVue, {ripple: true}).use(ConfirmationService).use(ToastService).mount('#app')
