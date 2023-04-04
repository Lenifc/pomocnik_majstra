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
        component: () => import(`@/pages${ROUTES.DASHBOARD}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.MANAGE_CLIENTS,
        name: 'Clients',
        component: () => import(`@/pages${ROUTES.MANAGE_CLIENTS}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.MANAGE_VEHICLES,
        name: 'Vehicles',
        component: () => import(`@/pages${ROUTES.MANAGE_VEHICLES}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.TASKS_ADD,
        name: 'Add Task',
        component: () => import(`@/pages${ROUTES.TASKS_ADD}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.TASKS_NEW,
        name: 'Tasks New',
        component: () => import(`@/pages${ROUTES.TASKS_NEW}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.TASKS_IN_PROGRESS,
        name: 'Tasks In Progress',
        component: () => import(`@/pages${ROUTES.TASKS_IN_PROGRESS}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.TASKS_DONE,
        name: 'Tasks Done',
        component: () => import(`@/pages${ROUTES.TASKS_DONE}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.SEARCH,
        name: 'Search',
        component: () => import(`@/pages${ROUTES.SEARCH}.vue`),
        meta: { requiresAuth: true },
    },
    {
        path: ROUTES.SETTINGS,
        name: 'Settings',
        component: () => import(`@/pages${ROUTES.SETTINGS}.vue`),
        meta: { requiresAuth: true },
    },
    // TODO - przerobic redirect na 404
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
