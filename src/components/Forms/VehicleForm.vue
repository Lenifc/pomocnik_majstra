<template>
<div class="p-pt-4">
  <Card class="relative" style="max-width:1000px; margin:0 auto">
    <template #title>
      <div class="closeForm" @click="$router.go(-1)">&times;</div>
      <div class="p-text-center">{{ $route.path.indexOf('edytuj') > 0 ? 'Edytuj dane pojazdu' : 'Dodaj nowy pojazd' }}</div>
    </template>
    <template #content>
      <form>

        <div class="p-d-flex p-flex-md-row p-flex-column p-jc-md-evenly p-ai-center">
          <div class="required p-d-flex p-flex-column">
            <h3>Pola obowiązkowe: </h3>
            <span class="p-float-label p-mt-5" v-if="phoneNumNotStored">
              <InputText id="phoneNum" v-model="phoneNum" v-if="phoneNumNotStored" />
              <label for="phoneNum">Numer telefonu</label>
            </span>

            <Dropdown v-model="carSpec.selectedBrand" :options="brands" optionLabel="brand" optionValue="brand"
              :filter="true" placeholder="Wybierz marke" :showClear="true" @change="fetchModels()"
              v-if="!manualBrandModelVersionInput" scrollHeight="60vh" id="brand" class="p-mt-3">
              <template #value="{value, placeholder}">
                <!-- ten template odpowiada za aktualnie wybrany pojazd -->
                <div v-if="value">
                  <span>{{betterLooking(value)}}</span>
                </div>
                <span v-else> {{placeholder}} </span>
              </template> <!-- ten template odpowiada za wyswietlenie calej listy -->
              <template #option="slotProps">
                <div>
                  <span>{{betterLooking(slotProps.option.brand)}}</span>
                </div>
              </template>
            </Dropdown>
            <span class="p-float-label p-mt-4" v-if="manualBrandModelVersionInput">
              <InputText id="brand" v-if="manualBrandModelVersionInput"
                v-model="carSpec.selectedBrand" />
                <label for="brand">Wpisz marke pojazdu</label>
            </span>

            <Dropdown v-model="carSpec.selectedModel" :options="models" optionLabel="pl" optionValue="pl" class="p-mt-3"
              placeholder="Wybierz model" :filter="true" :showClear="true" @change="fetchVersion()" id="model"
              v-if="!manualBrandModelVersionInput && !manualModelVersionInput" :disabled="!models" scrollHeight="60vh"
              required>
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
            <span class="p-float-label p-mt-4" v-if="manualBrandModelVersionInput || manualModelVersionInput">
              <InputText id="model" v-if="manualBrandModelVersionInput || manualModelVersionInput" required
                v-model="carSpec.selectedModel" />
              <label for="model">Wpisz model pojazdu</label>
            </span>

            <Dropdown v-model="carSpec.selectedVersion" :options="versions" optionLabel="version"
              placeholder="Wybierz generacje" id="prod_year" class="p-mt-3"
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
            <span class="p-float-label p-mt-4" v-if="(carSpec.selectedModel && manualVersionInput) || manualBrandModelVersionInput || manualModelVersionInput">
              <InputText id="prod_year" v-if="(carSpec.selectedModel && manualVersionInput) || manualBrandModelVersionInput || manualModelVersionInput"
                v-model="carSpec.selectedVersion" required/>
              <label for="prod_year">Generacja:</label>
            </span>

            <Dropdown id="fuel" v-model="carSpec.selectedFuel" :options="fuelOptions" optionLabel="name" class="p-mt-3"
              optionValue="name" required placeholder="Wybierz rodzaj paliwa" :showClear="true" scrollHeight="60vh" />
            
            <span class="p-float-label p-mt-4">
              <InputText id="VIN" maxlength="17" v-model="carSpec.VIN" required />
              <label for="VIN">VIN:</label>
            </span>
          </div>

          <div class="extraInformation p-d-flex p-flex-column">
            <h3 class="p-mb-3 p-mt-6 p-mt-md-0">Dodatkowe informacje: </h3>
            <h4>Silnik:</h4>
            <div class="p-d-flex p-flex-column p-flex-sm-row p-mt-3">
              <span class="p-float-label">
                <InputText id="engineCapacity" v-model="carSpec.engineCapacity" style="width:140px" />
                <label for="engineCapacity">Pojemność[cm<sup>3</sup>]:</label>
              </span>
              <span class="p-float-label p-my-3 p-my-sm-0 p-mx-sm-1">
                <InputText id="enginePower" v-model="carSpec.enginePower" style="width:100px" />
                <label for="enginePower">Moc[KM]:</label>
              </span>
              <span class="p-float-label">
                <InputText id="engineCode" v-model="carSpec.engineCode" style="width:100px" />
                <label for="engineCode">Kod silnika:</label>
              </span>
            </div>

            <label for="transmission" class="p-mt-2 p-mb-1">Rodzaj skrzyni:</label>
            <Dropdown id="transmission" v-model="carSpec.selectedTransmission" :options="gearboxOptions"
              optionLabel="name" optionValue="name" required placeholder="Wybierz rodzaj skrzyni" :showClear="true"
              scrollHeight="60vh" />

            <label for="drivetrain" class="p-mt-2 p-mb-1">Rodzaj napędu:</label>
            <Dropdown id="drivetrain" v-model="carSpec.selectedDriveTrain" :options="drivetrainOptions"
              optionLabel="name" optionValue="name" required placeholder="Wybierz rodzaj napędu" :showClear="true"
              scrollHeight="60vh" />

            <span class="p-float-label p-mt-4">
              <InputText id="numberPlates" minlength="7" maxlength="9" v-model="carSpec.numberPlates" />
              <label for="numberPlates">Tablica rejestracyjna:</label>
            </span>
            <span class="p-float-label p-mt-4">
              <InputText id="mileage" maxlength="7" v-model="carSpec.mileage" />
              <label for="mileage">Przebieg:</label>
            </span>

          </div>
        </div>
        <label for="Textarea">
          <h3 class="p-mt-3 p-mb-1 p-text-center">Więcej informacji:</h3>
        </label>
        <Editor id="Textarea" v-model="carSpec.description" class="p-mx-auto p-mb-6">
          <template #toolbar>
            <span class="ql-formats">
              <button class="ql-bold"></button>
              <button class="ql-italic"></button>
              <button class="ql-underline"></button>
              <button class="ql-list" value="bullet"></button>
              <button class="ql-link"></button>
            </span>
          </template>
        </Editor>
      </form>
    </template>
    <template #footer>
      <div class="p-d-flex p-flex-column p-flex-sm-row p-jc-center">
        <Button class="p-button-success p-m-2" @click="validateData"
          :label="$route.path.indexOf('edytuj') > 0 ? `Aktualizuj dane pojazdu` : `Dodaj pojazd`" icon="pi pi-plus"/>
        <Button class="p-button-danger p-m-2" @click="clearForm()" label="Wyczyść formularz" icon="pi pi-trash"/>
      </div>
    </template>
  </Card>
