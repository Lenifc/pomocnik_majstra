<template>
    <div class="p-pt-6">
  <Card class="relative" style="max-width:800px; margin: 0 auto">
    <template #title>
      <h2>Dane kontaktowe</h2>
    </template>
    <template #content>
      <h3> {{ workshop.nazwaWarsztatu }} </h3>
      <div class="p-py-2"><i class="fa fa-phone p-pr-2"></i><a :href="`tel:${workshop.numerTelefonu}`">{{ workshop.numerTelefonu }}</a></div>
      <div class="p-py-2"><i class="far fa-envelope p-pr-2"></i><a :href="`mailto:${workshop.email}`">{{ workshop.email }}</a></div>
      <div class="p-pt-2 p-pb-1">
        <div><i class="fas fa-map-marker-alt p-pr-2"></i>{{ workshop.kodPocztowy }}, {{ workshop.miejscowosc }}</div>
        <div>{{ workshop.adres }}</div>
      </div>
      <div class="p-py-3">{{ workshop.stopka }}</div>
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d656.645943822638!2d18.5839007552518!3d54.38904288155409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46fd73bd51f21f8b%3A0x50c8a05c9778d809!2sWy%C5%BCsza%20Szko%C5%82a%20Bankowa%20w%20Gda%C5%84sku!5e0!3m2!1sen!2spl!4v1632657024122!5m2!1sen!2spl" style="border:0; width: 100%; height: 300px" allowfullscreen="" loading="lazy"></iframe>
      <!-- dodac innym razem -- nie ma teraz czasu na konfiguracje i wypisywanie godzin pracy kazdego dnia i pozniej sprawdzania  -->
      <!-- <div v-if="isOpen == 'true'">Warsztat otwarty</div>
      <div v-else>Warsztat jest obecnie zamknięty</div> -->
    </template>
    <template #footer>
     
    </template>
  </Card>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { reactive } from 'vue'
// import moment from 'moment-timezone'

export default {
setup(){
      // dane wypelnione domyslnie jakby nie bylo internetu lub wystapil blad danych to zawsze beda te jako domyslne
      let workshop = reactive({
          NIP: "999-555-13-37",
          adres: "ul. Samochodowa JP 2",
          email: "mechanik@warsztat.pl",
          kodPocztowy: "00-999",
          kontoBankowe: "01-2345-6789-0000-0000-1234-5678",
          miejscowosc: "Miasto",
          nazwaWarsztatu: "MECHANIK SAMOCHODOWY ZBIGNIEW S.",
          numerTelefonu: "100-500-001",
          stopka: "Warsztat czynny: Pon. - Pt. 8.00-16.00, Sob. 8.00-14.00"
      })



      const workshopInfo = firebase.firestore()
      .collection('warsztat')
      .doc('DaneDoFaktur')

      // const isOpen = (openTime, closeTime, timezone) => {
      //   const now = moment().tz(timezone)
      //   const storeOpenTime = moment.tz(openTime, "h:mmA", timezone)
      //   const storeCloseTime = moment.tz(closeTime, "h:mmA", timezone)

      //   return now.isBetween(storeOpenTime, storeCloseTime)
      // }
      // console.log(isOpen("8:00AM", "11:45PM", "Europe/Warsaw"))

      workshopInfo.get().then(show => {
          workshop = show.data()
          workshop.stopka = "Warsztat czynny: Pon. - Pt. 8.00-18.00, Sob. 8.00-14.00" // skrocona wersja oryginalnej stopki
      })

  return{
    workshop,
  }
}
}
</script>

<style>

</style>