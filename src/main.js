import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/bootstrap4-dark-blue/theme.css'      // dark theme
// import 'primevue/resources/themes/vela-blue/theme.css'      // alt dark theme
import 'primevue/resources/primevue.min.css'                //core css
import 'primeicons/primeicons.css'          //icons
import 'primeflex/primeflex.css'
import Tooltip from 'primevue/tooltip';

import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice';

import Toast from "primevue/toast"
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import ConfirmDialog from 'primevue/confirmdialog'
import Divider from 'primevue/divider'


const app = createApp(App)

app.directive('tooltip', Tooltip);
app.component('Toast', Toast)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Card', Card)
app.component('Fieldset', Fieldset)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Divider', Divider)

app.use(store).use(router).use(PrimeVue, {ripple: true}).use(ToastService).use(ConfirmationService).mount('#app')


// primevue/resources/themes/bootstrap4-light-blue/theme.css // light theme