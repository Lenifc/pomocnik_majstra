<template>

  <form class="newVehicleForm">
    <div class="closeForm" @click="$router.go(-1)">&times;</div>

    <div class="row">
      <div class="required column">
        <h2>Pola obowiązkowe: </h2>
        <label for="phoneNum" v-if="phoneNumNotStored">Number telefonu:</label>
          <input type="text" id="phoneNum" placeholder="123456789 / 1234567" required v-model="phoneNum" v-if="phoneNumNotStored">

        <label for="brand">Marka:</label>
        <select name="brand" required @change="fetchModels()" v-model="selectedBrand"
          v-if="!manualBrandModelVersionInput">
          <option disabled selected value="">Wybierz marke</option>
          <option v-for="brand in brands" :key="brand" :value="brand">{{ betterLooking(brand) }}</option>
        </select>
        <input type="text" name="brand" v-if="manualBrandModelVersionInput" required v-model="selectedBrand"
          placeholder="Wpisz marke pojazdu">

        <label for="model">Model:</label>
        <select name="model" @change="fetchVersion()" v-model="selectedModel" :disabled="!models"
          v-if="!manualBrandModelVersionInput && !manualModelVersionInput" required>
          <option disabled selected value="">Wybierz model</option>
          <option v-for="model in models" :key="model" :value="replaceSpaces(model.pl)">{{ model.pl }}</option>
        </select>
        <input type="text" name="model" v-if="manualBrandModelVersionInput || manualModelVersionInput" required
          v-model="selectedModel" placeholder="Wpisz model pojazdu">

        <label for="prod_year">Generacja:</label>
        <select name="prod_year" v-model="selectedVersion"
          v-if="!manualVersionInput && !manualBrandModelVersionInput && !manualModelVersionInput" :disabled="!versions">
          <option disabled selected value="">Wybierz generacje</option>
          <option v-for="version in versions" :key="version" :value="version.pl">{{ version.pl }}</option>
        </select>
        <input type="text" name="prod_year"
          v-if="(selectedModel && manualVersionInput) || manualBrandModelVersionInput || manualModelVersionInput"
          v-model="selectedVersion" placeholder="Wpisz rocznik pojazdu">

        <label for="fuel">Rodzaj paliwa:</label>
        <select name="fuel" v-model="selectedFuel" required>
          <option disabled selected value="">Wybierz rodzaj paliwa</option>
          <option value="Benzyna"> Benzyna </option>
          <option value="Benzyna LPG"> Benzyna + LPG </option>
          <option value="Diesel"> Diesel </option>
          <option value="Elektryczny"> Elektryczny </option>
          <option value="Hybryda"> Hybryda </option>
        </select>
        <label for="VIN">VIN:</label>
        <input id="VIN" type="text" maxlength="17" v-model="VIN" required>
      </div>

      <div class="extraInformation column">
        <h2>Dodatkowe informacje: </h2>
        <label for="engine">Silnik:</label><input name="engine" type="text" v-model="engine"
          placeholder="Pojemność / Moc">

        <label for="transmission">Rodzaj skrzyni:</label>
        <select name="transmission" v-model="selectedTransmission">
          <option disabled selected value="">Wybierz rodzaj skrzyni biegów</option>
          <option value="Automatyczna"> Automatyczna </option>
          <option value="Manualna"> Manualna </option>
        </select>

        <label for="drivetrain">Rodzaj napędu:</label>
        <select name="drivetrain" v-model="selectedDriveTrain">
          <option disabled selected value="">Wybierz napęd</option>
          <option value="Przod"> Przód </option>
          <option value="Tyl"> Tył </option>
          <option value="4x4"> 4x4 </option>
        </select>

        <label for="numberPlates">Tablica rejestracyjna:</label>
        <input id="numberPlates" type="text" maxlength="9" v-model="numberPlates">
        <label for="mileage">Przebieg:</label>
        <input id="mileage" type="text" maxlength="7" v-model="mileage">

        <textarea name="description" cols="50" rows="10" placeholder="Dodatkowe informacje"
          v-model="description"></textarea>
      </div>
    </div>


    <div class="row buildIn-buttons">
      <button class="btn addData success" @click="validateData($event)">
        {{ $route.path.indexOf('edytuj') > 0 ? "Edytuj pojazd" : "Dodaj pojazd" }}
      </button>
      <button class="btn clearForm failed" @click="clearForm">Wyczyść formularz</button>
    </div>
  </form>

