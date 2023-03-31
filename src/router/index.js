import { createRouter, createWebHistory } from 'vue-router'
import ROUTES from './routes'

const routes = [
    {
        path: ROUTES.MAIN_SCREEN,
        name: 'Main',
        component: () => import('@/MainScreen.vue'),
    },
    {
        path: ROUTES.LOGIN,
        name: 'Login',
        component: () => import('@/pages/login.vue'),
    },
    {
        path: ROUTES.DASHBOARD,
        name: 'Dashboard',
        component: () => import('@/pages/app/dashboard.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: ROUTES.DASHBOARD,
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
})

export default router
