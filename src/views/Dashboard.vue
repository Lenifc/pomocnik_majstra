<template>
  <div class="home">
    <div style="width: 200px">
      <img alt="Vue logo" src="../assets/logo.svg" style="width: 100%">
    </div>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  components: {
    HelloWorld
  }
}
</script>
