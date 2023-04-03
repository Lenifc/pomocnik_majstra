import { createRouter, createWebHistory } from 'vue-router'
import ROUTES from './routes'
import store from '@/store'

import firebase from 'firebase/app'
require('firebase/auth')

const routes = [
    {
        path: ROUTES.MAIN_SCREEN,
        name: 'Main',
        component: () => import('@/MainScreen.vue'),
    },
    {
        path: ROUTES.DASHBOARD,
        name: 'Dashboard',
        component: () => import('@/pages/app/dashboard.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: ROUTES.DASHBOARD,
        meta: { requiresAuth: true },
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
})

const auth = firebase.auth()
const isAuth = localStorage.getItem('isAuth')

// navigation guard
router.beforeEach((to, from, next) => {
    auth.onAuthStateChanged(user => {
        store.dispatch('applyAuth', user)
        if (user && !isAuth) localStorage.setItem('isAuth', true)
    })

    const user = store.state.auth?.user

    if (
        to.matched.some(record => record.meta.requiresAuth) &&
        !user &&
        !isAuth
    ) {
        next({ path: ROUTES.MAIN_SCREEN })
    } else {
        next()
    }
})

export default router
