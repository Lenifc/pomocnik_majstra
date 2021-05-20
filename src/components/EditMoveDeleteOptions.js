
import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'
import firebase from 'firebase/app'

//
// Usuwanie danych z kolekcji firebase
//
export async function DeleteFunc(id, docPath, phoneNumber, target, extraData) {
  // console.log(id, docPath, phoneNumber, target, extraData);

  const counterPath = firebase.firestore().collection('warsztat').doc('zlecenia')

  const docReference = docPath.doc(phoneNumber)
  let ConfirmDelete

  await docReference.get().then(function () {
    if (id == 'client') {
      docReference.delete().then(
          PopupFunc('success', 'Klient został usunięty z bazy.')
        ).catch(err => {
          PopupFunc("error", err.message)
          ConfirmDelete = false
        })
        .then(() => {
          ConfirmDelete = true
        })
        .catch(err => {
          PopupFunc("error", err.message)
          ConfirmDelete = false
        })
      return ConfirmDelete
    }
    if (id == 'car') {

      delete extraData[`${target}`]

      extraData['Ostatnia_Aktualizacja'] = getTime()

      docReference.set({
          ...extraData
        }).then(
          PopupFunc('success', 'Pojazd został usunięty z bazy')
        ).catch(err => {
          PopupFunc("error", err.message)
          ConfirmDelete = false
        })
        .then(() => {
          ConfirmDelete = true
        })
        .catch(err => {
          PopupFunc("error", err.message)
          ConfirmDelete = false
        })
      return ConfirmDelete
    }
    if (id == 'ticket') {
      docReference.get().then(doc => {
        if (Object.keys(doc.data()).length - 1 == 1) {
          docReference.delete().then(
            PopupFunc('success', 'Pomyślnie usunięto zlecenie')
          ).catch(err => PopupFunc("error", err.message))
        } else {
          const timeStamp = getTime()

          // Jezeli w dokumencie znajduje sie kilka pojazdow to usuwam tylko pole z danym pojazdem
          docReference.update({
              [`${extraData}`]: firebase.firestore.FieldValue.delete(),
              timeStamp
            }).then(PopupFunc('success', 'Pomyślnie usunięto zlecenie'))
            .catch(err => PopupFunc("error", err.message))
        }
      }).catch(err => PopupFunc("error", err.message))
    }
    if (id == 'ticket' && target != 'justRelocate') counterPath.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
  })
}


//
// Przenoszenie danych między kolekcjami
//
export function RelocateTicket(id, object, ticketsPath, currentdocPath, newdocPath, phoneNumber) {

  const docReference = ticketsPath.collection(newdocPath).doc(phoneNumber)
  const timeStamp = getTime()
  let ConfirmRelocate

  if (currentdocPath != newdocPath) {
    docReference.get().then(function (doc) {
        if (doc.exists) {
          docReference.update({
              ...object,
              timeStamp
            }).then(PopupFunc('success', `Do danego numeru dodano kolejny pojazd w zakładce ${newdocPath}`))
            .catch(err => {
              PopupFunc("error", err.message)
              ConfirmRelocate = false
            })
        } else {
          docReference.set({
              ...object,
              timeStamp
            }).then(PopupFunc('success', `Pomyślnie przeniesiono zlecenie do ${newdocPath}`))
            .catch(err => {
              PopupFunc("error", err.message)
              ConfirmRelocate = false
            })
        }

      }).then( () => {
        ConfirmRelocate = true
        let deleteThis = ticketsPath.collection(currentdocPath)
        DeleteFunc(id, deleteThis, phoneNumber, 'justRelocate', ...Object.keys(object))
      })
      .catch(function (err) {
        PopupFunc("error", err.message)
        ConfirmRelocate = false
      })
  } else {
    PopupFunc("info", 'Nie można przenieść zlecenia do dokładnie tej samej lokalizacji...')
    ConfirmRelocate = false
}
return ConfirmRelocate
}
