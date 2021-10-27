<template>
  <div>
    <div class="p-d-flex p-jc-center p-ai-center p-pt-5">
      <vehicleReport /> 
       <!-- zamiast emitera zastosowano vuex, bo nie chcial sie emitowac przez 2 warswty, a szkoda mi czasu na diagnozy... -->
    </div>
    

    <div style="max-width:1100px" class="p-pb-4">
      <DataTable :value="items" dataKey="id" v-if="items.length" editMode="row" v-model:editingRows="editingRows"
        @rowEditInit="onRowEditInit" @rowEditCancel="onRowEditCancel" stripedRows showGridlines
        responsiveLayout="stack" breakpoint="950px"
        class="p-datatable-sm p-pt-4 p-text-center">
        <template #header>
          <div v-html="calcTotalCosts(items)"></div>
        </template>
        <Column style="width: 4%; min-width:3rem" class="p-text-center">
          <template #body="{index}">
            {{index+1}}
          </template>
        </Column>
        <Column field="part_service_Name" header="Nazwa:">
          <template #editor="slotProps">
            <InputText v-model="slotProps.data[slotProps.column.props.field]" />
          </template>
        </Column>
        <Column field="quantity" header="Ilość:">
          <template #editor="slotProps">
            <InputNumber class="quantityWOCurrent" id="quantityWOCurrent" prefix="x " v-model="slotProps.data[slotProps.column.props.field]" style="width:72px"
              @focusout="recalculateAlreadyAddedWO(slotProps.data)" />
          </template>
        </Column>
        <Column field="price_net" header="Netto[PLN]:">
          <template #editor="slotProps">
            <InputNumber id="price_netWOCurrent" mode="currency" currency="PLN" v-model="slotProps.data[slotProps.column.props.field]"
              style="width:100px" @focusout="recalculateAlreadyAddedWO(slotProps.data)" />
          </template>
        </Column>
        <Column field="totalCost_net" header="Netto całość[PLN]:" />

        <Column field="tax" header="Stawka VAT[%]:">
          <template #editor="slotProps">
            <InputNumber id="taxWOCurrent" suffix="%" v-model="slotProps.data[slotProps.column.props.field]" style="width:86px"
              @focusout="recalculateAlreadyAddedWO(slotProps.data)" />
          </template>
        </Column>
        <Column field="price_gross" header="Brutto[PLN]:" />
        <Column field="totalCost_gross" header="Brutto całość[PLN]:" />
        <Column header="Edytuj" :rowEditor="true" style="width: 5%; min-width:3.75rem" bodyStyle="text-align:center" />
        <Column header="Usuń" style="width: 5%; min-width:3.5rem" bodyStyle="text-align:center">
          <template #body={data}>
            <Button class="p-button-danger p-button-rounded" icon="pi pi-trash" @click="deleteWO(data)" />
          </template>
        </Column>
      </DataTable>
    </div>

      <div class="workOrder p-d-flex p-jc-center p-ai-center p-pt-3">
        <div class="workOrderItem p-d-flex p-flex-column p-flex-md-row align-center p-ai-center p-text-center p-flex-wrap ">
          <div class="p-d-flex p-flex-column p-mt-2 p-mt-md-0">
            <label class="p-pb-1" for="service">Towar / usługa</label>
            <InputText id="serviceWO" v-model="WO.part_service_Name" />
          </div>
          <div class="p-d-flex p-flex-column p-mt-2 p-mt-md-0">
            <label class="p-pb-1" for="quantity">Ilość</label>
            <InputNumber class="quantity" id="quantityWO" mode="decimal" prefix="x " v-model="WO.quantity"
              :maxFractionDigits="2" />
          </div>
          <div class=" p-d-flex p-flex-row ">
            <div class="p-d-flex p-flex-column p-mt-2 p-mt-md-0">
              <label class="p-pb-1" for="priceNet">Cena Netto</label>
              <InputNumber id="priceNetWO" mode="currency" currency="PLN" v-model="WO.price_net" />
            </div>
            <div class="p-d-flex p-flex-column p-mt-2 p-mt-md-0">
              <label class="p-pb-1" for="totalNet">Wartość Netto</label>
              <InputNumber id="totalNetWO" mode="currency" currency="PLN" v-model="WO.totalCost_net" disabled />
            </div>
          </div>
          <div class="p-d-flex p-flex-column p-mt-2 p-mt-md-0">
            <label class="p-pb-1" for="tax">Stawka VAT</label>
            <InputNumber id="taxWO" suffix="%" v-model="WO.tax" />
          </div>
          <!-- dodany dodatkowy div aby sie poprawnie wrapowalo kawalkami -->
          <div class=" p-d-flex p-flex-row">
          <div class="p-d-flex p-flex-column p-mt-2 p-mt-md-0">
            <label class="p-pb-1" for="priceGross">Cena Brutto</label>
            <InputNumber id="priceGrossWO" mode="currency" currency="PLN" v-model="WO.price_gross" disabled />
          </div>
          <div class="p-d-flex p-flex-column p-mt-2 p-mt-md-0">
            <label class="p-pb-1" for="totalGross">Wartość Brutto</label>
            <InputNumber id="totalGrossWO" mode="currency" currency="PLN" v-model="WO.totalCost_gross" disabled />
          </div>
          <div class="p-d-flex p-ai-end p-mb-2 p-ml-2 p-mt-2 p-mt-md-0"><i class="pi pi-plus-circle p-text-bold" style="fontSize: 1.66rem"
              @click="addNewWO"></i></div>
        </div>
          </div>
      </div>
    </div>

