<template>
<div>
  <div class="signedOut" v-if="!userSignedIn">
    <div class="container">
        <button class="btn signInBtn" @click="logInToAccount()">Zaloguj</button>
    </div>
</div>

<div class="signedIn" v-if="userSignedIn">
    <button class="btn signOutBtn" @click="logOutFromAccount()">Wyloguj</button>
    <div class="container">
        <div class="showElements">
          <h1 v-for="item in items" :key="item">{{ item }}</h1>
        </div>
        <button class="btn newDataBtn" @click="() => showForm = true">Dodaj nowe zgłoszenie</button>
        <div class="newDataDiv" v-if="showForm">
            <div class="closeForm" @click="() => showForm = false">&times;</div>
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

    </div>
</div>

</div>
</template>


<script>
import { ref, onMounted, watch } from 'vue'
import firebase from 'firebase/app'
import axios from 'axios'
require('firebase/auth')
require('firebase/firestore')
require('@/store/notifications.js')
require('@/store/notifications.css')

    const firebaseConfig = {
            apiKey: "AIzaSyCj7WjnSKdPZr7ima0GMz_0NwHB5AqP2xU",
            authDomain: "baza-mech.firebaseapp.com",
            databaseURL: "https://baza-mech.firebaseio.com",
            projectId: "baza-mech",
            storageBucket: "baza-mech.appspot.com",
            messagingSenderId: "413485233738",
            appId: "1:413485233738:web:0209efffbb22a6fab098b3"
        };

        firebase.initializeApp(firebaseConfig)

        
