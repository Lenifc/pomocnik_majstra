<template>
        <ul class="workOrder">
          <li class="workOrderItem row align-center" v-for="(item, index) in items" :key="index" :id="item.id">
            <div class="column">
              <label for="">Towar / usługa</label>
              <input type="text" v-model="item.part_service_Name">
            </div>
            <div class="column">
              <label for="">Ilość</label>
              <input type="number" v-model="item.quantity" @change="recalculateAlreadyAddedWO(item)">
            </div>
            <div class="column">
              <label for="">Cena Netto[zł]</label>
              <input type="number" v-model="item.price_net" @change="recalculateAlreadyAddedWO(item)">
            </div>
            <div class="column">
              <label for="">Wartość Netto[zł]</label>
              <input type="number" v-model="item.totalCost_net" disabled>
            </div>
            <div class="column">
              <label for="">VAT [%]</label>
              <input type="number" v-model="item.tax" @change="recalculateAlreadyAddedWO(item)">
            </div>
            <div class="column">
              <label for="">Cena Brutto[zł]</label>
              <input type="number" v-model="item.price_gross" @change="recalculateAlreadyAddedWO(item)">
            </div>
            <div class="column">
              <label for="">Wartość Brutto[zł]</label>
              <input type="number" v-model="item.totalCost_gross" disabled>
            </div>
            <div><i class="fas fa-trash-alt" @click="deleteWO($event)"></i></div>
          </li>

        <li class="workOrderItem row align-center">
          <div class="column">
            <label for="service">Towar / usługa</label>
            <input name="service" type="text" v-model="WO.part_service_Name">
          </div>
          <div class="column">
            <label for="quantity">Ilość</label>
            <input name="quantity" type="text" v-model="WO.quantity">
          </div>
          <div class="column">
            <label for="priceNet">Cena Netto[zł]</label>
            <input name="priceNet" type="text" v-model="WO.price_net">
          </div>
          <div class="column">
            <label for="totalNet">Wartość Netto[zł]</label>
            <input name="totalNet" type="text" v-model="WO.totalCost_net" disabled>
          </div>
          <div class="column">
            <label for="tax">VAT [%]</label>
            <input name="tax" type="text" v-model="WO.tax">
          </div>
          <div class="column">
            <label for="priceGross">Cena Brutto[zł]</label>
            <input name="priceGross" type="text" v-model="WO.price_gross">
          </div>
          <div class="column">
            <label for="totalGross">Wartość Brutto[zł]</label>
            <input name="totalGross" type="text" v-model="WO.totalCost_gross" disabled>
          </div>
          <div><i class="fa fa-plus" @click="addNewWO"></i></div>
        </li>
      </ul>
</template>

<script>
    import { ref, watch, reactive } from 'vue'
    export default {
      emits:['WOItems'],

      setup(props, {emit}) {

        const items = ref([])

        const WO = reactive({
          part_service_Name: null,
          quantity: 1,
          price_net: null,
          price_gross: null,
          tax: 23,
          totalCost_net: 0,
          totalCost_gross: 0,
        })
        
        function clearInputs(){
          WO.part_service_Name = null
          WO.quantity = 1
          WO.price_net = null
          WO.price_gross = null
          WO.tax = 23
          WO.totalCost_net = 0
          WO.totalCost_gross = 0
        }

        function addNewWO(){
          if(WO.quantity && WO.price_net){

            items.value.push({
              id: Date.now(),
              part_service_Name: WO.part_service_Name,
              quantity: WO.quantity,
              price_net: WO.price_net,
              price_gross: WO.price_gross,
              tax: WO.tax,
              totalCost_net: WO.totalCost_net.toFixed(2),
              totalCost_gross: WO.totalCost_gross.toFixed(2)
            })

            clearInputs()
            emit('WOItems', items.value)
          }
        }

        function deleteWO(e){
          const target = e.target.parentElement.parentElement
          items.value = items.value.filter(item => item.id != target.id)
        }

        function recalculateAlreadyAddedWO(item) {
          item.price_gross = item.price_net
          item.totalCost_gross = item.price_net * item.quantity
          
          if(item.price_net && item.tax) {
            item.price_gross = Number((Number(item.price_net)*(Number(item.tax)+100)/100).toFixed(2))
          }
          if(item.quantity && item.price_net && item.tax){
            item.totalCost_net = Number((Number(item.price_net) * Number(item.quantity)).toFixed(2))
            item.totalCost_gross = Number((Number(item.quantity) * Number(item.price_net) * ((Number(item.tax)+100)/100)).toFixed(2))
          }
        }

        watch(() => items.value, () => emit('WOItems', items.value))
        watch(() => WO.price_net, () => {
          WO.price_gross = Number((Number(WO.price_net)*(Number(WO.tax)+100)/100).toFixed(2))
          if(WO.quantity) { 
           WO.totalCost_net = Number((Number(WO.quantity) * Number(WO.price_net)).toFixed(2))
           WO.totalCost_gross = Number((Number(WO.quantity) * Number(WO.price_net) * ((Number(WO.tax)+100)/100)).toFixed(2))
          }
        })
        watch(() => WO.quantity, () => {
          if(WO.price_net) WO.totalCost_net = Number((Number(WO.price_net) * Number(WO.quantity)).toFixed(2))
          if(WO.price_net) WO.totalCost_gross = Number((Number(WO.quantity) * Number(WO.price_net) * ((Number(WO.tax)+100)/100)).toFixed(2))
        })
        watch(() => WO.tax, () => {
          if(WO.quantity && WO.price_net) {
            WO.price_gross = Number((Number(WO.price_net) * (Number(WO.tax) +100)/100).toFixed(2))
            WO.totalCost_net = Number((Number(WO.quantity) * Number(WO.price_net)).toFixed(2))
            WO.totalCost_gross = Number((Number(WO.quantity) * Number(WO.price_net) * ((Number(WO.tax)+100)/100)).toFixed(2))
        }
        })

        return {
          WO,
          items,
          addNewWO,
          deleteWO,
          recalculateAlreadyAddedWO
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

</style>