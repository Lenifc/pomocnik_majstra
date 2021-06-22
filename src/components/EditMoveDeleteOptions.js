
import { getTime } from '@/components/getCurrentTime'
import firebase from 'firebase/app'

//
// Usuwanie danych z kolekcji firebase
//
export async function DeleteFunc(id, docPath, phoneNumber, target, extraData) {
  // console.log(id, docPath, phoneNumber, target, extraData);

  const counterPathTickets = firebase.firestore().collection('warsztat').doc('zlecenia')
  const counterPathClients = firebase.firestore().collection('warsztat').doc('Klienci')

  const docReference = docPath.doc(phoneNumber)
  let ConfirmDelete

  await docReference.get().then(function () {
    if (id == 'client') {
      docReference.delete().catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
        .then(() => {
          counterPathClients.update("Klienci", firebase.firestore.FieldValue.increment(-1))
          if(target != 0) counterPathClients.update("Pojazdy", firebase.firestore.FieldValue.increment(-target)) 
          ConfirmDelete = true
        })
        .catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
      return ConfirmDelete
    }
    if (id == 'car') {
      delete extraData[`${target}`]

      extraData['Ostatnia_Aktualizacja'] = getTime()

      docReference.set({
          ...extraData
        }).catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
        .then(() => {
          counterPathClients.update("Pojazdy", firebase.firestore.FieldValue.increment(-1))
          ConfirmDelete = true
        })
        .catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
      return ConfirmDelete
    }
    if (id == 'ticket') {
      docReference.get().then(doc => {
        if (Object.keys(doc.data()).length - 1 == 1) {
          docReference.delete().then(() => {
        if (target != 'justRelocate') counterPathTickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
        if (docPath.id == 'wolne' && target != 'justRelocate') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(-1))
        if (docPath.id == 'obecne' && target != 'justRelocate') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(-1))
        if (docPath.id == 'zakonczone' && target != 'justRelocate') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(-1))
          }
          ).catch(err => {
            console.log(err.code, err.message)
          })
        } else {
          const timeStamp = getTime()

          // Jezeli w dokumencie znajduje sie kilka pojazdow to usuwam tylko pole z danym pojazdem
          docReference.update({
              [`${extraData}`]: firebase.firestore.FieldValue.delete(),
              timeStamp
            }).then(() => {
        if (target != 'justRelocate') counterPathTickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
        if (docPath.id == 'wolne' && target != 'justRelocate') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(-1))
        if (docPath.id == 'obecne' && target != 'justRelocate') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(-1))
        if (docPath.id == 'zakonczone' && target != 'justRelocate') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(-1))
            })
            .catch(err => {
              console.log(err.code, err.message)
            })
        }
      }).catch(err => {
        console.log(err.code, err.message)
      })
    }
  })
}

//
// Przenoszenie danych między kolekcjami
//
export function RelocateTicket(id, object, ticketsPath, currentDocPath, newDocPath, phoneNumber) {

  const counterPathTickets = firebase.firestore().collection('warsztat').doc('zlecenia')
  const docReference = ticketsPath.collection(newDocPath).doc(phoneNumber)
  const timeStamp = getTime()
  let ConfirmRelocate

  if (currentDocPath != newDocPath) {
    // console.log('CHECK', object);
  if(newDocPath == 'zakonczone') Object.values(object)[0]['Zakonczone_Czas'] = timeStamp

    docReference.get().then(function (doc) {
        if (doc.exists) {
          docReference.update({
              ...object,
              timeStamp
            }).catch(err => {
              console.log(err.code, err.message)
              ConfirmRelocate = false
            })
        } else {
          docReference.set({
              ...object,
              timeStamp
            }).catch(err => {
              console.log(err.code, err.message)
              ConfirmRelocate = false
            })
        }

      }).then(() => {
        if(currentDocPath == 'wolne') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(-1))
        if(currentDocPath == 'obecne') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(-1))
        if(currentDocPath == 'zakonczone') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(-1))
        if(newDocPath == 'wolne') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(1))
        if(newDocPath == 'obecne') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(1))
        if(newDocPath == 'zakonczone') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(1))
        ConfirmRelocate = true
        let deleteThis = ticketsPath.collection(currentDocPath)
        DeleteFunc(id, deleteThis, phoneNumber, 'justRelocate', ...Object.keys(object))
      })
      .catch(function (err) {
        console.log(err.code, err.message);
        ConfirmRelocate = false
      })
  } else {
    ConfirmRelocate = false
}
return ConfirmRelocate
}
