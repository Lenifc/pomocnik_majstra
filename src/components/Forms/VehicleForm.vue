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
        <Dropdown v-model="carSpec.selectedBrand" :options="brands" optionLabel="brand" optionValue="brand" 
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
        <InputText type="text" name="brand" v-if="manualBrandModelVersionInput" required v-model="carSpec.selectedBrand"
          placeholder="Wpisz marke pojazdu" />

        <label for="model">Model:</label>
        <Dropdown v-model="carSpec.selectedModel" :options="models" optionLabel="pl" optionValue="pl" placeholder="Wybierz model" 
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
          v-model="carSpec.selectedModel" placeholder="Wpisz model pojazdu" />

        <label for="prod_year">Generacja:</label>
        <Dropdown v-model="carSpec.selectedVersion" :options="versions" optionLabel="version" placeholder="Wybierz generacje"
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
        <InputText type="text" name="prod_year" required
          v-if="(carSpec.selectedModel && manualVersionInput) || manualBrandModelVersionInput || manualModelVersionInput"
          v-model="carSpec.selectedVersion" placeholder="Wpisz rocznik pojazdu" />

        <label for="fuel">Rodzaj paliwa:</label>
        <Dropdown name="fuel" v-model="carSpec.selectedFuel" :options="fuelOptions" optionLabel="name" optionValue="name" 
        required placeholder="Wybierz rodzaj paliwa" :showClear="true" scrollHeight="60vh" />
        <label for="VIN">VIN:</label>
        <InputText id="VIN" type="text" maxlength="17" v-model="carSpec.VIN" required />
      </div>

      <div class="extraInformation column">
        <h2>Dodatkowe informacje: </h2>
        <label for="engine">Silnik:</label>
        <InputText name="engine" type="text" v-model="carSpec.engine" placeholder="Pojemność / Moc" />

        <label for="transmission">Rodzaj skrzyni:</label>
        <Dropdown name="transmission" v-model="carSpec.selectedTransmission" :options="gearboxOptions" optionLabel="name" 
        optionValue="name" required placeholder="Wybierz rodzaj skrzyni" :showClear="true" scrollHeight="60vh"/>

        <label for="drivetrain">Rodzaj napędu:</label>
        <Dropdown name="drivetrain" v-model="carSpec.selectedDriveTrain" :options="drivetrainOptions" optionLabel="name" 
        optionValue="name" required placeholder="Wybierz rodzaj napędu" :showClear="true" scrollHeight="60vh"/>

        <label for="numberPlates">Tablica rejestracyjna:</label>
        <InputText id="numberPlates" type="text" maxlength="9" v-model="carSpec.numberPlates" />
        <label for="mileage">Przebieg:</label>
        <InputText id="mileage" type="text" maxlength="7" v-model="carSpec.mileage" />

       </div>
        </div>
        <Editor v-model="carSpec.description" class="p-mx-auto p-mb-6">
          <template #toolbar>
            <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
              <button class="ql-list" value="bullet"></button>
            </span>
          </template>
        </Editor>


    <div class="row gap12">
      <button class="btn addData success" @click="validateData($event)">
        {{ $route.path.indexOf('edytuj') > 0 ? "Edytuj pojazd" : "Dodaj pojazd" }}
      </button>
      <button class="btn clearForm failed" @click="clearForm()">Wyczyść formularz</button>
    </div>
  </form>

</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import Dropdown from 'primevue/dropdown';
import Editor from 'primevue/editor';

