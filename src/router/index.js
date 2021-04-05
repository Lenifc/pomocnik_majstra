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
    path: '/wolne',
    name: 'ShowTicketsFree',
    component: () => import('@/views/ShowTickets.vue'),
  },
  {
    path: '/obecne',
    name: 'ShowTicketsProgress',
    component: () => import('@/views/ShowTickets.vue'),
  },
  {
    path: '/zakonczone',
    name: 'ShowTicketsDone',
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