</template>

<script>

import { ref, watch, reactive, onMounted } from 'vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import vehicleReport from '@/components/vehicleReport.vue'
import { useToast } from "primevue/usetoast"

export default {
  props:['passedWO'],
  emits: ['WOItems'],
  components:{
    vehicleReport
  },

  setup(props, {emit}) {

    const items = ref([])
    const toast = useToast()

    const originalRows = ref({})
    const editingRows = ref([])

    const WO = reactive({
      part_service_Name: '',
      quantity: 1,
      price_net: null,
      price_gross: 0,
      tax: 23,
      totalCost_net: 0,
      totalCost_gross: 0,
    })

    const onRowEditInit = (event) => {
      originalRows.value[event.index] = {...items.value[event.index]}
    }
    const onRowEditCancel = (event) => {
      items.value[event.index] = originalRows.value[event.index]
    }

    function clearInputs() {
      WO.part_service_Name = ''
      WO.quantity = 1
      WO.price_net = null
      WO.price_gross = 0
      WO.tax = 23
      WO.totalCost_net = 0
      WO.totalCost_gross = 0
    }

    function addNewWO() {
      document.querySelectorAll('.p-invalid').forEach(input => input.classList.remove('p-invalid'))

      if(!WO.quantity || WO.quantity < 0) document.querySelector('#quantityWO').classList.add('p-invalid')
      if(!WO.part_service_Name) document.querySelector('#serviceWO').classList.add('p-invalid')
      if(!WO.price_net || WO.price_net < 0) document.querySelector('#priceNetWO').classList.add('p-invalid')
      let checkForInvalids = document.querySelectorAll('.p-invalid')

      if (checkForInvalids.length == 0) {

        items.value.push({
          id: Date.now(),
          part_service_Name: WO.part_service_Name || ' ',
          quantity: WO.quantity,
          price_net: WO.price_net,
          price_gross: WO.price_gross,
          tax: WO.tax || 0,
          totalCost_net: WO.totalCost_net.toFixed(2),
          totalCost_gross: WO.totalCost_gross.toFixed(2)
        })

        clearInputs()
        emit('WOItems', items.value)
      } else toast.add({severity:'warn', summary: 'Błędne dane', detail:'Popraw wszystkie zaznaczone pola!', life: 4000})
    }

    function deleteWO(data) {
      const target = data.id
      items.value = items.value.filter(item => item.id != target)
    }

    function recalculateAlreadyAddedWO(item) {
      item.price_gross = item.price_net
      item.totalCost_gross = item.price_net * item.quantity

      if (item.price_net && item.tax) {
        item.price_gross = Number((Number(item.price_net) * (Number(item.tax) + 100) / 100).toFixed(2))
      }
      if (item.quantity && item.price_net && item.tax) {
        item.totalCost_net = Number((Number(item.price_net) * Number(item.quantity)).toFixed(2))
        item.totalCost_gross = Number((Number(item.quantity) * Number(item.price_net) * ((Number(item.tax) + 100) / 100)).toFixed(2))
      }
    }

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

    onMounted(() =>{
      if(props?.passedWO?.length) items.value = props.passedWO
    })

    watch(() => props?.passedWO, () => {
      items.value = props.passedWO
    })

    watch(() => items.value, () => emit('WOItems', items.value))
    watch(() => WO.price_net, () => {
      WO.price_gross = Number((Number(WO.price_net) * (Number(WO.tax) + 100) / 100).toFixed(2))
      if (WO.quantity) {
        WO.totalCost_net = Number((Number(WO.quantity) * Number(WO.price_net)).toFixed(2))
        WO.totalCost_gross = Number((Number(WO.quantity) * Number(WO.price_net) * ((Number(WO.tax) + 100) / 100)).toFixed(2))
      }
    })
    watch(() => WO.quantity, () => {
      if (WO.price_net) WO.totalCost_net = Number((Number(WO.price_net) * Number(WO.quantity)).toFixed(2))
      if (WO.price_net) WO.totalCost_gross = Number((Number(WO.quantity) * Number(WO.price_net) * ((Number(WO.tax) + 100) / 100)).toFixed(2))
    })
    watch(() => WO.tax, () => {
      if (WO.quantity && WO.price_net) {
        WO.price_gross = Number((Number(WO.price_net) * (Number(WO.tax) + 100) / 100).toFixed(2))
        WO.totalCost_net = Number((Number(WO.quantity) * Number(WO.price_net)).toFixed(2))
        WO.totalCost_gross = Number((Number(WO.quantity) * Number(WO.price_net) * ((Number(WO.tax) + 100) / 100)).toFixed(2))
      }
    })

    return {
      WO,
      items,
      addNewWO,
      deleteWO,
      recalculateAlreadyAddedWO,
      calcTotalCosts,

      DataTable,
      Column,

      originalRows,
      editingRows,
      onRowEditInit,
      onRowEditCancel,
      vehicleReport,
    }
  }
} 
</script>

<style>
input:disabled{
  color:black;
  font-weight: bold;
  background-color: rgba(255,255,255,0.66);
}

.p-inputnumber-input{
  max-width: 110px;
}
.p-inputnumber-input#quantityWO, 
.p-inputnumber-input#quantityWOCurrent{
  max-width: 75px;
}
.p-inputnumber-input#taxWO, 
.p-inputnumber-input#taxWOCurrent{
  max-width: 90px;
}
.p-inputnumber-input#price_netWO, 
.p-inputnumber-input#price_netWOCurrent{
  max-width: 102px;
}

.border{
  border: 2px solid red;
}

</style>