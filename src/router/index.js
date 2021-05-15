// /* eslint-disable */
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
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
    path: '/details/:VIN',
    name: 'CarDetails',
    component: () => import('@/views/CarDetails.vue'),
  },
  {
    path: '/details/:collectionPath/:ticketDetails',
    name: 'TicketDetails',
    component: () => import('@/views/TicketDetails.vue'),
  },
  {
    path: '/daneWarsztatu',
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
    component: () => import('@/views/ShowClients.vue'),
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
]

const router = createRouter({
  history: createWebHashHistory(),
  mode: 'history',
  routes
})

export default router
