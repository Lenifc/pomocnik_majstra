<template>
  <div class="">
    <Card class="p-d-flex p-flex-column p-ai-center p-mt-6 p-mx-auto" style="width:min(94%, 500px)">
      <template #title>
        <div class="p-text-center">Zaloguj do panelu zarządzania</div>
      </template>
      <template #content>
        <div class="p-d-flex p-flex-column p-flex-md-row p-jc-center p-ai-center p-mt-2">
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
            <Button label="Zaloguj" @click="$emit('login', credentials)" class="p-mb-4" />
            <Button label="Przypomnij hasło" class="p-button-text" />
          </div>
        </div>
        <!-- PÓŹNIEJ USUNĄĆ! -->
          <Button label="Temporary G-login" @click="$emit('OAuth')" class="p-button-help"/>
        <!-- PÓŹNIEJ USUNĄĆ! -->
      </template>
    </Card>
  </div>

</template>

<script>
import Card from 'primevue/card';
import Password from 'primevue/password';
import { reactive } from '@vue/reactivity';


export default {
  emits: ['login', 'OAuth'],
setup(){
  const credentials = reactive({
    username: null,
    pwd: null
  })

  return{
    Card,
    Password,

    credentials,
  }
}
}
</script>

<style>

</style>