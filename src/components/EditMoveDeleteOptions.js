// import firebase from 'firebase/app'
import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'
import firebase from 'firebase/app'

//
// Usuwanie danych z kolekcji firebase
//
export async function DeleteFunc(id, docPath, phoneNumber, target, extraData) {
  // console.log(id, docPath, phoneNumber);

  const counterPath = firebase.firestore().collection('warsztat').doc('zlecenia')

  const docReference = docPath.doc(phoneNumber)
  let ConfirmDelete
  
  await docReference.get().then(function () {
    if(id == 'client' || id == 'ticket'){
      docReference.delete().then(
        PopupFunc('success', 'Klient został usunięty z bazy.')
        ).catch(err => {
          PopupFunc("error", err.message)
          ConfirmDelete = false
        })
      .then(() =>{
    if(id == 'ticket' && target != 'justRelocate') counterPath.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
    ConfirmDelete = true
  })
  .catch(err => {
    PopupFunc("error", err.message)
    ConfirmDelete = false
  })
  return ConfirmDelete
}
if(id == 'car'){

  delete extraData[`${target}`]

  extraData['Ostatnia_Aktualizacja'] = getTime()

  docReference.set({...extraData}).then(
    PopupFunc('success', 'Pojazd został usunięty z bazy')
    ).catch(err => {
      PopupFunc("error", err.message)
      ConfirmDelete = false
    })
  .then(() =>{
    if(id == 'ticket' && target != 'justRelocate') docPath.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
ConfirmDelete = true
})
.catch(err => {
PopupFunc("error", err.message)
ConfirmDelete = false
})
return ConfirmDelete
}
return false
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
        DeleteFunc(id, deleteThis, phoneNumber, 'justRelocate')
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
