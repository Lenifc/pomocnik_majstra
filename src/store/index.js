import { createStore } from 'vuex'
import { getVehiclesFromFirebase } from '@/api/vehicles.js'

const auth = {
    state: {
        user: null,
        dataLoading: true,
    },
    mutations: {
        setAuth(state, user) {
            state.user = user
            state.dataLoading = false
        },
        signOut(state) {
            state.user = null
            localStorage.removeItem('isAuth')
        },
    },
    actions: {
        async applyAuth({ commit }, user) {
            await commit('setAuth', user)
        },
    },
    getters: {
        isAuthenticated(state) {
            return !!state.user
        },
    },
}

const users = {
    state: {},
    mutations: {},
    actions: {},
}

const vehicles = {
    state: {
        vehicleList: [],
        total: null,
        fetchLimit: null,
        loadingState: false,
    },
    mutations: {
        setVehicles(state, vehicleList) {
            state.vehicleList = vehicleList?.vehicles
            state.total = vehicleList?.total
            this.commit('setLoadingState', false)
        },
        setFetchLimit(state, value) {
            state.fetchLimit = value
        },
        setLoadingState(state, value) {
            state.loadingState = value
        },
    },
    actions: {
        async getVehicles({ commit }, amount) {
            if (typeof amount === Number) commit('setFetchLimit', amount)
            commit('setLoadingState', true)
            commit('setVehicles', await getVehiclesFromFirebase(amount))
        },
    },
}

const settings = {
    state: {},
    mutations: {},
    actions: {},
}

export default createStore({
    modules: {
        auth,
        users,
        vehicles,
        settings,
    },
})
