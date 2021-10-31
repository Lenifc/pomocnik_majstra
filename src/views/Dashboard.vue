<template>
  <div class="home">
    <div class="p-d-flex p-flex-row p-jc-center p-ai-center p-py-5">
      <div style="width: min(150px, 25vw)">
        <img alt="Logo" src="../assets/logo.svg" style="width: 100%; filter: invert(100%)">
      </div>
      <div><h1>{{ workshopName }}</h1></div>
    </div>

    <Card>
      <template #header>
        <div class="p-text-center p-py-2">Obecnie zalogowany: <span class="p-text-bold">{{currentUserName.displayName || currentUserName.email || currentUserName.phoneNumber}}</span></div>
        <h2 class="p-text-center p-py-0 p-py-sm-2">Podsumowanie danych</h2>
      </template>
      <template #content>
        <div class="p-d-flex p-flex-column p-flex-sm-row p-jc-center p-ai-center">
          <div v-if="counterClients" class="p-d-flex p-flex-column p-py-1 p-py-sm-0 p-pr-0 p-pr-sm-4">
            <h3>Zlecenia: <span> {{counterTickets.IloscZlecen}} </span></h3>
            <div>Oczekujące: <span>{{counterTickets.Wolne}}</span></div>
            <div>W trakcie realizacji: <span>{{counterTickets.Obecne}}</span></div>
            <div>Zakończone: <span>{{counterTickets.Zakonczone}}</span></div>
          </div>
          <div v-if="counterClients" class="p-d-flex p-flex-column">
            <div>Ilość klientów: <span>{{counterClients.Klienci}}</span></div>
            <div>Ilość pojazdów: <span>{{counterClients.Pojazdy}}</span></div>
            <!-- <div>Ilość opłaconych faktur: <span> // Do wykonania</span></div> -->
          </div>
        <ProgressSpinner animationDuration="0.5s" v-if="!counterClients" /> 
        </div>
      </template>
    </Card>

    <div class="p-d-flex p-flex-column p-jc-center">
      <h1 class="p-text-center p-pt-4">Historia zdarzeń</h1>
      <Button class="p-button-secondary p-mt-3" @click="getClientsFromFirebase('all')" label="Załaduj całą historię"
        v-if="!disableNextButton" :icon="(!logs || isLoading) ? 'pi pi-spin pi-spinner' : 'pi pi-download'" />
    </div>
    <DataTable :value="logs || []" responsiveLayout="stack" breakpoint="1150px" stripedRows :paginator="true" :rows="countActivityPages || 20"
      showGridlines v-model:filters="tableFilters" filterDisplay="menu" :loading="!logs || isLoading" class="p-my-5"
      dataKey="log.id">
      <template #header>
        <div class="p-d-flex p-jc-between p-flex-column p-flex-sm-row">
          <Button icon="pi pi-filter-slash" label="Wyczyść" class="p-button-outlined" @click="clearTableFilters()"
            v-tooltip.bottom="`Wyczyść filtry`" />
          <div class="p-my-3 p-my-sm-0 p-text-center">Wczytano {{ logs?.length }} ostatnich aktywności</div>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText placeholder="Wyszukaj..." v-model="searchValue" @keyup="showEvent($event)"
              v-tooltip.bottom="'Wyszukiwanie aktywuje się po podaniu 3 znaków'" />
          </span>
        </div>
      </template>
      <template #empty>
        Nie znaleziono szukanej frazy.
      </template>
      <template #loading>
        Pobieranie danych z serwera...
      </template>

      <Column field="id" header="ID" style="width:50px" class="p-text-center">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.id}}</div>
          </div>
        </template>
      </Column>
      <Column field="task" header="Rodzaj aktywności" class="p-text-center" style="width:100px">

      </Column>
      <Column field="target" header="Cel" class="p-text-center" style="width:130px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.target}}</div>
          </div>
        </template>
      </Column>
      <Column field="message" header="Opis" class="p-text-center" style="width:125px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.message}}</div>
          </div>
        </template>
      </Column>
      <Column field="localTime" header="Czas zdarzenia" class="p-text-center" style="width:100px">
        <template #body="{data}">
          <div class="p-d-flex p-flex-column" @dblclick="copyValue($event)">
            <div class="pointer">{{data.localTime}}</div>
          </div>
        </template>
      </Column>
      <!-- tutaj dac porownanie co sie zmienilo -->
      <Column header="Zmiany" class="p-text-center" style="width:330px">
        <template #body="{data}">
          <div @click.once="() => { $toast.removeAllGroups()
                $toast.add({ severity: 'warn', detail: 'Szczegóły aktywności wyświetlane są w surowym formacie!', life: 6000 })}">

            <Fieldset v-if="data.task==='Modyfikacja danych'" legend="Szczegóły zmian" :toggleable="true" :collapsed="true" 
                      @click="console.log(JSON.parse(JSON.stringify(lookForChanges(data.previousData, data.newData, data.task))))">
              <pre v-html="prettyPrintJson.toHtml(lookForChanges(data.previousData, data.newData, data.task))"></pre>
              <!-- <div v-for="item in Object.entries(lookForChanges(data.previousData, data.newData, data.task))" :key="item">
                <div v-html="prettierOutput(item)"></div>
                <div v-for="test in item" :key="test">
                  <div v-html="typeof test == 'object' ? convertObject(test) : ''"></div>
                </div>
              </div> -->
            </Fieldset>

            <Fieldset v-if="data.task==='Utworzenie danych'" legend="Szczegóły zmian" :toggleable="true" :collapsed="true" 
                      @click="console.log(JSON.parse(JSON.stringify(data.newData)))">
              <pre v-html="prettyPrintJson.toHtml(data.newData)"></pre>
              <!-- <div v-for="item in Object.entries(data.newData)" :key="item">
                <div v-html="prettierOutput(item)"></div>
                <div v-for="test in item" :key="test">
                  <div v-html="typeof test == 'object' ? convertObject(test) : ''"></div>
                </div>
              </div> -->
            </Fieldset>

            <Fieldset v-if="data.task==='Usuwanie danych'" legend="Szczegóły zmian" :toggleable="true" :collapsed="true" 
                      @click="console.log(JSON.parse(JSON.stringify(data.previousData)))">
                <pre v-html="prettyPrintJson.toHtml(data.previousData)"></pre>
              <!-- <div v-for="item in Object.entries(data.previousData)" :key="item">
                <div v-html="prettierOutput(item)"></div>
                <div v-for="test in item" :key="test">
                  <div v-html="typeof test == 'object' ? convertObject(test) : ''"></div>
                </div>
              </div> -->
            </Fieldset>

          </div>
        </template>
      </Column>

    </DataTable>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { onMounted, reactive, ref } from '@vue/runtime-core'
