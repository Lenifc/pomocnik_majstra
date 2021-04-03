<template>
  <div class="newDataDiv">
            <router-link to="/">
              <div class="closeForm" @click="() => showForm = false">&times;</div>
            </router-link>
            <!-- tutaj dodac lewa strone screena z autowyszukiwaniem danych -->

            <!-- Podzielic screen na dwa, ponizej dac na prawa strone jaok reczne wypelnianie -->
            <form class="newDataForm">
                
                <label for="phoneNum">Number telefonu:</label>
                <input type="number" id="phoneNum" placeholder="123456789 / 1234567" required v-model="phoneNum">

                <label for="brand">Marka:</label>
                <select name="brand" required @change="fetchModels()" v-model="selectedBrand">
                    <option disabled selected value="">Wybierz marke</option>
                    <option v-for="brand in brands" :key="brand" :value="brand">{{ betterLooking(brand) }}</option>
                </select>

                <label for="model">Model:</label>
                <select name="model" @change="fetchVersion()" v-model="selectedModel" :disabled="!models">
                    <option disabled selected value="">Wybierz model</option>
                    <option v-for="model in models" :key="model" :value="replaceSpaces(model.pl)">{{ model.pl }}</option>
                </select>

                  <label for="prod_year">Generacja:</label>
                <select name="prod_year" v-model="selectedVersion" :disabled="!versions">
                    <option disabled selected value="">Wybierz generacje</option>
                    <option v-for="version in versions" :key="version" :value="version.pl">{{ version.pl }}</option>
                </select>
                

                <label for="VIN">VIN:</label><input type="text" maxlength="18" v-model="VIN">
                <label for="mileage">Przebieg:</label><input type="number" maxlength="7" v-model="milage">
                <textarea name="description" cols="50" rows="10" placeholder="Opis usterki" v-model="description"></textarea>
                <button class="btn addData" @click="checkAndSendData($event)">Dodaj</button>
            </form>
        </div>
</template>

<script>
export default {

}
</script>

<style>

</style>