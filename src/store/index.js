import { createStore } from 'vuex'

const auth = {
    state: {
        user: null,
    },
    mutations: {
        setAuth(state, user) {
            state.user = user
        },
        signOut(state) {
            state.user = null
        },
    },
    actions: {},
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
