import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/zakonczone',
    name: 'Done',
    component: () => import(/* webpackChunkName: "about" */ '../views/Done.vue')
  },
  {
    path: '/obecne',
    name: 'inProgress',
    component: () => import(/* webpackChunkName: "about" */ '../views/inProgress.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
