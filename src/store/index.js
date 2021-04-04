import { createStore } from 'vuex'

export default createStore({
  state: {
    refreshTickets: false,
    dataPath: ''
  },
  mutations: {
    toggleRefresh(state){
      if(state.refreshTickets == false) state.refreshTickets = true
      else if(state.refreshTickets == true) state.refreshTickets = false
    },
    setPath(state, newPath){
      state.dataPath = newPath
    }
  },
  actions: {
  },
  modules: {
  }
})
