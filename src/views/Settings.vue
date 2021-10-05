<template>
  <div class="p-mt-5 p-d-flex p-flex-column p-flex-md-row p-jc-center p-ai-center" >
    <Card class="p-my-5 p-mx-0 p-mx-sm-4 p-px-4 p-py-4" style="max-width:600px">
      <template #header><h2 class="p-text-center p-py-2">Ustawienia aplikacji</h2></template>
      <template #content>
        <div>
          <h5 class="p-py-1">Domyślny motyw ciemny:</h5>
          <p style="color: red">Obecnie jest jedynie motyw ciemny!</p>
          <InputSwitch v-model="selectedDarkTheme" disabled />
          <h5 class="p-py-1">Menu boczne domyślnie schowane:</h5>
          <InputSwitch v-model="menuCollapsed" />
        </div>
        <div>
          <h5 class="p-py-1 p-pt-2">Ilość klientów na strone:</h5>
          <InputNumber v-model="countClientPages" mode="decimal" :min="5" :max="100" />
          <h5 class="p-py-1 p-pt-2">Ilość zleceń na strone:</h5>
          <InputNumber v-model="countTicketPages" mode="decimal" :min="5" :max="100" />
          <h5 class="p-py-1 p-pt-2">Ilość historii aktywności na strone:</h5>
          <InputNumber v-model="countActivityPages" mode="decimal" :min="5" :max="100" />
        </div>
      </template>
      <template #footer><Button label="Zapisz" @click="saveChanges"/></template>
    </Card>
    <Card class="p-my-5 p-px-2 p-px-sm-3 p-py-4">
      <template #header><h2 class="p-text-center p-py-2">Zgłoś błąd / Zaproponuj zmiany</h2></template>
      <template #content>
        <Editor id="Textarea" v-model="requestIssue" class="p-mx-auto p-mb-6">
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
      </template>
      <template #footer><Button label="Wyślij" @click="sendIssue"/></template>
    </Card>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { onMounted } from '@vue/runtime-core'
import InputSwitch from 'primevue/inputswitch'
import { useToast } from "primevue/usetoast"
import Editor from 'primevue/editor'


export default {
  components:{
    InputSwitch,
    Editor
  },
setup(){
    const toast = useToast()

    const selectedDarkTheme = ref(true)
    const countClientPages = ref(20)
    const countTicketPages = ref(20)
    const countActivityPages = ref(20)
    const menuCollapsed = ref(false)
    const requestIssue = ref('')

    function saveChanges(){
      localStorage.setItem('darkTheme', selectedDarkTheme.value)
      localStorage.setItem('menuCollapsed', menuCollapsed.value)
      localStorage.setItem('countClientPages', countClientPages.value)
      localStorage.setItem('countTicketPages', countTicketPages.value)
      localStorage.setItem('countActivityPages', countActivityPages.value)

      toast.add({severity:'success', detail: 'Zmiany zostały zapisane', life: 5000})
    }

    function sendIssue(){
      // do wykonania wyslanie maila...
      if(requestIssue.value.trim()) toast.add({severity:'info', detail: 'Błąd został zgłoszony do administratora', life: 6000})
    }


    onMounted(() =>{
    if(localStorage.getItem('darkTheme')) selectedDarkTheme.value = JSON.parse(localStorage.getItem('darkTheme'))
    else localStorage.setItem('darkTheme', selectedDarkTheme.value)

    if(localStorage.getItem('menuCollapsed')) menuCollapsed.value = JSON.parse(localStorage.getItem('menuCollapsed'))
    else localStorage.setItem('menuCollapsed', menuCollapsed.value)

    if(localStorage.getItem('countClientPages')) countClientPages.value = Number(localStorage.getItem('countClientPages'))
    else localStorage.setItem('countClientPages', countClientPages.value)

    if(localStorage.getItem('countTicketPages')) countTicketPages.value = Number(localStorage.getItem('countTicketPages'))
    else localStorage.setItem('countTicketPages', countTicketPages.value)

    if(localStorage.getItem('countActivityPages'))countActivityPages.value = Number(localStorage.getItem('countActivityPages'))
    else localStorage.setItem('countActivityPages', countActivityPages.value)

    })

  return{
    selectedDarkTheme,
    menuCollapsed,
    countClientPages,
    countTicketPages,
    countActivityPages,

    InputSwitch,
    saveChanges,

    Editor,
    requestIssue,
    sendIssue
    }
}
}
</script>

<style>
.p-editor-container{
  height: 200px; 
  min-width: 200px
}
</style>