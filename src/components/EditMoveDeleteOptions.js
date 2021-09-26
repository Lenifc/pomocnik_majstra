
import { getTime } from '@/components/getCurrentTime'
import firebase from 'firebase/app'

//
// Usuwanie danych z kolekcji firebase
//
export async function DeleteFunc(type, docPath, ID, target, extraData, doNotCount) {
  // console.log(type, ID, target, extraData);

  const counterPathTickets = firebase.firestore().collection('warsztat').doc('zlecenia')
  const counterPathClients = firebase.firestore().collection('warsztat').doc('Klienci')

  let ConfirmDelete

  if (type == 'ticket') {
  const docReference = docPath.doc(`zlecenie-${ID}`)

    await docReference.get().then(()=> {
      docReference.get().then(() => {
        docReference.delete().then(() => {
      if (target != 'justRelocate') counterPathTickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
      if (docPath.id == 'wolne' && target != 'justRelocate') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(-1))
      if (docPath.id == 'obecne' && target != 'justRelocate') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(-1))
      if (docPath.id == 'zakonczone' && target != 'justRelocate') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(-1))
        }
        ).catch(err => {
          console.log(err.code, err.message)
        })
    }).catch(err => {
      console.log(err.code, err.message)
    })
  })
}

  if (type == 'client') {
    const docReference = docPath.doc(ID)

      await docReference.get().then(()=> {
      docReference.delete().catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
        .then(() => {
          if(target != 'doNotCount'){
          counterPathClients.update("Klienci", firebase.firestore.FieldValue.increment(-1))
          if(target != 0) counterPathClients.update("Pojazdy", firebase.firestore.FieldValue.increment(-target))
          }
          ConfirmDelete = true
        })
        .catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
      return ConfirmDelete
    })
  }
    if (type == 'car') {
      const docReference = docPath.doc(ID)
      delete extraData[`${target}`]

      await docReference.get().then(()=> {

      extraData['Ostatnia_Aktualizacja'] = getTime()

      docReference.set({
          ...extraData
        }).catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
        .then(() => {
          if(doNotCount != 'doNotCount') counterPathClients.update("Pojazdy", firebase.firestore.FieldValue.increment(-1))
          ConfirmDelete = true
        })
        .catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        })
      return ConfirmDelete
    })
  }
}

//
// Przenoszenie danych między kolekcjami
//
export function RelocateTicket(type, object, ticketsPath, currentDocPath, newDocPath, ID) {

  const counterPathTickets = firebase.firestore().collection('warsztat').doc('zlecenia')
  const docReference = ticketsPath.collection(newDocPath).doc(`zlecenie-${ID}`)
  const timeStamp = getTime()
  let ConfirmRelocate

  if (currentDocPath != newDocPath) {
    // console.log('CHECK', object);
  if(newDocPath == 'zakonczone') object['Zakonczone_Czas'] = timeStamp
  object['Aktualizacja'] = timeStamp

    docReference.get().then(function (doc) {
        if (doc.exists) {
          docReference.update({
              ...object,
            }).catch(err => {
              console.log(err.code, err.message)
              ConfirmRelocate = false
            })
        } else {
          docReference.set({
              ...object,
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
        DeleteFunc(type, deleteThis, ID, 'justRelocate', ...Object.keys(object))
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

export async function relocateCarToUnassigned(type, docPath, ID, target, extraData, doNotCount){
let confirmRelocate = ''

  const unassignedPath = firebase.firestore()
    .collection('warsztat')
    .doc('Klienci').collection('Numery').doc('000-000-000')
    // .where('Tel' == extraData.Tel)

    unassignedPath.get().then(function (doc) {
      let data = doc.data()
      let targetData = data[target]
      let carToRelocate = []
      carToRelocate[target] = extraData[target]
      carToRelocate[target].Tel = '000-000-000' //usuniecie oryginalnego numeru telefonu poprzez nadpisanie
      // console.log(data, targetData)
      // console.log(carToRelocate)

      if (targetData) {
        unassignedPath.update({
          ...data, ...carToRelocate
          }).catch(err => {
            console.log(err.code, err.message)
          })
      } else {
        unassignedPath.set({
            ...data, ...carToRelocate
          }).catch(err => {
            console.log(err.code, err.message)
          })
      }
      confirmRelocate = 'OK'
    }).then(() =>{
      if(confirmRelocate == 'OK') DeleteFunc(type, docPath, ID, target, extraData, doNotCount)
      else console.log('powinno wyjsc inaczej...');
    }).catch(err => console.log(err.code, err.message))
}


export async function updateClientNumber(oldData, updatedData) {
  let ConfirmUpdateClientData
  const timeStamp = getTime()
  const clientsPath = firebase.firestore()
    .collection('warsztat')
    .doc('Klienci').collection('Numery')

  const newClientPath = clientsPath.doc(updatedData.Tel)

  // aktualizujemy stare dane, ktore maja wszystkie dane potrzebne do przeniesienia nowymi zmiennymi z formularza
  let setNewData = Object.assign(JSON.parse(JSON.stringify(oldData)), updatedData)

  // zmiana numeru takze dla wszystkich pojazdow przypisanych do danego klienta
  Object.values(setNewData).map(element => {
    if(element.VIN && element.Tel) element.Tel = updatedData.Tel
  });

  ConfirmUpdateClientData = await newClientPath.get().then(function (doc) {
    if (doc.exists) {
      console.log('Taki numer jest juz przypisany do innego klienta')
      ConfirmUpdateClientData = false
    } else {
      newClientPath.set({
        ...setNewData,
        timeStamp
      }).then(() => {
        DeleteFunc('client', clientsPath, oldData.Tel, 'doNotCount')
        ConfirmUpdateClientData = true
      }).catch(err => {
        console.log(err.code, err.message)
        ConfirmUpdateClientData = false
      })
    }
    return ConfirmUpdateClientData
  })
  return ConfirmUpdateClientData
}
