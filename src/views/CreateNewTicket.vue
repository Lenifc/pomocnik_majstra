<template>
  <div class="newDataDiv">

            <div class="closeForm" @click="$router.go(-1)">&times;</div>

            <!-- tutaj dodac lewa strone screena z autowyszukiwaniem danych -->

            <!-- Podzielic screen na dwa, ponizej dac na prawa strone jaok reczne wypelnianie -->
            <form class="newDataForm">
                
                <label for="phoneNum">Number telefonu:</label>
                <input type="number" id="phoneNum" placeholder="123456789 / 1234567" required v-model="phoneNum">

                <label for="brand">Marka:</label>
                <select name="brand" required @change="fetchModels()" v-model="selectedBrand">
                    <option disabled selected value="">Wybierz marke</option>
                    <option v-for="brand in brands" :key="brand" :value="brand">{{ betterLooking(brand) }}</option>
                </select>

                <label for="model">Model:</label>
                <select name="model" @change="fetchVersion()" v-model="selectedModel" :disabled="!models">
                    <option disabled selected value="">Wybierz model</option>
                    <option v-for="model in models" :key="model" :value="replaceSpaces(model.pl)">{{ model.pl }}</option>
                </select>

                  <label for="prod_year">Generacja:</label>
                <select name="prod_year" v-model="selectedVersion" :disabled="!versions">
                    <option disabled selected value="">Wybierz generacje</option>
                    <option v-for="version in versions" :key="version" :value="version.pl">{{ version.pl }}</option>
                </select>
                <!-- TODO -->
                <!-- GDY BRAK WERSJI NIECH WYSKOCZY POLE DO WPISANIA RECZNIE ROCZNIKA -->
                <input type="number" name="prod_year" v-if="false" placeholder="Wpisz rocznik pojazdu">

                <label for="VIN">VIN:</label><input type="text" maxlength="17" v-model="VIN">
                <label for="mileage">Przebieg:</label><input type="number" maxlength="7" v-model="milage">
                <textarea name="description" cols="50" rows="10" placeholder="Opis usterki" v-model="description"></textarea>
                <p>Dodaj zlecenie jako:</p>
                <div>
                  <input type="radio" id="waiting" name="ticket" value="wolne" checked v-model="picked">
                  <label for="waiting">Wolne</label>
                </div>

                <div>
                  <input type="radio" id="inprogress" name="ticket" value="obecne" v-model="picked">
                  <label for="inprogress">W realizacji</label>
                </div>
                <button class="btn addData" @click="validateData($event)">Dodaj</button>
            </form>
        </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

import PopupFunc from '@/components/PopupFunc.js'

import axios from 'axios'
import firebase from 'firebase/app'

