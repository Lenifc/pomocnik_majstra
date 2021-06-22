import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import PrimeVue from 'primevue/config'

import 'primevue/resources/themes/bootstrap4-dark-blue/theme.css'      //theme
// import 'primevue/resources/themes/vela-blue/theme.css'      //theme
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

const app = createApp(App)

app.directive('tooltip', Tooltip);
app.component('Toast', Toast)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Card', Card)

app.use(store).use(router).use(PrimeVue, {ripple: true}).use(ToastService).use(ConfirmationService).mount('#app')


// primevue/resources/themes/bootstrap4-light-blue/theme.css
// primevue/resources/themes/bootstrap4-light-purple/theme.css
// primevue/resources/themes/bootstrap4-dark-blue/theme.css
// primevue/resources/themes/bootstrap4-dark-purple/theme.css
// primevue/resources/themes/md-light-indigo/theme.css
// primevue/resources/themes/md-light-deeppurple/theme.css
// primevue/resources/themes/md-dark-indigo/theme.css
// primevue/resources/themes/md-dark-deeppurple/theme.css
// primevue/resources/themes/mdc-light-indigo/theme.css
// primevue/resources/themes/mdc-light-deeppurple/theme.css
// primevue/resources/themes/mdc-dark-indigo/theme.css
// primevue/resources/themes/mdc-dark-deeppurple/theme.css
// primevue/resources/themes/fluent-light/theme.css
// primevue/resources/themes/saga-blue/theme.css
// primevue/resources/themes/saga-green/theme.css
// primevue/resources/themes/saga-orange/theme.css
// primevue/resources/themes/saga-purple/theme.css
// primevue/resources/themes/vela-blue/theme.css
// primevue/resources/themes/vela-green/theme.css
// primevue/resources/themes/vela-orange/theme.css
// primevue/resources/themes/vela-purple/theme.css
// primevue/resources/themes/arya-blue/theme.css
// primevue/resources/themes/arya-green/theme.css
// primevue/resources/themes/arya-orange/theme.css
// primevue/resources/themes/arya-purple/theme.css
// primevue/resources/themes/nova/theme.css
// primevue/resources/themes/nova-alt/theme.css
// primevue/resources/themes/nova-accent/theme.css
// primevue/resources/themes/nova-vue/theme.css
// primevue/resources/themes/luna-amber/theme.css
// primevue/resources/themes/luna-blue/theme.css
// primevue/resources/themes/luna-green/theme.css
// primevue/resources/themes/luna-pink/theme.css
// primevue/resources/themes/rhea/theme.css