<template>
  <div class="newDataDiv">

    <div class="closeForm" @click="$router.go(-1)">&times;</div>

    <!-- ZNALEZC JAKIS OGARNIETY VIN DECODER / SPRAWDZIC API CEPIKU -->
    <!-- YV1RS53K212038671 -->
    <!-- Podzielic screen na dwa, ponizej dac na prawa strone jaok reczne wypelnianie -->

    <!-- https://intercars.pl/s/lp-czesci-zamienne/ Uzupelnic Firestore o te kategorie -->

    <form class="newDataForm">

      <div class="row">
        <div class="required column">
          <h2>Pola obowiązkowe: </h2>
          <label for="phoneNum">Number telefonu:</label>
          <input type="number" id="phoneNum" placeholder="123456789 / 1234567" required v-model="phoneNum">

          <label for="clientName">Imie klienta:</label>
          <input type="text" id="clientName" required v-model="clientName">

          <label for="brand">Marka:</label>
          <select name="brand" required @change="fetchModels()" v-model="selectedBrand" v-if="!manualBrandModelVersionInput">
            <option disabled selected value="">Wybierz marke</option>
            <option v-for="brand in brands" :key="brand" :value="brand">{{ betterLooking(brand) }}</option>
          </select>
          <input type="text" name="brand" v-if="manualBrandModelVersionInput" required
            v-model="selectedBrand" placeholder="Wpisz marke pojazdu">

          <label for="model">Model:</label>
          <select name="model" @change="fetchVersion()" v-model="selectedModel" :disabled="!models" v-if="!manualBrandModelVersionInput" required>
            <option disabled selected value="">Wybierz model</option>
            <option v-for="model in models" :key="model" :value="replaceSpaces(model.pl)">{{ model.pl }}</option>
          </select>
          <input type="text" name="model" v-if="manualBrandModelVersionInput" required
            v-model="selectedModel" placeholder="Wpisz model pojazdu">

          <label for="prod_year">Generacja:</label>
          <select name="prod_year" v-model="selectedVersion" v-if="!showManualVersionInput" :disabled="!versions">
            <option disabled selected value="">Wybierz generacje</option>
            <option v-for="version in versions" :key="version" :value="version.pl">{{ version.pl }}</option>
          </select>
          <input type="text" name="prod_year" v-if="(selectedModel && showManualVersionInput)"
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

          <label for="numberPlates">Tablica rejestracyjna:</label><input type="text" maxlength="9" v-model="numberPlates">
          <label for="VIN">VIN:</label><input name="VIN" type="text" maxlength="17" v-model="VIN">
          <label for="mileage">Przebieg:</label><input name="mileage" type="number" maxlength="7" v-model="milage">

        </div>
      </div>

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

      <div class="row">
        <button class="btn addData success" @click="validateData($event)">Dodaj</button>
        <button class="btn clearForm failed" @click="clearForm" disabled>Wyczyść formularz</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'

import axios from 'axios'
import firebase from 'firebase/app'

