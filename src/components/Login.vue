<template>
  <div class="">
    <Card class="p-d-flex p-flex-column p-ai-center p-mt-6 p-mx-auto relative" style="width:min(94%, 500px)">
      <template #title>
        <div v-if="!showPwdResetForm" class="p-text-center">Zaloguj do panelu zarządzania</div>
        <div v-else class="p-text-center">Wyślij link do zrestartowania hasła na podany adres email</div>
      </template>
      <template #content>
        <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center p-ai-center p-mt-2" v-if="!showPwdResetForm">
          <div class="inputs">
            <div class="p-d-flex p-flex-column">
              <span class="p-float-label">
                <InputText id="username" type="text" v-model="credentials.username" />  
                <label for="username">Email</label>
              </span>
              <span class="p-float-label p-mt-4">
                <Password id="pwd" v-model="credentials.pwd" :feedback="false" />
                <label for="pwd">Hasło</label>
              </span>
            </div>
          </div>
          <div class="buttons p-mt-4 p-mt-md-0 p-ml-0 p-ml-md-3 p-d-flex p-flex-column p-jc-between">
            <Button label="Zaloguj" icon="pi pi-sign-in" @click="$emit('login', credentials)" class="p-mb-4" />
            <Button label="Przypomnij hasło" class="p-button-text" @click="showPwdResetForm = true"/>
          </div>
        </div>
        <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center p-ai-center p-mt-2" v-if="showPwdResetForm">
           <div class="closeForm" style="font-size: 2.25rem" @click="showPwdResetForm = false">&times;</div>
            <span class="p-float-label">
              <InputText id="username" type="text" v-model="credentials.username" />
              <label for="username">Email</label>
            </span>
           <Button label="Przypomnij" @click="$emit('pwdReset', credentials.username)" class="p-mt-3 p-mt-md-0 p-ml-0 p-ml-md-2" />
        </div>
        <!-- PÓŹNIEJ USUNĄĆ! -->
          <Button icon="pi pi-google" label="Temporary G-login" @click="$emit('OAuth')" class="p-button-help p-mt-5"/>
        <!-- PÓŹNIEJ USUNĄĆ! -->
      </template>
    </Card>
  </div>

</template>

<script>
import Card from 'primevue/card';
import Password from 'primevue/password';
import { reactive, ref } from '@vue/reactivity';


export default {
  emits: ['login', 'OAuth', 'pwdReset'],
setup(){
  const credentials = reactive({
    username: null,
    pwd: null
  })
  const showPwdResetForm = ref(false)

  return{
    Card,
    Password,

    credentials,
    showPwdResetForm
  }
}
}
</script>

<style>

</style>