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
              <InputText id="phoneNum" v-model="phoneNum" v-if="phoneNumNotStored" v-tooltip.focus.bottom="'W przypadku zmiany numeru telefonu pojazd zostanie przeniesiony do innego klienta!'" />
              <label for="phoneNum">Numer telefonu</label>
            </span>

            <Dropdown v-model="carSpec.selectedBrand" :options="brands" optionLabel="brand" optionValue="brand"
              :filter="true" placeholder="Wybierz marke" :showClear="true" @change="fetchModels()"
              v-if="!manualBrandModelVersionInput" scrollHeight="60vh" id="brand" class="p-mt-3">
              <template #value="{value, placeholder}">
                  <!-- ten template odpowiada za aktualnie wybrany pojazd  -->
                <div v-if="value">
                  <span>{{betterLooking(value)}}</span>
                </div>
                <span v-else> {{placeholder}} </span>
              </template>  ten template odpowiada za wyswietlenie calej listy
              <template #option="slotProps">
                <div>
                  <span>{{betterLooking(slotProps.option.brand)}}</span>
                </div>
              </template>
            </Dropdown>


<!-- TYLKO DO DEBUGU I TESTOW E2E -->
            <!-- <select name="brand" required @change="fetchModels()" v-model="carSpec.selectedBrand"
          v-if="!manualBrandModelVersionInput && brands && brands.length">
          <option disabled selected value="">Wybierz marke</option>
          <option v-for="brand in brands" :key="brand" :value="brand.brand">{{ betterLooking(brand.brand) }}</option>
        </select> -->
<!-- TYLKO DO DEBUGU I TESTOW E2E -->


            <span class="p-float-label p-mt-4" v-if="manualBrandModelVersionInput">
              <InputText id="brand" v-if="manualBrandModelVersionInput"
                v-model="carSpec.selectedBrand" />
                <label for="brand">Wpisz marke pojazdu</label>
            </span>

            <Dropdown v-model="carSpec.selectedModel" :options="models" optionLabel="pl" optionValue="pl" class="p-mt-3"
              placeholder="Wybierz model" :filter="true" :showClear="true" @change="() => {fetchVersion(); fetchEngineCapacities()}" id="model"
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

<!-- TYLKO DO DEBUGU I TESTOW E2E -->
        <!-- <select name="model" @change="() => {fetchVersion(); fetchEngineCapacities()}" v-model="carSpec.selectedModel" :disabled="!models"
          v-if="!manualBrandModelVersionInput && !manualModelVersionInput" required>
          <option disabled selected value="">Wybierz model</option>
          <option v-for="model in models" :key="model" :value="replaceSpaces(model.pl)">{{ model.pl }}</option>
        </select> -->
<!-- TYLKO DO DEBUGU I TESTOW E2E -->


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

<!-- TYLKO DO DEBUGU I TESTOW E2E -->
      <!-- <select name="prod_year" v-model="carSpec.selectedVersion"
          v-if="!manualVersionInput && !manualBrandModelVersionInput && !manualModelVersionInput" :disabled="!versions">
          <option disabled selected value="">Wybierz generacje</option>
          <option v-for="version in versions" :key="version" :value="version">{{ version }}</option>
        </select> -->
