<template>

  <form class="newVehicleForm">
    <div class="closeForm" @click="$router.go(-1)">&times;</div>

    <div class="row">
      <div class="required column">
        <h2>Pola obowiązkowe: </h2>
        <label for="phoneNum" v-if="phoneNumNotStored">Number telefonu:</label>
          <InputText name="phoneNum" placeholder="123-456-789 / 123-45-67" required v-model="phoneNum" 
          v-if="phoneNumNotStored"/>

        <label for="brand">Marka:</label>
        <Dropdown v-model="selectedBrand" :options="brands" optionLabel="brand" optionValue="brand" 
        :filter="true" placeholder="Wybierz marke" :showClear="true" @change="fetchModels()" 
        v-if="!manualBrandModelVersionInput" scrollHeight="60vh" required>
          <template #value="slotProps"> <!-- ten template odpowiada za aktualnie wybrany pojazd -->
            <div v-if="slotProps.value">
              <span>{{betterLooking(slotProps.value)}}</span>
            </div>
            <span v-else> {{slotProps.placeholder}} </span>
          </template> <!-- ten template odpowiada za wyswietlenie calej listy -->
          <template #option="slotProps">
            <div>
              <span>{{betterLooking(slotProps.option.brand)}}</span>
            </div>
          </template>
        </Dropdown>
        <InputText type="text" name="brand" v-if="manualBrandModelVersionInput" required v-model="selectedBrand"
          placeholder="Wpisz marke pojazdu" />

        <label for="model">Model:</label>
        <Dropdown v-model="selectedModel" :options="models" optionLabel="pl" optionValue="pl" placeholder="Wybierz model" 
        :filter="true" :showClear="true" @change="fetchVersion()" v-if="!manualBrandModelVersionInput && !manualModelVersionInput" 
                :disabled="!models" scrollHeight="60vh" required>
         <template #value="slotProps">
            <div v-if="slotProps.value">
              <span>{{replaceSpaces(slotProps.value)}}</span>
            </div>
            <span v-else> {{slotProps.placeholder}} </span>
          </template>
          <template #option="slotProps">
            <div>
              <span>{{replaceSpaces(slotProps.option.pl)}}</span>
            </div>
          </template>
          </Dropdown>
        <InputText type="text" name="model" v-if="manualBrandModelVersionInput || manualModelVersionInput" required
          v-model="selectedModel" placeholder="Wpisz model pojazdu" />

        <label for="prod_year">Generacja:</label>
        <Dropdown v-model="selectedVersion" :options="versions" optionLabel="version" placeholder="Wybierz generacje"
                  v-if="!manualVersionInput && !manualBrandModelVersionInput && !manualModelVersionInput"
                  :disabled="!versions" required scrollHeight="60vh" :showClear="true">
         <template #value="slotProps">
            <div v-if="slotProps.value">
              <span>{{slotProps.value}}</span>
            </div>
            <span v-else> {{slotProps.placeholder}} </span>
          </template>
          <template #option="slotProps">
            <div>
              <span>{{slotProps.option}}</span>
            </div>
          </template> 
          </Dropdown>
        <InputText type="text" name="prod_year"
          v-if="(selectedModel && manualVersionInput) || manualBrandModelVersionInput || manualModelVersionInput"
          v-model="selectedVersion" placeholder="Wpisz rocznik pojazdu" />

        <label for="fuel">Rodzaj paliwa:</label>
        <Dropdown name="fuel" v-model="selectedFuel" :options="fuelOptions" optionLabel="name" optionValue="name" 
        required placeholder="Wybierz rodzaj paliwa" :showClear="true" scrollHeight="60vh" />
        <label for="VIN">VIN:</label>
        <InputText id="VIN" type="text" maxlength="17" v-model="VIN" required />
      </div>

      <div class="extraInformation column">
        <h2>Dodatkowe informacje: </h2>
        <label for="engine">Silnik:</label>
        <InputText name="engine" type="text" v-model="engine" placeholder="Pojemność / Moc" />

        <label for="transmission">Rodzaj skrzyni:</label>
        <Dropdown name="transmission" v-model="selectedTransmission" :options="gearboxOptions" optionLabel="name" 
        optionValue="name" required placeholder="Wybierz rodzaj skrzyni" :showClear="true" scrollHeight="60vh"/>

        <label for="drivetrain">Rodzaj napędu:</label>
        <Dropdown name="drivetrain" v-model="selectedDriveTrain" :options="drivetrainOptions" optionLabel="name" 
        optionValue="name" required placeholder="Wybierz rodzaj napędu" :showClear="true" scrollHeight="60vh"/>

        <label for="numberPlates">Tablica rejestracyjna:</label>
        <InputText id="numberPlates" type="text" maxlength="9" v-model="numberPlates" />
        <label for="mileage">Przebieg:</label>
        <InputText id="mileage" type="text" maxlength="7" v-model="mileage" />

       </div>
        </div>
        <Editor v-model="description" editorStyle="height: 250px; min-width: 70vw">
          <template #toolbar>
            <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
              <button class="ql-list" value="bullet"></button>
            </span>
          </template>
        </Editor>


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