export default {
  setup() {
    let provider = new firebase.auth.GoogleAuthProvider();
    let auth = firebase.auth()

    let userSignedIn = ref()
    let items = ref()
    let showForm = ref(false)

    let phoneNum = ref()
    let VIN = ref()
    let milage = ref()
    let description = ref()

    let brands = ref()
    let selectedBrand = ref()
    let models = ref()
    let selectedModel = ref()
    let versions = ref()
    let selectedVersion = ref()

    const link = 'https://www.otomoto.pl/api/open/categories/29'


    async function fetchBrands() {

      try {
      //ten skurwialy cors...
      const data = await axios.get(`${link}/makes`)
      let allMakes = data.data.options
      brands.value = Object.keys(allMakes).sort((next, current) => next > current ? 1 : -1)
      } catch { err => console.log(err) }
    }
    async function fetchModels() {
      // Czyszczenie pozostalych zmiennych onChange
      versions.value = null
      selectedVersion.value = null
      models.value = null
      selectedModel.value = null

      try { 
      const data = await axios.get(`${link}/models/${selectedBrand.value}`)
      models.value = data.data.options
      } catch { err => console.log(err) }

    }
    async function fetchVersion() {
      // Czyszczenie pozostalych zmiennych onChange
      selectedVersion.value = null
      versions.value = null
      
      try {
        const data = await axios.get(`${link}/models/${selectedBrand.value}/versions/${selectedModel.value}`)
        versions.value = data.data.options
        console.log(data.data.options)
      } catch { (err) => console.log(err) }

    }

    // When fired it generate and show current date and time
    function refTime() {
      let time = new Date()
      let currTime = `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
      return currTime
    }


    // Log in with Google auth 
    function logInToAccount() {
      auth.signInWithPopup(provider).then(() => checkAuthStatus()).catch((error) => {
        console.log(error)
      })
    }

    function logOutFromAccount() {
      auth.signOut().then(() => checkAuthStatus()).catch((error) => {
        console.log(error)
      })
      //
      //  Podczas wylogowania DODAC czyszczenie wszystkich wartosci z pamieci
      //
    }

    function checkAuthStatus() {
      auth.onAuthStateChanged(user => {
        // console.log(user)
        if (user) {
          userSignedIn.value = true
          getDataFromFirebase()
        } else userSignedIn.value = false
        console.log("Zalogowany: " + userSignedIn.value);
      })
    }

    // Zbiera dane z bazy, nastepnie zapisuje je w zmiennej i wyswietla
    function getDataFromFirebase() { //user

      const storage = firebase.firestore()
      const collectionReference = storage.collection('pojazdy')

      // subscribe to database and listen for new data 
      // Show all phoneNumbers
      collectionReference.onSnapshot(snapshot => {
        items.value = snapshot.docs.map(doc => doc.id)
      })
    }

    function checkAndSendData(e) {
      e.preventDefault()


      const storage = firebase.firestore()
      const collectionReference = storage.collection('pojazdy')

    let convertedMilage = milage.value ? milage.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ''
    let temp_val = 0
    let valid

    if(!phoneNum.value) PopupFunc('error') 
    else if ((phoneNum.value.length == 9 || phoneNum.value.length == 7)) {
        if (phoneNum.value.length == 9) {
            temp_val = phoneNum.value
            phoneNum.value = temp_val.slice(0, 3) + "-" + temp_val.slice(3, 6) + "-" + temp_val.slice(6, 9);
        } //phoneNum = data.phoneNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "-")
        if (phoneNum.value.length == 7) {
            temp_val = phoneNum.value
            phoneNum.value = temp_val.slice(0, 3) + "-" + temp_val.slice(3, 5) + "-" + temp_val.slice(5, 8);
        }
        //validate only if phoneNumber length is 7 or 9
        valid = true
    } else {
        valid = false
    }
    

    if (valid && selectedBrand.value) {
        // const { serverTimestamp } = firebase.firestore.FieldValue;

        let preparedData = []
        // NaN array - id is name with time
        preparedData[`${selectedBrand.value} ${selectedModel.value} ${refTime()}`] = {
            // Dodane_Przez: user.displayName,
            Tel: phoneNum.value,
            Marka: betterLooking(selectedBrand.value),
            Model: selectedModel.value,
            Rok_prod: selectedVersion.value,
            VIN: VIN.value ? VIN.value.toUpperCase().trim() : "Brak danych",
            Przebieg: convertedMilage ? convertedMilage : "Brak danych",
            Opis: description.value ? description.value : "",
            Dodane_Czas: refTime()
        }
        console.log(preparedData)

        // collection - .add
        // doc - .set

        let docReference = collectionReference.doc(phoneNum.value);

        // check if it already exists
        docReference.get().then(function (doc) {
            if (doc.exists) {
                docReference.update({ ...preparedData })
                    .catch(err => console.log(err))
            } else {
                docReference.set({ ...preparedData })
                    .catch(err => console.log(err))
            }
        }).catch(function (error) {
            console.log("Error getting document:", error)
        })

        //Clear form and show proper popup message in left bottom corner
        PopupFunc('success')
        console.log('gitara');
        clearForm()
    } else {
      PopupFunc('error') // ten else dodaje mi powiadomienie podwojnie!
        console.log('mamy problem');
    }
    
    }

    function clearForm(){
    // phoneNum.value = null
    VIN.value = null
    milage.value = null
    description.value = null

    selectedBrand.value = null
    models.value = null
    selectedModel.value = null
    versions.value = null
    selectedVersion.value = null
    }



    function betterLooking(value){
      let temp = value
      temp = temp.replace('-', ' ')
      // Ponizszy zapis zamienia nam pierwsze litery (te po myslniku takze) na duze dla lepszej czytelnosci
      temp = temp.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
      value = temp.replace(' ', '-')
      // console.log(value)
      return value
    }


// Show proper popup message in left bottom corner
function PopupFunc(status) {
  let msg = ''
  // Clear classes every time to don't allow 2 classes at the same time

  if (status == 'error') msg = '⚠️ Ełoł, sprafć danie ⚠️'
  if (status == 'success') msg = 'Danie dodanie 👌'

  const myNotification = window.createNotification({
    closeOnClick: true,

    // displays close button
    displayCloseButton: false,
    positionClass: 'nfc-bottom-right',
    showDuration: 5000,

    // success, info, warning, error, and none
    theme: status
  })
  myNotification({
    title: status,
    message: msg,
  })

}


    function replaceSpaces(value) {
      value = value.replace(" ", "-")
      return value.replace(/[!@#$%^&*(){}<>?.;+_]/g, '')
    }

    onMounted(() => {
      checkAuthStatus()
      fetchBrands()
    })

    watch(phoneNum, (newVal, oldVal) => {
      console.log(newVal.length)
      if (newVal.length > 9) return phoneNum.value = oldVal
    })

    return {
      provider,
      auth,

      logInToAccount,
      logOutFromAccount,

      userSignedIn,

      getDataFromFirebase,
      checkAndSendData,
      
      items,
      showForm,
      phoneNum,
      VIN, 
      milage,
      description,

      fetchModels,
      fetchVersion,

      brands,
      models,
      versions,
      selectedBrand,
      selectedModel,
      selectedVersion,

      replaceSpaces,
      betterLooking,
    }
  },

}

//
//
// https://vuejsexamples.com/
//
//



// // Reacts only on H1 click and download details of only clicked data ( e.target)
// showElements.addEventListener('click', (e) =>{

//     if (e.target.tagName == 'H1' && e.target.innerText) {
//         showDataDiv.classList.add('opened')
//          firebase.firestore().collection('pojazdy').doc(e.target.innerText)
//             .get().then(showData => showNumberDetails(showData.data()))
//     } else return
// })


// function showNumberDetails(data) {
//     showDataList.innerHTML = ''
//     let template = ''

//     // draw all cars assigned to this phoneNumber
//     for (let key in data) {
//         // console.log(data[key])
//         template += `<li id="${data[key].Marka} ${data[key].Model} ${data[key].Dodane_Czas}">
//         <h1>${data[key].Marka} ${data[key].Model} ${data[key].Rok_prod}</h1>`

//             // sort elements that they will be always the same order
//         Object.entries(data[key]).sort((curr,prev) => curr[0] > prev[0] ? 1 : -1).map(obj => {
//             // console.log([obj[0], obj[1]])
//             template += `<div>${obj[0]}: <span> ${(obj[1] || 'Brak Danych')}</span></div>`
//         })
//         template += `<button class="btn btn-edit">Edytuj</button><button class="btn btn-done">Gotowe</button></li>`
//     }
//     showDataList.innerHTML = template
// }    

//     // add here edit & delete option(move to bin collection) & move to done collection
// showDataList.addEventListener('click', (e =>{
//     e.target.classList.contains('btn-edit') ? console.log(e.target.parentElement) : '' 
//     e.target.classList.contains('btn-done') ? console.log(e.target.parentElement) : '' 
//     }
// ))
</script>


<style>
*, *:before, *:after{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body{
    font-size: 16px;
    background-color: #202847;
    color: white;
    position: relative;
    font-family: Times
}

.container{
    margin: 0 auto;
    width: min(96%, 1200px);
    display: flex;
    justify-content: center;
}

.signedOut{
    padding: 64px;
}

.signedIn{
    height: 100vh;
    justify-content: center;
    align-content: center;

}


.btn{
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    box-shadow: 1px 1px 5px #555;
    font-size: 1.05rem;
}
.signOutBtn{
    position: fixed;
    top: 16px;
    right: 32px;
    font-size: 1.3rem;
}

.newDataDiv, 
.showDataDiv{
    display: block;
    position: fixed;
    top:0;
    left: 0;
    background-color: #eee;
    color: black;
    width: 100vw;
    height: 100vh;
}
.newDataDiv.opened,
.showDataDiv.opened{
    display: block;
}

.newDataForm{
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
}
.newDataForm > *{
    align-self: center;
}
.newDataForm input{
    padding: 4px;
    border: 1px solid gray;
    border-radius: 4px;
    box-shadow: none;
}

.closeForm{
    position: fixed;
    top:0;
    right: 20px;
    font-size: 4rem;
}
.closeForm:hover,
.btn:hover{
    cursor: pointer;
}

.newDataBtn{
    position: fixed;
    top: 20px;
    left: 20px;
    font-size: 1.3rem;
}

.showElements{
    margin-top: 128px;
    width: min(90%, 1000px);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

h1:hover{
    cursor: pointer;
}
</style>
