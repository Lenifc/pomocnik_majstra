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
    invoiceData: null,
    searchData: null,
    protocolData: [],
    fillProtocol: [],
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
    },
    setSearchData(state, data){
      state.searchData = data
    },
    setProtocolData(state, data){
      state.protocolData = data
    },
    setFillProtocol(state, data){
      state.fillProtocol = data
    }
  },
  actions: {
  },
  modules: {
  }
})