import { prettyPrintJson } from 'pretty-print-json';

import { FilterMatchMode } from "primevue/api";
import copyToClipboard from '@/components/copyToClipboard.js'
import { useToast } from "primevue/usetoast"

import diff from '@/components/compareTwoArrays.js'
import ProgressSpinner from 'primevue/progressspinner';

export default {
  // wymagane dodanie console computed aby moc wywolywac konsole z poziomu template
  computed: {
    console: () => console,
    window: () => window,
  },
  components:{
    ProgressSpinner
  },
  setup(){
    const logs = ref('')
    const counterTickets = ref(0)
    const counterClients = ref(0)
    const workshopName = ref('')
    const currentUserName = ref('')
    const isLoading = ref(true)
    const searchValue = ref()
    const toast = useToast()
    const limit = ref(50)
    const disableNextButton = ref(false)
    const countActivityPages = ref()
    
    const MainPath = firebase.firestore().collection('logs')

    const tableFilters = reactive({ 'global': { value: '', matchMode: FilterMatchMode.CONTAINS }})
    const clearTableFilters = () => { tableFilters['global'].value = '' }

    function showEvent(e) {
       searchValue.value = e.target.value

       if (searchValue.value.trim().length > 2) tableFilters['global'].value = searchValue.value.trim()
       else tableFilters['global'].value = ''
     }

    async function copyValue(e) {
       const text = e.target?.innerText
       await copyToClipboard(text)
       toast.add({
         severity: 'info',
         summary: 'Wartość skopiowana',
         detail: `Wartość "${text}" została skopiowana do schowka`,
         life: 3000
       })
     }

     function convertObject(obj){
      let html = ``
      let proxyToObject = JSON.parse(JSON.stringify(obj)) // zamiana Proxy na Object

      for(let singleItem in proxyToObject){
        html += `
          <div class="p-py-1">
            ${singleItem}: <span>${proxyToObject[singleItem] == '' ? '-' : proxyToObject[singleItem]}</span>
          </div>`
      }

       return html
     }

     function lookForChanges(previousData, newData, type){
       let result
       if(type === "Modyfikacja danych") {
         result = diff(previousData, newData)
        //  console.log(diff(previousData, newData))
       }
       if(type === "Utworzenie danych") result = newData
       if(type === "Usuwanie danych") result = previousData

       return result
     }

     function prettierOutput(obj){
      //  console.log(obj[0], obj[1])
       return `<div class='p-py-1' style="color: ${typeof obj[1] == 'object' ? 'red' : ''}">${obj[0]}: <span>
              ${typeof obj[1] == 'object' ? '' : (obj[1] == '' ? '-' : obj[1])}
              </span></div>`
     }

     async function getClientsFromFirebase(req) {
       if (req == 'more') limit.value += 100

       let logsPath = MainPath
         .orderBy("id", "desc")
         .limit(limit.value)

       if (req == 'all') {
         logsPath = MainPath.orderBy("id", "desc")
         isLoading.value = true
       }

       let downloadedLogs = await logsPath.get()

       if (!downloadedLogs.docs.length) {
         disableNextButton.value = true
         toast.add({ severity: 'info', detail: 'Wczytano wszystkie aktywności', life: 4000 })
       }

       logs.value = downloadedLogs.docs.map(log => log.data())

       isLoading.value = false
       disableNextButton.value = false

       if (req == 'all' || downloadedLogs.docs.length < limit.value) {
         disableNextButton.value = true
         toast.removeAllGroups()
         toast.add({ severity: 'info', detail: 'Wczytano wszystkie aktywności', life: 4000 })
       }
     }

    const counterPathTickets = firebase.firestore().collection('warsztat').doc('zlecenia')
    const counterPathClients = firebase.firestore().collection('warsztat').doc('Klienci')
    const workshopDetails = firebase.firestore().collection('warsztat').doc('DaneDoFaktur')
    const auth = firebase.auth()

      onMounted(async() => {
        if(localStorage.getItem('nazwaWarsztatu')) workshopName.value = localStorage.getItem('nazwaWarsztatu')
        else workshopName.value = 'Warsztat'

        getClientsFromFirebase()
        const clientsResult = await counterPathClients.get()
        const ticketsResult = await counterPathTickets.get()
        const docs = await workshopDetails.get().catch(() => toast.add({severity:'error', summary: 'Odczyt danych', detail: 'Wystąpił błąd wczytywania danych', life: 5000}))
        localStorage.setItem('nazwaWarsztatu', docs?.data()?.nazwaWarsztatu)

        currentUserName.value = auth.currentUser.providerData[0]

        if(localStorage.getItem('countActivityPages')) countActivityPages.value = JSON.parse(localStorage.getItem('countActivityPages'))

        isLoading.value = false
        limit.value = 50

        // console.log(logs.value);
        counterClients.value = clientsResult.data()
        counterTickets.value = ticketsResult.data()
      })

    return{
      logs,
      counterTickets,
      counterClients,
      isLoading,
      clearTableFilters,
      tableFilters,
      searchValue,
      showEvent,
      copyValue,
      getClientsFromFirebase,
      disableNextButton,
      diff,
      ProgressSpinner,
      lookForChanges,
      convertObject,
      prettierOutput,
      countActivityPages,
      workshopName,
      currentUserName,

      prettyPrintJson,
    }
  }
}
</script>