</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'
import validPhoneNum from '@/components/validPhoneNum.js'
import validateVIN from '@/components/validateVIN.js'

import axios from 'axios'
import firebase from 'firebase/app'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const phoneNum = ref(store.state.numberForNewVehicle || '')
    const clientName = ref('')
    const brands = ref()
    const selectedBrand = ref('')
    const models = ref()
    const selectedModel = ref('')
    const versions = ref()
    const selectedVersion = ref('')
    const selectedFuel = ref('')

    const engine = ref('')
    const selectedTransmission = ref('')
    const selectedDriveTrain = ref('')
    const numberPlates = ref('')
    const VIN = ref('')
    const mileage = ref('')
    const description = ref('')
    const phoneNumNotStored = ref(false)

    let controller = new AbortController()

    const manualBrandModelVersionInput = ref(false)
    const manualModelVersionInput = ref(false)
    const manualVersionInput = ref(false)

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('Klienci').collection("Numery")

    const link = 'https://europe-west1-baza-mech.cloudfunctions.net/fetchData' // PRODUKCYJNY

    async function fetchBrands() {
      manualBrandModelVersionInput.value = false
      manualModelVersionInput.value = false
      manualVersionInput.value = false

      let data = await fetch(`${link}/dodaj`, {
          signal: controller.signal
        }).then(response => response.json()) // PRODUKCYJNY
        .catch((err) => {
          manualBrandModelVersionInput.value = true
          if (err.message.indexOf('Failed to fetch') >= 0) PopupFunc('warning', 'Wystąpił problem z pobraniem producentów pojazdów.')
        })

      let allMakes = data?.options
      if (allMakes) brands.value = Object.keys(allMakes).sort((next, current) => next > current ? 1 : -1)
    }
    async function fetchModels() {
      selectedModel.value = null
      models.value = null
      selectedVersion.value = null
      versions.value = null
      manualModelVersionInput.value = false
      manualVersionInput.value = false

      const data = await axios.get(`${link}/dodaj/${selectedBrand.value}`) // PRODUKCYJNY
        .catch(() => {
          manualModelVersionInput.value = true
          PopupFunc('warning', 'Wystąpił problem z pobraniem Modeli danego producenta.')
        })

      models.value = data?.data?.options
    }
    async function fetchVersion() {
      selectedVersion.value = null
      versions.value = null
      manualVersionInput.value = false

      const data = await axios.get(`${link}/dodaj/${selectedBrand.value}/${selectedModel.value}`) // PRODUKCYJNY
        .catch(() => {
          manualVersionInput.value = true
          PopupFunc('info', 'Ten model nie posiada podziału na wersje.\nMożesz podać rocznik ręcznie.')
        })
      // ?. jest jak if statement sprawdzajacy czy obiekt istnieje
      versions.value = data?.data?.options
    }

    function validateData(e) {
      e.preventDefault()

      let convertedMileage = mileage.value ? mileage.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''

      if (validPhoneNum(phoneNum.value) && selectedBrand.value) {

        let preparedData = []
        let timeStamp = getTime()
        let ID = (store.state.targetCar && store.state?.targetCar['Tel']) == phoneNum.value ? store.state.targetCar['id'] : Date.now()
        if (selectedModel.value == null || VIN.value == null) {
          PopupFunc('error', 'Uzupełnij brakujące informacje')
          return
        }
        let VIN_Number = validateVIN(VIN.value)
        if (!VIN_Number) {
          PopupFunc('error', 'Numer VIN nieprawidłowy')
          return
        }
        preparedData[VIN_Number] = {
          id: ID,

          Tel: validPhoneNum(phoneNum.value),
          Marka: betterLooking(selectedBrand.value),
          Model: selectedModel.value,
          Wersja_Rocznik: selectedVersion.value,
          Paliwo: selectedFuel.value,

          Silnik: engine.value || '',
          SkrzyniaBiegow: selectedTransmission.value || '',
          Naped: selectedDriveTrain.value || '',
          Numer_rejestracyjny: numberPlates.value ? numberPlates.value.toUpperCase() : "",
          VIN: VIN_Number,
          Przebieg: convertedMileage || "",

          Opis: description.value || "",
          Ostatnia_Aktualizacja: (store.state.targetCar && store.state.targetCar['Ostatnia_Aktualizacja']) || timeStamp,

        }
        sendDataToFirebase(preparedData)

      } else PopupFunc('error', 'Upewnij się, że dane są prawidłowe! ⚠️')

    }


    function sendDataToFirebase(preparedData) {
      let Tel = Object.values(preparedData)[0].Tel

      const docReference = tickets.doc(Tel)

      docReference.get().then(function (doc) {

        if (!doc.exists) {
          throw Error(PopupFunc("error", 'W pierwszej kolejności dodaj dane klienta, następnie pojazdu'))
        } else {
          if (checkIfVINexists(doc.data(), preparedData) && route.path.indexOf('edytuj') <= 0) {
            PopupFunc("error", "Pojazd o podanym numerze VIN jest już przypisany do danego klienta!")
            return
          }

          docReference.update({
              ...preparedData, Ostatnia_Aktualizacja: getTime()
            }).then(() => PopupFunc('success', `Dodano nowy pojazd do numeru telefonu: ${Tel}`))
            .catch(err => PopupFunc("error", err.message))
        }


        manualVersionInput.value = false
        clearForm()
        router.go(-1)
        store.commit('setTargetCar', '')
      })
    }

    function checkIfVINexists(objectToCheck, preparedData) {
      let vehicles = Object.values(objectToCheck)?.filter(item => item instanceof Object)

      let result = []
      vehicles.forEach(item => {
        if (item.VIN == Object.values(preparedData)[0].VIN) result.push(true)
        result.push(false)
      })

      return result.some(val => val == true)
    }


    function clearForm() {
      clientName.value = null
      selectedBrand.value = null
      models.value = null
      selectedModel.value = null
      versions.value = null
      selectedVersion.value = null
      selectedFuel.value = null
      VIN.value = null

      engine.value = null
      selectedTransmission.value = null
      selectedDriveTrain.value = null
      numberPlates.value = null
      mileage.value = null

      description.value = null
    }

    function autoFillData() {
      const fill = store.state.targetCar

      phoneNum.value = fill['Tel'] || store.state.targetClient.Tel || ''
      selectedBrand.value = fill['Marka'] || ''
      selectedModel.value = fill['Model'] || ''
      selectedVersion.value = fill['Wersja_Rocznik'] || ''
      selectedFuel.value = fill['Paliwo'] || ''

      engine.value = fill['Silnik'] || ''
      selectedTransmission.value = fill['SkrzyniaBiegow'] || ''
      selectedDriveTrain.value = fill['Naped'] || ''
      numberPlates.value = fill['Numer_rejestracyjny'] || ''
      VIN.value = fill['VIN'] || ''
      mileage.value = fill['Przebieg'] || ''

      description.value = fill['Opis'] || ''
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
      if((!store.state.targetCar && !store.state.targetCar?.phoneNum) && !phoneNum.value) phoneNumNotStored.value = true
      if (route.path.indexOf('edytuj') > 0) {
        manualBrandModelVersionInput.value = true
        store.state.targetCar && autoFillData()
      } else {
        clearForm()
        store.commit('setTargetCar', '')
        fetchBrands()
      }
    })

    watch(() => route.path, () => {
      if (route.path.indexOf('edytuj') <= 0) {
        clearForm()
        store.commit('setTargetCar', '')
        if (route.path.indexOf('dodaj') <= 0) fetchBrands()
      }
    })

    onBeforeUnmount(() => controller.abort())

    return {

      phoneNum,
      VIN,
      numberPlates,
      mileage,
      description,
      clientName,

      fetchModels,
      fetchVersion,

      brands,
      models,
      versions,
      selectedBrand,
      selectedModel,
      selectedVersion,

      engine,
      selectedFuel,
      selectedTransmission,
      selectedDriveTrain,

      replaceSpaces,
      betterLooking,

      validateData,

      manualBrandModelVersionInput,
      manualModelVersionInput,
      manualVersionInput,
      phoneNumNotStored,

      clearForm
    }
  }
}
</script>

<style>

</style>