</div>
  
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import Dropdown from 'primevue/dropdown'
import Editor from 'primevue/editor'

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
    engineCapacity: null,
    enginePower: null,
    engineCode: null,
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

    function validateData() {
      document.querySelectorAll('.p-invalid').forEach(input => input.classList.remove('p-invalid'))

      if(!phoneNum.value || !validPhoneNum(phoneNum.value)) document.querySelector('#phoneNum').classList.add('p-invalid')
      if(!carSpec.selectedBrand) document.querySelector('#brand').classList.add('p-invalid')
      if(!carSpec.selectedModel) document.querySelector('#model').classList.add('p-invalid')
      if(!carSpec.selectedFuel) document.querySelector('#fuel').classList.add('p-invalid')
      if(!carSpec.VIN || !validateVIN(carSpec.VIN)) document.querySelector('#VIN').classList.add('p-invalid')
      

      let checkForInvalids = document.querySelectorAll('.p-invalid')

      let convertedMileage = carSpec.mileage ? carSpec.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''

      if (checkForInvalids.length == 0) {

        let preparedData = []
        let timeStamp = getTime()
        let ID = (store.state.targetCar && store.state.targetCar['Tel']) == phoneNum.value ? store.state.targetCar['id'] : Date.now()
        let validVIN = validateVIN(carSpec.VIN)
 
        preparedData[validVIN] = {
          id: ID,

          Tel: validPhoneNum(phoneNum.value),
          Marka: betterLooking(carSpec.selectedBrand),
          Model: carSpec.selectedModel,
          Wersja_Rocznik: carSpec.selectedVersion.trim(),
          Paliwo: carSpec.selectedFuel,

          Silnik_Pojemnosc: onlyNumbers(carSpec.engineCapacity) || '',
          Silnik_Moc: onlyNumbers(carSpec.enginePower) || '',
          Silnik_Kod: carSpec.engineCode.trim() || '',
          SkrzyniaBiegow: carSpec.selectedTransmission || '',
          Naped: carSpec.selectedDriveTrain || '',
          Numer_rejestracyjny: carSpec.numberPlates?.toUpperCase().trim() || '',
          VIN: validVIN,
          Przebieg: convertedMileage || "",

          Opis: carSpec.description || "",
          Ostatnia_Aktualizacja: (store.state.targetCar && store.state.targetCar['Ostatnia_Aktualizacja']) || timeStamp,

        }
        sendDataToFirebase(preparedData)

      } else toast.add({severity:'warn', summary: 'Błędne danych', detail:'Popraw wszystkie zaznaczone pola!', life: 4000})
    }

    function onlyNumbers(input) {
      let result = input.replace(/[^0-9]+/g, '');
      return result
   } 


    function sendDataToFirebase(preparedData) {
      let Tel = Object.values(preparedData)[0].Tel

      const docReference = tickets.doc(Tel)

      docReference.get().then(function (doc) {

        if (!doc.exists) {
          toast.add({severity:'error', summary: 'Brak klienta', detail:'W pierwszej kolejności dodaj dane klienta, następnie pojazdu.', life: 4000})
          clearTimeout(checkOffline.value)
          return
        } else {
          if (checkIfVINexists(doc.data(), preparedData) && route.path.indexOf('edytuj') <= 0) {
            toast.add({severity:'warn', summary: 'Pojazd już istnieje', detail:'Pojazd o podanym numerze VIN jest już przypisany do danego klienta!', life: 4000})
            clearTimeout(checkOffline.value)
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
              clearTimeout(checkOffline.value)
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

      carSpec.engineCapacity = null
      carSpec.enginePower = null
      carSpec.engineCode = null
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

      carSpec.engineCapacity = fill['Silnik_Pojemnosc'] || ''
      carSpec.enginePower = fill['Silnik_Moc'] || ''
      carSpec.engineCode = fill['Silnik_Kod'] || ''
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
      Editor,
    }
  }
}
</script>

<style>
.p-editor-container{
  height: 250px; 
}

.relative{
  position: relative;
}
</style>