<!-- TYLKO DO DEBUGU I TESTOW E2E -->


            <span class="p-float-label p-mt-4" v-if="(carSpec.selectedModel && manualVersionInput) || manualBrandModelVersionInput || manualModelVersionInput">
              <InputText id="prod_year" v-if="(carSpec.selectedModel && manualVersionInput) || manualBrandModelVersionInput || manualModelVersionInput"
                v-model="carSpec.selectedVersion" required/>
              <label for="prod_year">Rocznik:</label>
            </span>

            <Dropdown id="fuel" v-model="carSpec.selectedFuel" :options="fuelOptions" optionLabel="name" class="p-mt-3"
                      required placeholder="Wybierz rodzaj paliwa" :showClear="true" scrollHeight="60vh"  @change="fetchEngineCapacities()"/>
            
            <span class="p-float-label p-mt-4">
              <InputText id="VIN" maxlength="17" v-model="carSpec.VIN" required v-tooltip.focus.bottom="'17-znakowy numer identyfikacyjny'" />
              <label for="VIN">VIN:</label>
            </span>
            <a class="p-button-text p-link" target="_blank" rel="noreferrer" v-if="carSpec.VIN && validateVIN(carSpec.VIN)"
              :href="`https://pl.vindecoder.pl/${carSpec.VIN}`" style="width:250px">Sprawdź dane pojazdu po nr VIN </a>
          </div>

          <div class="extraInformation p-d-flex p-flex-column">
            <h3 class="p-mb-3 p-mt-6 p-mt-md-0">Dodatkowe informacje: </h3>
            <h4>Silnik:</h4>
            <div class="p-d-flex p-flex-column p-flex-sm-row p-mt-3">
              <Dropdown v-model="carSpec.engineCapacity" :options="capacities" optionLabel="version"
              placeholder="Pojemność silnika" id="engineCapacity"
              v-if="carSpec.selectedBrand && carSpec.selectedModel && (capacities && capacities.length)"
              :disabled="!capacities" required scrollHeight="60vh" :showClear="true">
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
              <span class="p-float-label" v-if="!capacities?.length || !carSpec.selectedModel">
                <InputText id="engineCapacity" v-model="carSpec.engineCapacity" style="width:140px" />
                <label for="engineCapacity">Pojemność[cm<sup>3</sup>]:</label>
              </span>
              <span class="p-float-label p-my-4 p-my-sm-0 p-mx-sm-1">
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
              <InputText id="numberPlates" maxlength="9" v-model="carSpec.numberPlates" />
              <label for="numberPlates">Tablica rejestracyjna:</label>
            </span>
            <span class="p-float-label p-mt-4">
              <InputText id="mileage" maxlength="6" v-model="carSpec.mileage" />
              <label for="mileage">Przebieg:[km]</label>
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
  components:{
    Dropdown,
    Editor,
  },
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
    const capacities = ref()

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


    const vehicles = firebase.firestore()
      .collection('warsztat')
      .doc('Pojazdy').collection("VIN")

    const clients = firebase.firestore()
      .collection('warsztat')
      .doc('Klienci').collection('Numery')

    const counterPath = firebase.firestore()
      .collection('warsztat')
      .doc('Pojazdy')

    const fuelOptions = [
      {name: 'Benzyna', value: 'petrol'},
      {name: 'Benzyna LPG', value: 'petrol-lpg'},
      {name: 'Diesel', value: 'diesel'},
      {name: 'Elektryczny', value: 'electric'},
      {name: 'Hybryda', value: 'hybrid'}
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
    async function fetchEngineCapacities() {
      carSpec.engineCapacity = null

      if(carSpec.selectedModel !== null && carSpec.selectedBrand !== null){

      const data = await axios.get(`${link}/pojemnoscSilnika/${carSpec.selectedBrand}/${replaceSpaces(carSpec.selectedModel)}${carSpec.selectedFuel ? '?fuel_type='+carSpec.selectedFuel.value : ''}`)
        .catch(() => {
          capacities.value = null
          toast.add({severity:'warn', summary: 'Brak danych', detail:'Nie uda się pobrać dostępnych pojemności silnika dla tego modelu.', life: 4000})
        })
      // ?. jest jak if statement sprawdzajacy czy obiekt istnieje
      if(data?.data?.options) capacities.value = Object.entries(data?.data?.options).map(item => item[1].pl)
      }
    }

    function validateData() {
      document.querySelectorAll('.p-invalid').forEach(input => input.classList.remove('p-invalid'))

      if(phoneNum.value && !validPhoneNum(phoneNum.value)) document.querySelector('#phoneNum').classList.add('p-invalid')
      if(!carSpec.VIN || !validateVIN(carSpec.VIN)) document.querySelector('#VIN').classList.add('p-invalid')
      if(!carSpec.selectedBrand) document.querySelector('#brand').classList.add('p-invalid')
      if(!carSpec.selectedModel) document.querySelector('#model').classList.add('p-invalid')
      if(!carSpec?.selectedFuel?.name) document.querySelector('#fuel').classList.add('p-invalid')
      

      let checkForInvalids = document.querySelectorAll('.p-invalid')

      let convertedMileage = carSpec.mileage ? carSpec.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''

      if (checkForInvalids.length == 0) {

        let preparedData = []
        let timeStamp = getTime()
        let ID = Date.now()
        let validVIN = validateVIN(carSpec.VIN)
 
        preparedData = {
          id: ID,

          Tel: (phoneNum?.value?.trim() && validPhoneNum(phoneNum?.value)) ? validPhoneNum(phoneNum?.value) : '',
          Marka: betterLooking(carSpec.selectedBrand),
          Model: carSpec?.selectedModel,
          Wersja_Rocznik: carSpec?.selectedVersion?.trim() || '',
          Paliwo: carSpec?.selectedFuel || {name: '', value: ''},

          Silnik_Pojemnosc: carSpec?.engineCapacity ? onlyNumbers(carSpec?.engineCapacity) : '',
          Silnik_Moc: carSpec.enginePower ? onlyNumbers(carSpec.enginePower) : '',
          Silnik_Kod: carSpec.engineCode?.trim() || '',
          SkrzyniaBiegow: carSpec.selectedTransmission || '',
          Naped: carSpec.selectedDriveTrain || '',
          Numer_rejestracyjny: carSpec.numberPlates?.toUpperCase()?.trim() || '',
          VIN: validVIN,
          Przebieg: convertedMileage || "",

          Opis: carSpec.description || "",
          Ostatnia_Aktualizacja: (store.state.targetCar && store.state.targetCar['Ostatnia_Aktualizacja']) || timeStamp,

        }
        sendDataToFirebase(preparedData)

      } else toast.add({severity:'warn', summary: 'Błędne dane', detail:'Popraw wszystkie zaznaczone pola!', life: 4000})
    }

    function onlyNumbers(input) {
      return String(input).replace(/[^0-9]+/g, '') // funkcja replace nie dziala dla cyfr - czyli w przypadku poprawnego wypelnienie program wyrzuci blad
   } 

      async function checkIfNumberExists(tel){
        let check = await clients.doc(tel).get()
        if(check.exists) {
          toast.add({severity:'success', detail:`Przypisano pojazd do klienta: ${tel}`, life: 4000})
          return 'OK'
        }
        else {
          toast.add({severity:'warn', summary: 'Brak danych klienta', detail:`Aby przypisać pojazd do numeru ${tel} uzupełnij najpierw dane klienta lub dodaj pojazd bez przypisania.`, life: 8000})
          document.querySelector('#phoneNum').classList.add('p-invalid')
        }
      }

     async function sendDataToFirebase(preparedData) {
      let VIN = preparedData.VIN

      if(preparedData.Tel) if(await checkIfNumberExists(preparedData.Tel) != 'OK') return

      const docReference = vehicles.doc(VIN)

       docReference.get().then(function (doc) {

        if (!doc.exists) {
            docReference.set({...preparedData, Ostatnia_Aktualizacja: getTime()}).then(() => {
              toast.removeAllGroups()
              toast.add({severity:'success', summary: 'Dodano pojazd', detail:`Dodano nowy pojazd do bazy: ${VIN}`, life: 4000})
              clearTimeout(checkOffline.value)
            })
            .catch(err => {
              toast.removeAllGroups()
              toast.add({severity:'error', summary: 'Błąd danych', detail: err.message, life: 4000})
              clearTimeout(checkOffline.value)
            })
        } else {
          // ZROBIC
          if (route.path.indexOf('edytuj') <= 0) {
            toast.add({severity:'warn', summary: 'Pojazd już istnieje', detail:'Pojazd o podanym numerze VIN jest już w bazie pojazdów!', life: 4000})
            clearTimeout(checkOffline.value)
            return
          } else{
            docReference.update({...preparedData, Ostatnia_Aktualizacja: getTime()}).then(() => {
              toast.removeAllGroups()
              toast.add({severity:'success', summary: 'Aktualizacja danych', detail:`Pomyślnie zaktualzowano dane pojazdu o numerze VIN: ${VIN}`, life: 4000})
              clearTimeout(checkOffline.value)
            })
            .catch(err => {
              toast.removeAllGroups()
              toast.add({severity:'error', summary: 'Błąd danych', detail: err.message, life: 4000})
              clearTimeout(checkOffline.value)
            })
          }
        }

        checkOffline.value = setTimeout(() => {
        toast.add({severity:'warn', summary: 'Status offline', detail:'Klient jest offline.\n Dane zostaną zaktualizowane po przywróceniu połączenia.', life: 0})
      }, 2500)

        if(route.path.indexOf('edytuj') < 0) counterPath.update("Pojazdy", firebase.firestore.FieldValue.increment(1))
        manualVersionInput.value = false
        clearForm()
        router.go(-1)
        store.commit('setTargetCar', '')
      })
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

      phoneNum.value = fill?.['Tel'] || store.state?.targetClient?.Tel || ''
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

    watch(() => carSpec.selectedBrand, () =>{
      if(carSpec.selectedBrand == 'other') manualBrandModelVersionInput.value = true
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
      fetchEngineCapacities,
      capacities,
      validateVIN,

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