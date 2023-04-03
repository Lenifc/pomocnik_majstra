import { createStore } from 'vuex'

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
    state: {},
    mutations: {},
    actions: {},
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
