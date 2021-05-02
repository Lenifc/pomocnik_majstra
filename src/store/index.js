import { createStore } from 'vuex'

export default createStore({
  state: {
    fetchedItems: [],
    carDetails: '',
    targetCar: null,
    targetClient: null,
    clientData: null,
    numberForNewVehicle: null

  },
  mutations: {
    setFetchedItems(state, data){
      state.fetchedItems = data
      // console.log(state.fetchedItems);
    },
    setCarDetails(state, data){ // routing przy przejsciu do szczegolow
      state.carDetails = data
      // console.log(state.carDetails);
    },
    setTargetCar(state, data){
      state.targetCar = data
    },
    setTargetClient(state, data){
      state.targetClient = data
    },
    setClientData(state, data){
      state.clientData = data
    },
    setNumberForNewVehicle(state, data){
      state.numberForNewVehicle = data
    }
  },
  actions: {
  },
  modules: {
  }
})
