<template>
  <div class="p-mt-6 p-mb-3 p-text-center">
    <Button v-if="!historyLoaded" label="Pobierz historię zleceń naprawy danego pojazdu" class="p-button-info"
      icon="pi pi-download" @click="fetchHistoryTicketsResults()" />
    <h3 v-if="historyLoaded">Historia zleceń naprawy danego pojazdu:</h3>
    <div v-if="ticketsHistory.length" class="p-text-left">
      <div v-for="ticket in ticketsHistory" :key="ticket" :id="ticket[0]">
        <Fieldset :legend="showName(ticket[0])" :toggleable="true" :collapsed="true" v-if="ticket[1].length"
          class="p-my-2">
          <div v-for="unique in ticket[1]" :key="unique.id" class="p-text-center" :id="ticket[0]">
            <Fieldset :legend="`Utworzone: ${unique['Dodane_Czas']}`" :toggleable="true" :collapsed="true"
              class="p-my-2">
              <div class="fieldset-data p-my-2">
                <div>ID zlecenia: <a class="p-text-bold"
                    :href="`/#/details/${ticket[0]}/${unique?.['Tel']}/${unique?.['id']}`">{{unique.id}}</a></div>
                <div>Status zlecenia: <span class="p-text-bold">{{showName(ticket[0])}}</span></div>
                <div>Przebieg: {{unique.Przebieg}} km</div>
                <div class="p-mt-2">Data utworzenia zlecenia: {{unique['Dodane_Czas']}}</div>
                <div v-if="unique['Zakonczone_Czas'] && ticket[0] == 'zakonczone'">Data zakończenia zlecenia:
                  {{unique['Zakonczone_Czas']}}</div>
              </div>

              <div v-if="unique['Wykonane_uslugi_czesci'].length">
                <div v-if="ticket[0] == 'wolne'">Zadania do wykonania:</div>
                <div v-if="ticket[0] == 'obecne'">Wykonywane zadania:</div>
                <div v-if="ticket[0] == 'zakonczone'">Zakończone zadania:</div>
                <DataTable :value="unique['Wykonane_uslugi_czesci']" responsiveLayout="scroll" stripedRows showGridlines
                  class="p-my-2 p-text-center p-datatable-sm" dataKey="id">
                  <template #header>
                    <div v-html="calcTotalCosts(unique['Wykonane_uslugi_czesci'])"></div>
                  </template>
                  <Column style="width:40px" class="p-text-center">
                    <template #body="{index}">
                      {{index+1}}
                    </template>
                  </Column>
                  <Column field="part_service_Name" header="Nazwa:" class="p-text-center">
                    <template #body="{data}">
                      <div class="p-text-left">
                        {{data['part_service_Name'] || ''}}
                      </div>
                    </template>
                  </Column>
                  <Column field="quantity" header="Ilość" />
                  <Column field="price_net" header="Cena Netto[PLN]:" />
                  <Column field="totalCost_net" header="Wartość Netto[PLN]:" />
                  <Column field="tax" header="Stawka VAT[%]:" />
                  <Column field="price_gross" header="Cena Brutto[PLN]:" />
                  <Column field="totalCost_gross" header="Wartość Brutto[PLN]:" />
                </DataTable>
              </div>
              <div v-if="!unique['Wykonane_uslugi_czesci'].length">To zlecenie nie posiada jeszcze wprowadzonych zadań
              </div>
            </Fieldset>
          </div>
        </Fieldset>
      </div>
    </div>
    <div v-if="!isAnyDataInHistory && historyLoaded">Pojazd nie został jeszcze ani razu zlecony przez danego klienta.
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from "primevue/usetoast"

import { callTicketsHistory } from '@/components/fetchTicketHistory.js'

export default {
  props:['VIN', 'Tel'],
setup(props) {

    const historyLoaded = ref(false)
    const isAnyDataInHistory = ref()
    const ticketsHistory = ref([])
    const toast = useToast()


    function calcTotalCosts(order) {
      let totalGross = 0
      let totalNet = 0
      order.forEach(item => {
        totalGross += Number(item['totalCost_gross'])
        totalNet += Number(item['totalCost_net'])
      })
      return `<div>Suma Brutto: <span style="color: var(--primary-color)">${totalGross.toFixed(2)} </span>PLN</div>
              <div>Suma Netto: <span style="color: var(--primary-color)" >${totalNet.toFixed(2)} </span>PLN</div>`
    }

    function showName(name) {
      if (name == 'wolne') return 'Nowe - oczekujące na realizację'
      if (name == 'obecne') return 'W trakcie realizacji'
      if (name == 'zakonczone') return 'Zakończone'
    }

    const fetchHistoryTicketsResults = async () => {
      const {VIN, Tel } = props

      let tryFetch = 0
      ticketsHistory.value = []
      ticketsHistory.value = await callTicketsHistory(VIN, Tel)
      // cos tutaj async await szwankuje, bo jeszcze nie odbiore danych,a on juz idzie z kolejnymi liniami kodu...
      let check
      // ponizej obejscie powyzszego problemu poprzez 3-krotne sprawdzenie po 500ms czy dane sie juz pobraly
      check = setInterval(() => {
        if (!ticketsHistory.value.length) {
          if (tryFetch > 3) {
            clearInterval(check)
            toast.removeAllGroups()
            toast.add({ severity: 'error', summary: 'Brak danych', detail: `Wystąpił problem z pobraniem historii dla danego pojazdu`, life: 6000
            })
          }
        } else {
          isAnyDataInHistory.value = ticketsHistory.value.some(ticket => ticket[1].length > 0) // sprawdzenie kazdej ze sciezek osobno
          historyLoaded.value = true
          if (isAnyDataInHistory.value) {
            toast.removeAllGroups()
            toast.add({ severity: 'info', summary: Tel, detail: `Wyświetlona jest historia tylko dla numeru: ${Tel}`, life: 6000
            })
            toast.add({ severity: 'info', detail: 'W przypadku pełnej historii użyj wyszukiwarki z menu po lewej stronie', life: 6000
            })
            console.log(Object.values(ticketsHistory.value))
          } else {
            toast.removeAllGroups()
            toast.add({ severity: 'warn', detail: 'Brak zleceń u danego klienta', life: 6000
            })
          }
          clearInterval(check)
        }
        tryFetch += 1
      }, 500)

    }

    return {
      calcTotalCosts,
      showName,
      fetchHistoryTicketsResults,

      DataTable,
      Column,

      historyLoaded,
      ticketsHistory,
      isAnyDataInHistory,
    }
}
}
</script>

<style>
.p-fieldset-content{
  padding: 3px!important;
}
</style>