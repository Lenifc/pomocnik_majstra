<template>
        <ul class="workOrder">
          <li class="workOrderItem row align-center" v-for="(item, index) in items" :key="index" :id="item.id">
            <div class="column">
              <label for="">Towar / usługa</label>
              <input type="text" v-model="item.part_service_Name">
            </div>
            <div class="column">
              <label for="">Ilość</label>
              <input type="number" v-model="item.quantity" @change="recalculate(item)">
            </div>
            <div class="column">
              <label for="">Cena Netto[zł]</label>
              <input type="number" v-model="item.price_net" @change="recalculate(item)">
            </div>
            <div class="column">
              <label for="">Wartość Netto[zł]</label>
              <input type="number" v-model="item.totalCost_net" disabled>
            </div>
            <div class="column">
              <label for="">VAT [%]</label>
              <input type="number" v-model="item.tax" @change="recalculate(item)">
            </div>
            <div class="column">
              <label for="">Cena Brutto[zł]</label>
              <input type="number" v-model="item.price_gross" @change="recalculate(item)">
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
            <input name="service" type="text" v-model="part_service_Name">
          </div>
          <div class="column">
            <label for="quantity">Ilość</label>
            <input name="quantity" type="text" v-model="quantity">
          </div>
          <div class="column">
            <label for="priceNet">Cena Netto[zł]</label>
            <input name="priceNet" type="text" v-model="price_net">
          </div>
          <div class="column">
            <label for="totalNet">Wartość Netto[zł]</label>
            <input name="totalNet" type="text" v-model="totalCost_net" disabled>
          </div>
          <div class="column">
            <label for="tax">VAT [%]</label>
            <input name="tax" type="text" v-model="tax">
          </div>
          <div class="column">
            <label for="priceGross">Cena Brutto[zł]</label>
            <input name="priceGross" type="text" v-model="price_gross">
          </div>
          <div class="column">
            <label for="totalGross">Wartość Brutto[zł]</label>
            <input name="totalGross" type="text" v-model="totalCost_gross" disabled>
          </div>
          <div><i class="fa fa-plus" @click="addNewWO"></i></div>
        </li>
      </ul>
</template>

<script>
    import { ref, watch } from 'vue'
    export default {
      emits:['WOItems'],

      setup(props, {emit}) {

        const items = ref([])
        const part_service_Name = ref(null)
        const quantity = ref(1)
        const price_net = ref()
        const price_gross = ref()
        const tax = ref(23)
        const totalCost_net = ref(0)
        const totalCost_gross = ref(0)


        function clearInputs(){
          part_service_Name.value = null
          quantity.value = 1
          price_net.value = null
          price_gross.value = null
          tax.value = 23
          totalCost_net.value = 0
          totalCost_gross.value = 0
        }

        function addNewWO(){
          if(quantity.value && price_net.value){

            items.value.push({
              id: Date.now(),
              part_service_Name: part_service_Name.value,
              quantity: quantity.value,
              price_net: price_net.value,
              price_gross: price_gross.value,
              tax: tax.value,
              totalCost_net: totalCost_net.value.toFixed(2),
              totalCost_gross: totalCost_gross.value.toFixed(2)
            })

            clearInputs()
            emit('WOItems', items.value)
          }
        }

        function deleteWO(e){
          const target = e.target.parentElement.parentElement
          items.value = items.value.filter(item => item.id != target.id)
        }

        function recalculate(item) {
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
        watch(() => price_net.value, () => {
          price_gross.value = Number((Number(price_net.value)*(Number(tax.value)+100)/100).toFixed(2))
          if(quantity.value) { 
           totalCost_net.value = Number((Number(quantity.value) * Number(price_net.value)).toFixed(2))
           totalCost_gross.value = Number((Number(quantity.value) * Number(price_net.value) * ((Number(tax.value)+100)/100)).toFixed(2))
          }
        })
        watch(() => quantity.value, () => {
          if(price_net.value) totalCost_net.value = Number((Number(price_net.value) * Number(quantity.value)).toFixed(2))
          if(price_net.value) totalCost_gross.value = Number((Number(quantity.value) * Number(price_net.value) * ((Number(tax.value)+100)/100)).toFixed(2))
        })
        watch(() => tax.value, () => {
          if(quantity.value && price_net.value) {
            price_gross.value = Number((Number(price_net.value) * (Number(tax.value) +100)/100).toFixed(2))
            totalCost_net.value = Number((Number(quantity.value) * Number(price_net.value)).toFixed(2))
            totalCost_gross.value = Number((Number(quantity.value) * Number(price_net.value) * ((Number(tax.value)+100)/100)).toFixed(2))
        }
        })

        return {
          part_service_Name,
          quantity,
          price_net,
          price_gross,
          tax,
          totalCost_net,
          totalCost_gross,
          items,
          addNewWO,
          deleteWO,
          recalculate
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