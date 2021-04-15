import { createStore } from 'vuex'

export default createStore({
  state: {
    passedData: [],
    fetchedItems: []
  },
  mutations: {
    fillPassedData(state, data){
      state.passedData = data
      console.log(state.passedData);
    },
    setFetchedItems(state, data){
      state.fetchedItems = data
      // console.log(state.fetchedItems);
    }
  },
  actions: {
  },
  modules: {
  }
})
