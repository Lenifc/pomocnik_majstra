<template>
  <div class="container column">
    <input type="text" class="filterCars" placeholder="Znajdź klienta/pojazd">

    <table class="showElements" v-if="recivedClients">
      <tr>
        <th></th>
        <th>Imie klienta:</th>
        <th>Numer telefonu:</th>
        <th>Wybierz Pojazd:</th>
      </tr>

      <tr v-for="(client, index) in recivedClients" :key="client.id" :id="`id${client.Tel}`">
        <td class="id hideUnder900">{{index+1}}</td>
        <td class="wrap">{{client.Imie }}</td>
        <td class="wrapSpace bold width-140">{{client.Tel }} {{ client.Tel2 ? `(${client.Tel2})` : ''}}</td>

        <div class="borders width-300">
          <div v-for="car in onlyCars(client)" :id="`id${car.VIN}`" :key="car.VIN">
            <div v-if="car.VIN" class="row">
              <div class="left column">
                <div>{{ car.Marka }} {{ car.Model }}</div>
                <div>{{ car.VIN }}</div>
              </div>
              <div class="right row">
                <button class="btn submit" v-if="selectedCar?.[0] == car" @click="$emit('openClientModal', 'false')">Zatwierdź</button>
                <input type="radio" name="select" v-model="selectedCar" :value="[car, client]">
              </div>
            </div>
          </div>
        </div>
        
      </tr>

    </table>
    <button class="btn"
          @click="getClientsFromFirebase('more')" v-if="!disableNextButton">Załaduj więcej klientów</button>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, ref, watch } from 'vue'
import PopupFunc from '@/components/PopupFunc'
import { useStore } from 'vuex'


require('firebase/firestore')

 export default {
   emits:['openClientModal'],
   setup() {
     
     const store = useStore()

     const recivedClients = ref()
     const limit = ref(40) // sprawdzic pozniej dla 40 jak to smiga
     const lastDoc = ref(0)
     const disableNextButton = ref(true)
     const selectedCar = ref()

     const MainPath = firebase.firestore()
       .collection('warsztat').doc('Klienci').collection('Numery')

     async function getClientsFromFirebase(req) {
       if(req == 'more') limit.value += 30

      const clientPath = MainPath
      .orderBy("Ostatnia_Aktualizacja", "desc") // jak ujebie orderBy to doladowanie smiga i domyslnie sortuje po numerze tel.
       .limit(limit.value)

       let clientResponse = await clientPath.get()

       lastDoc.value = clientResponse.docs[clientResponse.docs.length - 1]

       if (!clientResponse.docs.length) {
        disableNextButton.value = true
        PopupFunc('warning', 'Wczytano już wszystkich klientów.')
       }

       recivedClients.value = clientResponse.docs.map(doc => doc.data())

      disableNextButton.value = false
        if (clientResponse.docs.length < limit.value) {
          disableNextButton.value = true
          PopupFunc('warning', 'Wczytano już wszystkich klientów.')
        }
     }

    function onlyCars(client){
      return Object.values(client).filter(item => item instanceof Object)
    }

     onMounted(() => {
       getClientsFromFirebase()
     })

     watch(() => selectedCar.value, () => store.commit('setSelectedCarForTicket', selectedCar.value))

     return {

       recivedClients,

       onlyCars,
       getClientsFromFirebase,
       disableNextButton,

       selectedCar
     }

   }
 }
</script>

<style scoped>
table{
  width: fit-content;
  height: fit-content;
}

.buttons-section{
  padding: 8px 0;
}
.buttons-section i{
  padding: 4px 0;
}

.borders{
  border-right: 3px solid green;
  height: 100%;
  padding: 6px 4px;
  position: relative;
  display: grid;
  align-items: center;
}

.borders::after{
  content: '';
  position: absolute;
  top: -1px;
  left: 0px;
  width: 100%;
  height: 3px;
  background-color: green; 
}
.borders::before{
  content: '';
  position: absolute;
  bottom: -1px;
  left: -1px;
  width: 101%;
  height: 2px;
  background-color: green;
}

.row{
  gap: 10px;
  width: 100%;
}

.fa-plus{
  font-size: 0.85rem!important;
  padding: 12px 0;
  display: flex;
  align-items: center;
  margin-left: 50%;
  transform: translateX(-50%)
}

i{
  width: fit-content;
  font-size: 1.66rem;
}
.left,
.right{
  padding: 8px 0;
}

.left.column{
  width: fit-content;
  padding-left: 4px;
}

.right.row{
  align-items: center;
  justify-content: flex-end;
  padding: 0;
}

.width-50{
  width: 50px;
}
.width-140{
  width: 140px;
  min-width: 130px;
}
.width-280{
  min-width: 200px;
  width: 280px;
}

.width-300{
  max-width: 300px;
}

.width-42{
  width: 42px;
}

tr:nth-child(even){
  background-color: #444;
}
</style>