export default {
  setup() {

    const phoneNum = ref()
    const clientName = ref()
    const brands = ref()
    const selectedBrand = ref()
    const models = ref()
    const selectedModel = ref()
    const versions = ref()
    const selectedVersion = ref()
    const selectedFuel = ref()

    const engine = ref()
    const selectedTransmission = ref()
    const selectedDriveTrain = ref()
    const numberPlates = ref()
    const VIN = ref("")
    const milage = ref()
    const description = ref()

    const picked = ref('wolne')

    const manualBrandModelVersionInput = ref(false)
    const showManualVersionInput = ref(false)

    const tickets = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia')

    // const link = 'https://www.otomoto.pl/api/open/categories/29'

    async function fetchBrands() {
      manualBrandModelVersionInput.value = false
      showManualVersionInput.value = false

      const data = await axios.get('http://localhost:3000/dodaj/')
        .catch(() => {
          manualBrandModelVersionInput.value = true
          PopupFunc('warning', 'Wystąpił problem z pobraniem producentów pojazdów.')
        })

      let allMakes = data?.data?.options
      brands.value = Object.keys(allMakes).sort((next, current) => next > current ? 1 : -1)
    }
    async function fetchModels() {
      // Czyszczenie pozostalych zmiennych onChange
      versions.value = null
      selectedVersion.value = null
      models.value = null
      selectedModel.value = null
      showManualVersionInput.value = false


      // const data = await axios.get(`${link}/models/${selectedBrand.value}`)
      const data = await axios.get(`http://localhost:3000/dodaj/${selectedBrand.value}/models`)
        .catch(() => PopupFunc('warning', 'Wystąpił problem z pobraniem Modeli danego producenta.'))

      models.value = data?.data?.options
    }
    async function fetchVersion() {
      // Czyszczenie pozostalych zmiennych onChange
      selectedVersion.value = null
      versions.value = null
      showManualVersionInput.value = false

      // const data = await axios.get(`${link}/models/${selectedBrand.value}/versions/${selectedModel.value}`)
      const data = await axios.get(`http://localhost:3000/dodaj/${selectedBrand.value}/${selectedModel.value}/versions`)
        .catch(() => {
          showManualVersionInput.value = true
          PopupFunc('info', 'Ten model nie posiada podziału na wersje.\nMożesz podać rocznik ręcznie.')
        })
      // ?. jest jak if statement sprawdzajacy czy obiekt instnieje
      versions.value = data?.data?.options
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
        let timeStamp = getTime()
        let ID = Date.now()
        if (selectedModel.value == null || clientName.value == null) {
          PopupFunc('error', 'Uzupełnij brakujące informacje')
          return
        }
        preparedData[ID] = {
          id: ID,

          Tel: phoneNum.value,
          Imie: clientName.value, 
          Marka: betterLooking(selectedBrand.value),
          Model: selectedModel.value,
          Wersja_Rocznik: selectedVersion.value,
          Paliwo: selectedFuel.value,

          Silnik: engine.value || '',
          SkrzyniaBiegow: selectedTransmission.value || '',
          Naped: selectedDriveTrain.value || '',
          Numer_rejestracyjny: numberPlates.value ? numberPlates.value.toUpperCase() : "",
          VIN: VIN.value ? VIN.value.toUpperCase().trim() : "",
          Przebieg: convertedMilage || "",

          Opis: description.value || "",
          Wykonane_uslugi_czesci: [],
          Koszt: 0,
          Dodane_Czas: timeStamp,
          Zakonczone_Czas: '',
        }
        let pick = picked.value
        console.log(preparedData);
        sendDataToFirebase(preparedData, pick)

      } else PopupFunc('error', 'Upewnij się, że dane są prawidłowe! ⚠️')

    }


    function sendDataToFirebase(preparedData, picked) {
      let Tel = Object.values(preparedData)[0].Tel
      let timeStamp = Object.values(preparedData)[0]['Dodane_Czas']


      const collectionReference = tickets.collection(picked)
      const docReference = collectionReference.doc(Tel)

      docReference.get().then(function (doc) {
        if (doc.exists) {
          docReference.update({
              ...preparedData,
              timeStamp
            }).then(() => PopupFunc('success', "Do podanego numeru dodano kolejny pojazd"))
            .catch(err => PopupFunc("error", err.message))
        } else {
          docReference.set({
              ...preparedData,
              timeStamp
            }).then(() => PopupFunc('success', `Nowe zlecenie znajdziesz w zakładce "${picked}"`))
            .catch(err => PopupFunc("error", err.message))
        }
        showManualVersionInput.value = false
        clearForm()
        tickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(1))

      }).catch(function (err) {
        PopupFunc("error", err.message)
      })
    }


    function clearForm() {
      phoneNum.value = ""
      clientName.value = null
      selectedBrand.value = null
      models.value = null
      selectedModel.value = null
      versions.value = null
      selectedVersion.value = null
      selectedFuel.value = null

      engine.value = null
      selectedTransmission.value = null
      selectedDriveTrain.value = null
      numberPlates.value = null
      VIN.value = null
      milage.value = null

      description.value = null
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

// watch pozniej do usuniecia
    watch(phoneNum, (newVal, oldVal) => {
      if (newVal.length > 9) return phoneNum.value = oldVal
    })

    return {

      phoneNum,
      VIN,
      numberPlates,
      milage,
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
      picked,

      manualBrandModelVersionInput,
      showManualVersionInput,

      clearForm
    }
  }
}
</script>

<style>

</style>