export default {
  setup() {

    let phoneNum = ref()
    let VIN = ref("")
    let milage = ref()
    let description = ref()

    let brands = ref()
    let selectedBrand = ref()
    let models = ref()
    let selectedModel = ref()
    let versions = ref()
    let selectedVersion = ref()
    let picked = ref('wolne')

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    const link = 'https://www.otomoto.pl/api/open/categories/29'


    async function fetchBrands() {

      try {
        //ten skurwialy cors na przegladarkach...
        const data = await axios.get(`${link}/makes`)
        let allMakes = data.data.options
        brands.value = Object.keys(allMakes).sort((next, current) => next > current ? 1 : -1)
      } catch {
        err => console.log(err.message)
      }
    }
    async function fetchModels() {
      // Czyszczenie pozostalych zmiennych onChange
      versions.value = null
      selectedVersion.value = null
      models.value = null
      selectedModel.value = null

      try {
        const data = await axios.get(`${link}/models/${selectedBrand.value}`)
        models.value = data.data.options
      } catch {
        err => console.log(err.message)
      }

    }
    async function fetchVersion() {
      // Czyszczenie pozostalych zmiennych onChange
      selectedVersion.value = null
      versions.value = null

        const data = await axios.get(`${link}/models/${selectedBrand.value}/versions/${selectedModel.value}`)
        .catch(() => PopupFunc('info', 'Ten model nie posiada podziału na wersje.\nMożesz podać rocznik ręcznie.'))
        versions.value = (data && data.data.options) ? data.data.options : null
    }

    // Generuje czas dodania, ktory sluzy za sortowanie w firestore
    function refTime() {
      let time = new Date()
      let currTime = `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
      return currTime
    }

     function validateData(e) {
      e.preventDefault()

      let convertedMilage = milage.value ? milage.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''
      let temp_val = 0
      let valid


      if (phoneNum.value && (phoneNum.value.length == 9 || phoneNum.value.length == 7)) {
        if (phoneNum.value.length == 9) {
          temp_val = phoneNum.value
          phoneNum.value = temp_val.slice(0, 3) + "-" + temp_val.slice(3, 6) + "-" + temp_val.slice(6, 9);
        }
        if (phoneNum.value.length == 7) {
          temp_val = phoneNum.value
          phoneNum.value = temp_val.slice(0, 3) + "-" + temp_val.slice(3, 5) + "-" + temp_val.slice(5, 8);
        }
        //validate only if phoneNumber length is 7 or 9
        valid = true
      } else {
        valid = false
      }


      if (valid && selectedBrand.value) {
        // const { serverTimestamp } = firebase.firestore.FieldValue;

        let preparedData = []
        let timeStamp = refTime()
        let title = `${betterLooking(selectedBrand.value)} ${selectedModel.value} ${timeStamp}`
        if (selectedModel.value == null) {
          PopupFunc('error', 'Uzupełnij brakujące informacje')
          return
        }
        preparedData[title] = {
          // Dodane_Przez: user.displayName,
          Tel: phoneNum.value,
          Marka: betterLooking(selectedBrand.value),
          Model: selectedModel.value,
          Rok_prod: selectedVersion.value,
          silnik: [],
          VIN: VIN.value ? VIN.value.toUpperCase().trim() : "Brak danych",
          Przebieg: convertedMilage ? convertedMilage : "Brak danych",
          Opis: description.value ? description.value : "",
          Dodane_Czas: timeStamp,
          wykonane_prace: [],
          Zakonczone_Czas: [],
        }
        let pick = picked.value
        sendDataToFirebase(preparedData, pick)
        clearForm()

      } else PopupFunc('error', 'Upewnij się, że dane są prawidłowe! ⚠️')

    }


function sendDataToFirebase(preparedData, picked){
      let Tel = Object.values(preparedData)[0].Tel
      let timeStamp = Object.values(preparedData)[0]['Dodane_Czas']


         const collectionReference = tickets.collection(picked)
        let docReference = collectionReference.doc(Tel)

        docReference.get().then(function (doc) {
          if (doc.exists) {
            docReference.update({
                ...preparedData,
                timeStamp
              }).then(PopupFunc('success', "Do podanego numeru dodano kolejny pojazd"))
              .catch(err => PopupFunc("error", err.message))
          } else {
            docReference.set({
                ...preparedData,
                timeStamp
              }).then(PopupFunc('success', `Nowe zlecenie znajdziesz w zakładce "${picked}"`))
              .catch(err => PopupFunc("error", err.message))
          }
          
        }).catch(function (err) {
          PopupFunc("error", err.message)
        })
      
    }


    function clearForm() {
      phoneNum.value = ""
      VIN.value = null
      milage.value = null
      description.value = null

      selectedBrand.value = null
      models.value = null
      selectedModel.value = null
      versions.value = null
      selectedVersion.value = null
    }


    function betterLooking(value) {
      let temp = value
      temp = temp.replace('-', ' ')
      // Ponizszy zapis zamienia nam pierwsze litery (te po myslniku takze) na duze dla lepszej czytelnosci
      temp = temp.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
      value = temp.replace(' ', '-')
      return value
    }


    function replaceSpaces(value) {
      value = value.replace(" ", "-")
      return value.replace(/[!@#$%^&*(){}<>?.;+_]/g, '')
    }


    onMounted(() => {
      fetchBrands()
    })

    watch(phoneNum, (newVal, oldVal) => {
      if (newVal.length > 9) return phoneNum.value = oldVal
    })

    return {

      phoneNum,
      VIN,
      milage,
      description,

      fetchModels,
      fetchVersion,

      brands,
      models,
      versions,
      selectedBrand,
      selectedModel,
      selectedVersion,

      replaceSpaces,
      betterLooking,

      validateData,
      picked
    }
  }
}
</script>

<style>

</style>