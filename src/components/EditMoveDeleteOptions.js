import firebase from 'firebase/app'
import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'
const tickets = firebase.firestore()
  .collection('warsztat')
  .doc('zlecenia')

//
// Usuwanie danych z kolekcji firebase
//
export async function DeleteFunc(id, collectionPath, phoneNumber, showIfRelocate) {
  // console.log(id, collectionPath, phoneNumber);

  const collectionReference = tickets.collection(collectionPath)
  const docReference = collectionReference.doc(phoneNumber)

  
  await docReference.get().then(function (doc) {
    
    // Jezeli dany numer posiada tylko jeden pojazd to nie ma sensu pozostawiac pustego numeru, wiec usuwam caly dokument
    if (Object.keys(doc.data()).length - 1 == 1) {
      docReference.delete().then(
        PopupFunc('success', 'Pomyślnie usunięto zlecenie')
        ).catch(err => PopupFunc("error", err.message))
      } else {
        const timeStamp = getTime()
        
        // Jezeli w dokumencie znajduje sie kilka pojazdow to usuwam tylko pole z danym pojazdem
        docReference.update({
          [`${id}`]: firebase.firestore.FieldValue.delete(),
          timeStamp
        }).then( PopupFunc('success', 'Pomyślnie usunięto zlecenie'))
        .catch(err => PopupFunc("error", err.message))
    }
  }).then(() =>{
    if(showIfRelocate != 'justRelocate') tickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
  })
  .catch(err => PopupFunc("error", err.message))
}

export function RelocateTicket(id, object, currentCollectionPath, newCollectionPath, phoneNumber) {

  const collectionReference = tickets.collection(newCollectionPath)
  const docReference = collectionReference.doc(phoneNumber)
  const timeStamp = getTime()

  if (currentCollectionPath != newCollectionPath) {
    docReference.get().then(function (doc) {
        if (doc.exists) {
          docReference.update({
              ...object,
              timeStamp
            }).then(PopupFunc('success', `Do danego numeru dodano kolejny pojazd w zakładce ${newCollectionPath}`))
            .catch(err => PopupFunc("error", err.message))
        } else {
          docReference.set({
              ...object,
              timeStamp
            }).then(PopupFunc('success', `Pomyślnie przeniesiono zlecenie do ${newCollectionPath}`))
            .catch(err => PopupFunc("error", err.message))
        }

      }).then(DeleteFunc(id, currentCollectionPath, phoneNumber, 'justRelocate'))
      .catch(function (err) {
        PopupFunc("error", err.message)
      })
  } else PopupFunc("info", 'Nie można przenieść zlecenia do dokładnie tej samej lokalizacji...')
}