import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';

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

    const counterPath = firebase.firestore()
      .collection('warsztat')
      .doc('Klienci')

    const fuelOptions = [
      {name: 'Benzyna'},
      {name: 'Benzyna LPG'},
      {name: 'Diesel'},
      {name: 'Elektryczny'},
      {name: 'Hybryda'}
    ]

    const gearboxOptions = [
      {name: 'Automatyczna'},
      {name: 'Manulana'},
      {name: 'Brak (Elektryk)'}
    ]

    const drivetrainOptions = [
      {name: 'Przód'},
      {name: 'Tył'},
      {name: '4x4'}
    ]

    const link = 'https://europe-west1-baza-mech.cloudfunctions.net/fetchData' // PRODUKCYJNY

    async function fetchBrands() {
      manualBrandModelVersionInput.value = false
      manualModelVersionInput.value = false
      manualVersionInput.value = false

      let data = await fetch(`${link}/dodaj`, {
          signal: controller.signal
        }).then(response => response.json())
        .catch((err) => {
          manualBrandModelVersionInput.value = true
          if (err.message.indexOf('Failed to fetch') >= 0) PopupFunc('warning', 'Wystąpił problem z pobraniem producentów pojazdów.')
        })

      let allMakes = data?.options
      if (allMakes) brands.value = Object.keys(allMakes).sort((next, current) => next > current ? 1 : -1).map(item => {
        return {brand: item}
      })
    }
    async function fetchModels() {
      selectedModel.value = null
      models.value = null
      selectedVersion.value = null
      versions.value = null
      manualModelVersionInput.value = false
      manualVersionInput.value = false

      if(selectedBrand.value !== null){

      const data = await axios.get(`${link}/dodaj/${selectedBrand.value}`)
        .catch(() => {
          manualModelVersionInput.value = true
          PopupFunc('warning', 'Wystąpił problem z pobraniem Modeli danego producenta.')
        })

      // models.value = Object.entries(data?.data?.options).map(item => item[1].pl)
      if(data?.data?.options) models.value = Object.values(data?.data?.options)
      }
    }
    async function fetchVersion() {
      selectedVersion.value = null
      versions.value = null
      manualVersionInput.value = false

      if(selectedModel.value !== null){

      const data = await axios.get(`${link}/dodaj/${selectedBrand.value}/${replaceSpaces(selectedModel.value)}`)
        .catch(() => {
          manualVersionInput.value = true
          PopupFunc('info', 'Ten model nie posiada podziału na wersje.\nMożesz podać rocznik ręcznie.')
        })
      // ?. jest jak if statement sprawdzajacy czy obiekt istnieje
      if(data?.data?.options) versions.value = Object.entries(data?.data?.options).map(item => item[1].pl)
      }
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

        if(route.path.indexOf('edytuj') < 0) counterPath.update("Pojazdy", firebase.firestore.FieldValue.increment(1))
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
      if(value.length){
        value = value.replace(" ", "-")
        return value.replace(/[!@#$%^&*(){}<>?.;+_]/g, '')
      }
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
      fuelOptions,
      selectedTransmission,
      gearboxOptions,
      selectedDriveTrain,
      drivetrainOptions,

      replaceSpaces,
      betterLooking,

      validateData,

      manualBrandModelVersionInput,
      manualModelVersionInput,
      manualVersionInput,
      phoneNumNotStored,

      clearForm,

      Dropdown,
      InputText,
      Editor
    }
  }
}
</script>

<style>

</style>