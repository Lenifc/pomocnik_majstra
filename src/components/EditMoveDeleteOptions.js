// import firebase from 'firebase/app'
import PopupFunc from '@/components/PopupFunc.js'
import { getTime } from '@/components/getCurrentTime'

//
// Usuwanie danych z kolekcji firebase
//
export async function DeleteFunc(id, docPath, phoneNumber, target, extraData) {
  // console.log(id, docPath, phoneNumber);

  const docReference = docPath.doc(phoneNumber)
  let ConfirmDelete

  
  await docReference.get().then(function () {
    if(id == 'client'){
      docReference.delete().then(
        PopupFunc('success', 'Klient został usunięty z bazy.')
        ).catch(err => {
          PopupFunc("error", err.message)
          ConfirmDelete = false
        })
      .then(() =>{
    // if(showIfRelocate != 'justRelocate') docPath.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
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
// if(showIfRelocate != 'justRelocate') docPath.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
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

// export function RelocateTicket(id, object, currentdocPath, newdocPath, phoneNumber) {

//   const collectionReference = tickets.collection(newdocPath)
//   const docReference = collectionReference.doc(phoneNumber)
//   const timeStamp = getTime()
//   let ConfirmRelocate

//   if (currentdocPath != newdocPath) {
//     docReference.get().then(function (doc) {
//         if (doc.exists) {
//           docReference.update({
//               ...object,
//               timeStamp
//             }).then(PopupFunc('success', `Do danego numeru dodano kolejny pojazd w zakładce ${newdocPath}`))
//             .catch(err => {
//               PopupFunc("error", err.message)
//               ConfirmRelocate = false
//             })
//         } else {
//           docReference.set({
//               ...object,
//               timeStamp
//             }).then(PopupFunc('success', `Pomyślnie przeniesiono zlecenie do ${newdocPath}`))
//             .catch(err => {
//               PopupFunc("error", err.message)
//               ConfirmRelocate = false
//             })
//         }

//       }).then( () => {
//         ConfirmRelocate = true
//         DeleteFunc(id, currentdocPath, phoneNumber, 'justRelocate')
//       })
//       .catch(function (err) {
//         PopupFunc("error", err.message)
//         ConfirmRelocate = false
//       })
//   } else {
//     PopupFunc("info", 'Nie można przenieść zlecenia do dokładnie tej samej lokalizacji...')
//     ConfirmRelocate = false
// }
// return ConfirmRelocate
// }
//