// /* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: () => import('@/App.vue')
  },
  {
    path: '/panel-glowny',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/dodaj',
    name: 'CreateTicket',
    component: () => import('@/components/Forms/OrderForm.vue')
  },
  {
    path: '/edytuj/:collectionPath/:ticketDetails',
    name: 'EditTicket',
    component: () => import('@/components/Forms/OrderForm.vue')
  },
  {
    path: '/wolne',
    name: 'ShowTickets_Free',
    component: () => import('@/views/ShowTickets.vue'),
  },
  {
    path: '/obecne',
    name: 'ShowTickets_Progress',
    component: () => import('@/views/ShowTickets.vue'),
  },
  {
    path: '/zakonczone',
    name: 'ShowTickets_Done',
    component: () => import('@/views/ShowTickets.vue'),
  },
  {
    path: '/szczegoly/:VIN',
    name: 'CarDetails',
    component: () => import('@/views/CarDetails.vue'),
  },
  {
    path: '/szczegoly/client/:phoneNum',
    name: 'ClientDetails',
    component: () => import('@/views/ClientDetails.vue'),
  },
  {
    path: '/szczegoly/:collectionPath/:phoneNum/:ticketDetails',
    name: 'TicketDetails',
    component: () => import('@/views/TicketDetails.vue'),
  },
  {
    path: '/dane-warsztatu',
    name: 'daneWarsztatu',
    component: () => import('@/views/WorkshopDetails.vue'),
  },
  {
    path: '/klienci',
    name: 'Zarządzaj klientami',
    component: () => import('@/views/ShowClients.vue'),
  },
  {
    path: '/klient/:numerTel/edytuj',
    name: 'Edytuj klienta',
    component: () => import('@/components/Forms/ClientForm.vue'),
  },
  {
    path: '/klient/dodaj',
    name: 'Dodaj klienta',
    component: () => import('@/components/Forms/ClientForm.vue'),
  },
  {
    path: '/pojazdy',
    name: 'Zarządzaj pojazdami',
    component: () => import('@/views/ShowVehicles.vue'),
  },
  {
    path: '/pojazd/dodaj',
    name: 'Dodaj pojazd',
    component: () => import('@/components/Forms/VehicleForm.vue'),
  },
  {
    path: '/pojazd/:VIN/edytuj',
    name: 'Edytuj pojazd',
    component: () => import('@/components/Forms/VehicleForm.vue'),
  },
  {
    path: '/szukaj',
    name: 'Szukaj',
    component: () => import('@/components/Forms/SearchForm.vue'),
  },
  {
    path: '/generuj-fakture',
    name: 'Faktura',
    component: () => import('@/components/Forms/InvoiceForm.vue'),
  },
  {
    path: '/ustawienia',
    name: 'Ustawienia',
    component: () => import('@/views/Settings.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/panel-glowny'
  },
]

const router = createRouter({
  history: createWebHistory(),
  mode: 'history',
  routes
})

export default router
