// /* eslint-disable */
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
  },
  {
    path: '/dodaj',
    name: 'CreateNewTicket',
    component: () => import('@/views/CreateNewTicket.vue')
  },
  {
    path: '/edytuj/:collectionPath/:ticketDetails',
    name: 'EditTicket',
    component: () => import('@/views/CreateNewTicket.vue')
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
    path: '/details/:collectionPath/:ticketDetails',
    name: 'TicketDetails',
    component: () => import('@/views/TicketDetails.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