import { useToast } from "primevue/usetoast"
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
    const toast = useToast()

    const phoneNum = ref(store.state.numberForNewVehicle || '')
    const clientName = ref()
    const brands = ref()
    const models = ref()
    const versions = ref()

    const checkOffline = ref()

    const manualBrandModelVersionInput = ref(false)
    const manualModelVersionInput = ref(false)
    const manualVersionInput = ref(false)
    const phoneNumNotStored = ref(false)

    const carSpec = reactive({
    selectedBrand: null,
    selectedModel: null,
    selectedVersion: null,
    selectedFuel: null,
    engine: null,
    selectedTransmission: null,
    selectedDriveTrain: null,
    numberPlates: null,
    VIN: null,
    mileage: null,
    description: null,
    })

    let controller = new AbortController()


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
      carSpec.selectedVersion = null

      let data = await fetch(`${link}/dodaj`, {
          signal: controller.signal
        }).then(response => response.json())
        .catch((err) => {
          manualBrandModelVersionInput.value = true
          if (err.message.indexOf('Failed to fetch') >= 0) toast.add({severity:'warn', summary: 'Problem sieciowy', detail:'Wystąpił problem z pobraniem producentów pojazdów.', life: 4000})
        })

      let allMakes = data?.options
      if (allMakes) brands.value = Object.keys(allMakes).sort((next, current) => next > current ? 1 : -1).map(item => {
        return {brand: item}
      })
    }
    async function fetchModels() {
      carSpec.selectedModel = null
      models.value = null
      carSpec.selectedVersion = null
      versions.value = null
      manualModelVersionInput.value = false
      manualVersionInput.value = false

      if(carSpec.selectedBrand !== null){

      const data = await axios.get(`${link}/dodaj/${carSpec.selectedBrand}`)
        .catch(() => {
          manualModelVersionInput.value = true
          toast.add({severity:'warn', summary: 'Problem sieciowy', detail:'Wystąpił problem z pobraniem modeli danego producenta.', life: 4000})
        })

      // models.value = Object.entries(data?.data?.options).map(item => item[1].pl)
      if(data?.data?.options) models.value = Object.values(data?.data?.options)
      }
    }
    async function fetchVersion() {
      carSpec.selectedVersion = null
      versions.value = null
      manualVersionInput.value = false

      if(carSpec.selectedModel !== null){

      const data = await axios.get(`${link}/dodaj/${carSpec.selectedBrand}/${replaceSpaces(carSpec.selectedModel)}`)
        .catch(() => {
          manualVersionInput.value = true
          toast.add({severity:'warn', summary: 'Brak danych', detail:'Ten model nie posiada podziału na wersje.\nMożesz podać rocznik ręcznie.', life: 4000})
        })
      // ?. jest jak if statement sprawdzajacy czy obiekt istnieje
      if(data?.data?.options) versions.value = Object.entries(data?.data?.options).map(item => item[1].pl)
      }
    }

    function validateData(e) {
      e.preventDefault()

      let convertedMileage = carSpec.mileage ? carSpec.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''

      if (validPhoneNum(phoneNum.value) && carSpec.selectedBrand) {

        let preparedData = []
        let timeStamp = getTime()
        let ID = (store.state.targetCar && store.state?.targetCar['Tel']) == phoneNum.value ? store.state.targetCar['id'] : Date.now()
        if (carSpec.selectedModel == null || carSpec.VIN == null) {
          toast.add({severity:'error', summary: 'Błąd danych', detail:'Uzupełnij brakujące dane.', life: 4000})
          return
        }
        let VIN_Number = validateVIN(carSpec.VIN)
        if (!VIN_Number) {
          toast.add({severity:'error', summary: 'Błąd danych', detail:'Numer VIN nieprawidłowy!', life: 4000})
          return
        }
        preparedData[VIN_Number] = {
          id: ID,

          Tel: validPhoneNum(phoneNum.value),
          Marka: betterLooking(carSpec.selectedBrand),
          Model: carSpec.selectedModel,
          Wersja_Rocznik: carSpec.selectedVersion,
          Paliwo: carSpec.selectedFuel,

          Silnik: carSpec.engine || '',
          SkrzyniaBiegow: carSpec.selectedTransmission || '',
          Naped: carSpec.selectedDriveTrain || '',
          Numer_rejestracyjny: carSpec.numberPlates?.toUpperCase() || '',
          VIN: VIN_Number,
          Przebieg: convertedMileage || "",

          Opis: carSpec.description || "",
          Ostatnia_Aktualizacja: (store.state.targetCar && store.state.targetCar['Ostatnia_Aktualizacja']) || timeStamp,

        }
        sendDataToFirebase(preparedData)

      } else toast.add({severity:'warn', summary: 'Błąd danych', detail:'Upewnij się, że dane zostały wprowadzone poprawnie.', life: 4000})
    }


    function sendDataToFirebase(preparedData) {
      let Tel = Object.values(preparedData)[0].Tel

      const docReference = tickets.doc(Tel)

      docReference.get().then(function (doc) {

        if (!doc.exists) {
          toast.add({severity:'error', summary: 'Brak klienta', detail:'W pierwszej kolejności dodaj dane klienta, następnie pojazdu.', life: 4000})
        } else {
          if (checkIfVINexists(doc.data(), preparedData) && route.path.indexOf('edytuj') <= 0) {
            toast.add({severity:'warn', summary: 'Pojazd już istnieje', detail:'Pojazd o podanym numerze VIN jest już przypisany do danego klienta!', life: 4000})
            return
          }

          docReference.update({
              ...preparedData, Ostatnia_Aktualizacja: getTime()
            }).then(() => {
              toast.removeAllGroups()
              toast.add({severity:'success', summary: 'Dodano pojazd', detail:`Dodano nowy pojazd do numeru telefonu: ${Tel}`, life: 4000})
              clearTimeout(checkOffline.value)
            })
            .catch(err => {
              toast.removeAllGroups()
              toast.add({severity:'error', summary: 'Błąd danych', detail: err.message, life: 4000})
            })
        }

        checkOffline.value = setTimeout(() => {
        toast.removeAllGroups()
        toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Dane zostaną zaktualizowane po przywróceniu połączenia.', life: 0})
      }, 2500)

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

      if(phoneNumNotStored.value) phoneNum.value = null
      clientName.value = null
      carSpec.selectedBrand = null
      models.value = null
      carSpec.selectedModel = null
      versions.value = null
      carSpec.selectedVersion = null
      carSpec.selectedFuel = null
      carSpec.VIN = null

      carSpec.engine = null
      carSpec.selectedTransmission = null
      carSpec.selectedDriveTrain = null
      carSpec.numberPlates = null
      carSpec.mileage = null

      carSpec.description = null
    }

    function autoFillData() {
      const fill = store.state.targetCar

      phoneNum.value = fill['Tel'] || store.state.targetClient.Tel || ''
      carSpec.selectedBrand = fill['Marka'] || ''
      carSpec.selectedModel = fill['Model'] || ''
      carSpec.selectedVersion = fill['Wersja_Rocznik'] || ''
      carSpec.selectedFuel = fill['Paliwo'] || ''

      carSpec.engine = fill['Silnik'] || ''
      carSpec.selectedTransmission = fill['SkrzyniaBiegow'] || ''
      carSpec.selectedDriveTrain = fill['Naped'] || ''
      carSpec.numberPlates = fill['Numer_rejestracyjny'] || ''
      carSpec.VIN = fill['VIN'] || ''
      carSpec.mileage = fill['Przebieg'] || ''

      carSpec.description = fill['Opis'] || ''
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
        return value.replace(/[!@#$%^&*(){}<>?.;+_]/g, '') // wyczyszczenei znakow specjalnych jest potrzebne do fetchowania generacji pojazdow
        // nie moze byc np. 'up!' -> tylko 'up' ; znaki specjalne marki Skoda itp.
      }
    }

    onMounted(() => {
      if(!phoneNum.value) phoneNumNotStored.value = true
      if (route.path.indexOf('edytuj') > 0 && store.state?.targetCar) {
        manualBrandModelVersionInput.value = true
        store.state.targetCar && autoFillData()
        return
      } 
      if(route.path.indexOf('edytuj') > 0 && !store.state?.targetCar){
        router.go(-1)
        return
      }
        clearForm()
        store.commit('setTargetCar', '')
        fetchBrands()
      })

    watch(() => route.path, () => {
      if (route.path.indexOf('edytuj') <= 0) { // w przypadku braku sciezki /edytuj/ wyswietli nam czysty formularz i wyzeruje stan globalny 'targetCar'
        clearForm()
        store.commit('setTargetCar', '')
        if (route.path.indexOf('dodaj') <= 0) fetchBrands()
      }
    })

    onBeforeUnmount(() => controller.abort()) // zapobiega dalszemu pobieraniu sie danych w Promise w przypadku zamknięcia komponentu

    return {

      phoneNum,
      clientName,
      carSpec,

      brands,
      fetchModels,
      models,
      fetchVersion,
      versions,

      checkOffline,

      manualBrandModelVersionInput,
      manualModelVersionInput,
      manualVersionInput,

      fuelOptions,
      gearboxOptions,
      drivetrainOptions,

      replaceSpaces,
      betterLooking,

      validateData,
      clearForm,

      phoneNumNotStored,

      Dropdown,
      Editor
    }
  }
}
</script>

<style>
.p-editor-container{
  height: 250px; 
  max-width:60vw
}

.gap12{
  gap: 12px;
}
</style>