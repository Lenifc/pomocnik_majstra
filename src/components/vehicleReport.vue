<template>
  <Fieldset legend="Protokół przyjęcia pojazdu" :toggleable="true" :collapsed="true" class="p-mb-3 p-text-center">
    <div class="p-d-flex p-flex-column p-flex-lg-row">
      <div style="max-width:500px">
        <div class="p-field p-col-9">
          <label for="reciveTime">Czas odbioru pojazdu od klienta: </label>
          <Calendar id="reciveTime" v-model="vehicleProtocol.reciveDate" :showTime="true" :showIcon="true" hourFormat="24" :showButtonBar="true"/>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="visualCheck" v-model="vehicleProtocol.visualChecked" :binary="true" />
            <label for="visualCheck">Wykonano oględziny nadwozia pojazdu podczas przyjęcia</label>
        </div>
        <div class="p-field" v-if="vehicleProtocol.visualChecked">
          <label for="visualCheckNote" class="p-mr-0 p-mr-lg-2">Uwagi do stanu wizualnego: </label>
          <InputText id="visualCheckNote" type="text" v-model="vehicleProtocol.visualCheckNote" />
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="testDriveBefore" v-model="vehicleProtocol.testDriveBefore" :binary="true" />
            <label for="testDriveBefore">Klient wyraził zgodę na jazdę próbną przed naprawą pojazdu</label>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="testDriveAfter" v-model="vehicleProtocol.testDriveAfter" :binary="true" />
            <label for="testDriveAfter">Klient wyraził zgodę na jazdę próbną po naprawie pojazdu</label>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="contactOnEveryChange" v-model="vehicleProtocol.contactOnEveryChange" :binary="true" />
            <label for="contactOnEveryChange">Klient chce być informowany o przebiegu naprawy</label>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="clientMaxBudget" v-model="vehicleProtocol.clientMaxBudget" :binary="true" />
            <label for="clientMaxBudget">Klient określił maksymalny budżet serwisu</label>
        </div>
        <div class="p-field" v-if="vehicleProtocol.clientMaxBudget">
          <label for="visualCheckNote" class="p-mr-0 p-mr-lg-2">Podaj limit budżetu [PLN]: </label>
          <InputText  id="clientMaxBudgetNote" type="text" v-model="vehicleProtocol.clientMaxBudgetNote" />
        </div>

          <!-- display="chip" -->
        <MultiSelect v-model="vehicleProtocol.selectedServiceReasons" :options="serviceReasons" optionLabel="value" placeholder="Powód oddania pojazdu" class="p-mt-2" scrollHeight="50vh"/>

      </div>
      <div class="p-pl-0 p-pl-lg-4 p-pt-3 p-pt-lg-0">
        <div class="p-field-checkbox">
            <Checkbox id="newPartsApprove" v-model="vehicleProtocol.newPartsApprove" :binary="true" />
            <label for="newPartsApprove">Klient wyraził zgodę na zakup części z ASO</label>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="usedPartsApprove" v-model="vehicleProtocol.usedPartsApprove" :binary="true" />
            <label for="usedPartsApprove">Klient wyraził zgodę na zakup części używanych</label>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="onlyOriginalParts" v-model="vehicleProtocol.onlyOriginalParts" :binary="true" />
            <label for="onlyOriginalParts">Klient wymaga TYLKO oryginalnych części</label>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="hqReplacementsApprove" v-model="vehicleProtocol.hqReplacementsApprove" :binary="true" />
            <label for="hqReplacementsApprove">Klient wyraził zgodę na zakup zamienników wysokiej jakości</label>
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="lqReplacementsApprove" v-model="vehicleProtocol.lqReplacementsApprove" :binary="true" />
            <label for="lqReplacementsApprove">Klient wyraził zgodę na zakup zamienników GORSZEJ jakości</label>
        </div>
        <div class="p-field">
          <label for="visualCheckNote" class="p-mr-0 p-mr-lg-2">Podaj aktualny stan licznika [km]: </label>
          <InputText id="currentMileage" type="number" v-model="vehicleProtocol.currentMileage" />
        </div>
        <div class="p-field-checkbox">
            <Checkbox id="otherInfo" v-model="vehicleProtocol.otherInfo" :binary="true" />
            <label for="otherInfo">Informacje dodatkowe</label>
        </div>
        <div class="p-float-label" v-if="vehicleProtocol.otherInfo">
          <InputText id="otherInfoTextarea" type="text" v-model="vehicleProtocol.otherInfoTextarea" placeholder="Opisz szczegóły"/>
        </div>
      </div>
    </div>
  </Fieldset>
</template>

<script>
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import MultiSelect from 'primevue/multiselect';

import { ref } from '@vue/reactivity';
import { onMounted, watch } from '@vue/runtime-core';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';


export default {
  components:{
    Calendar,
    Checkbox,
    MultiSelect,
  },
  setup(){
    const store = useStore()
    const route = useRoute()

    const serviceReasons = [
          {value: 'przegląd'},
          {value: 'diagnoza mechaniczna'},
          {value: 'diagoza komputerem diagnostycznym'},
          {value: 'serwis olejowy'},
          {value: 'serwis zawieszenia'},
          {value: 'serwis mechaniczny'},
          {value: 'serwis elektryki'},
          {value: 'inne'},
    ]
    // DODAC tez tutaj opisy - przyklad ponizej
    let vehicleProtocol = ref({
      reciveDate: '',
      // reciveDate_NOTE: 'Czas odbioru pojazdu od klienta:',
      visualChecked: false,
      visualCheckNote: '',
      testDriveBefore: '',
      testDriveAfter: '',
      contactOnEveryChange: '',
      newPartsApprove: '',
      usedPartsApprove: '',
      onlyOriginalParts: '',
      hqReplacementsApprove: '',
      lqReplacementsApprove: '',
      clientMaxBudget: '',
      clientMaxBudgetNote: '',
      currentMileage: '',
      otherInfo: '',
      otherInfoTextarea: '',
      selectedServiceReasons: '',
    })
    const test = ref([])


    watch(() => ({...vehicleProtocol.value}), () =>{
      store.commit('setProtocolData', JSON.parse(JSON.stringify(vehicleProtocol.value)))
    })


// ponizej 2 rozne sposoby przypisaania 
    onMounted( () => {
      if(store.state.fillProtocol && route.path.indexOf('dodaj') <= 0) vehicleProtocol.value = Object.assign({}, vehicleProtocol.value, JSON.parse(JSON.stringify(store.state.fillProtocol)))
    })
    watch(store.state.fillProtocol, () => {
      if(store.state.fillProtocol) vehicleProtocol.value = store.state.fillProtocol
    })

    return{
      Calendar,
      Checkbox,
      MultiSelect,

      serviceReasons,

      vehicleProtocol,
      test
    }
  }
}
</script>

<style>

</style>