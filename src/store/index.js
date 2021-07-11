import { createStore } from 'vuex'

export default createStore({
  state: {
    fetchedItems: [],
    carDetails: '',
    targetCar: null,
    targetClient: null,
    clientData: null,
    numberForNewVehicle: null,
    selectedCarForTicket: null,
    invoiceData: null

  },
  mutations: {
    setFetchedItems(state, data){
      state.fetchedItems = data
    },
    setCarDetails(state, data){ // routing przy przejsciu do szczegolow
      state.carDetails = data
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
    },
    setSelectedCarForTicket(state, data){
      state.selectedCarForTicket = data
    },
    setInvoiceData(state, data){
      state.invoiceData = data
    }
  },
  actions: {
  },
  modules: {
  }
})
