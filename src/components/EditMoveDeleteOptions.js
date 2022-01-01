
import { getTime } from '@/components/getCurrentTime'
import firebase from 'firebase/app'

//
// Usuwanie danych z kolekcji firebase
//
export async function DeleteFunc(objectType, docPath, ID, operationType) {
  const docReference = docPath.doc(`${objectType == 'ticket' ? 'zlecenie-' : ''}${ID}`)
  let ConfirmDelete

    await docReference.get().then(()=> {
        docReference.delete().catch(err => {
          console.log(err.code, err.message);
          ConfirmDelete = false
        }).then(() => {

          if(objectType == 'ticket'){
            const counterPathTickets = firebase.firestore().collection('warsztat').doc('zlecenia')
            if (operationType != 'justRelocate') counterPathTickets.update("IloscZlecen", firebase.firestore.FieldValue.increment(-1))
            if (docPath.id == 'wolne' && operationType != 'justRelocate') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(-1))
            if (docPath.id == 'obecne' && operationType != 'justRelocate') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(-1))
            if (docPath.id == 'zakonczone' && operationType != 'justRelocate') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(-1))
          }
          if(objectType == 'client'){
            const counterPathClients = firebase.firestore().collection('warsztat').doc('Klienci')
            if(operationType != 'doNotCount'){
              counterPathClients.update("Klienci", firebase.firestore.FieldValue.increment(-1))
              fetchAndCountClientVehicles(ID)
              }
              ConfirmDelete = true
          }
          if(objectType == 'car'){     
            const counterPathVehicles = firebase.firestore().collection('warsztat').doc('Pojazdy')
            if(operationType != 'doNotCount'){
              counterPathVehicles.update("Pojazdy", firebase.firestore.FieldValue.increment(-1))
              }
              ConfirmDelete = true
          }
        }
        ).catch(err => {
          console.log(err.code, err.message)
          ConfirmDelete = false
        })
    }).catch(err => {
      console.log(err.code, err.message)
      ConfirmDelete = false
    })
    return ConfirmDelete
}

//
// Przenoszenie danych między kolekcjami
//
export async function RelocateTicket(type, object, ticketsPath, currentDocPath, newDocPath, ID) {
  const counterPathTickets = firebase.firestore().collection('warsztat').doc('zlecenia')
  const docReference = ticketsPath.collection(newDocPath).doc(`zlecenie-${ID}`)
  const timeStamp = getTime()
  let ConfirmRelocate, clientIsOffline

  function changeDataFunc(doc) {
    if (doc.exists) {
      docReference.update({
          ...object,
        }).catch(err => {
          console.log(err.code, err.message)
          return ConfirmRelocate = false
        })
    } else {
      docReference.set({
          ...object,
        }).catch(err => {
          console.log(err.code, err.message)
          return ConfirmRelocate = false
        })
    }
    return ConfirmRelocate
  }
  
  function updateCountersFunc() {
    if(currentDocPath == 'wolne') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(-1))
    if(currentDocPath == 'obecne') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(-1))
    if(currentDocPath == 'zakonczone') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(-1))
    if(newDocPath == 'wolne') counterPathTickets.update("Wolne", firebase.firestore.FieldValue.increment(1))
    if(newDocPath == 'obecne') counterPathTickets.update("Obecne", firebase.firestore.FieldValue.increment(1))
    if(newDocPath == 'zakonczone') counterPathTickets.update("Zakonczone", firebase.firestore.FieldValue.increment(1))
    let deleteThis = ticketsPath.collection(currentDocPath)
    DeleteFunc(type, deleteThis, ID, 'justRelocate')
  }

  if (currentDocPath != newDocPath) {
    // console.log('CHECK', object);
  if(newDocPath == 'zakonczone') object['Zakonczone_Czas'] = timeStamp
  object['Aktualizacja'] = timeStamp

  try{
    const getDocReference = await docReference.get()
    await changeDataFunc(getDocReference)
    await updateCountersFunc()
    ConfirmRelocate = true
  }
  catch (err){
        // console.log(err.code, err.message);
        if(err.message.indexOf('offline') > 0) {
          ConfirmRelocate = false 
          clientIsOffline = true
          return {ConfirmRelocate, clientIsOffline}
        }
        return ConfirmRelocate = false
      }
    
  } else {
    return ConfirmRelocate = false
}
return { ConfirmRelocate, clientIsOffline}
}

//
// Przenoszenie pojazdow do NIEPRZYPISANE lub do nowych numerow po aktualizacji numeru klienta
//
export async function relocateCarsFunc(vehicle, target, newPhoneNum){
  let confirmUnassign
  const vehiclePath = firebase.firestore()
    .collection('warsztat')
    .doc('Pojazdy').collection('VIN').doc(target)

    vehiclePath.get().then(function (doc) {
      let data = doc.data()
      
      if (data.exists) {
        vehiclePath.update({
          ...vehicle, Tel: newPhoneNum ? newPhoneNum : ''
          }).catch(err => {
            console.log(err.code, err.message)
            return confirmUnassign = false
          })
          return confirmUnassign
      } else {
        vehiclePath.set({
            ...vehicle, Tel: newPhoneNum ? newPhoneNum : ''
          }).catch(err => {
            console.log(err.code, err.message)
            return confirmUnassign = false
          })
          return confirmUnassign
      }
    })
    return { confirmUnassign } 
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


  ConfirmUpdateClientData = await newClientPath.get().then(function (doc) {
    if (doc.exists) {
      console.log('Taki numer jest juz przypisany do innego klienta')
      ConfirmUpdateClientData = false
    } else {
      newClientPath.set({
        ...setNewData,
        timeStamp
      }).then(async () => {
        await fetchAndCountClientVehicles(oldData.Tel, updatedData.Tel)
        await DeleteFunc('client', clientsPath, oldData.Tel, 'doNotCount')
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

export async function updateVehicleVIN(oldData, updatedData){
  console.log(oldData, updatedData);

  let ConfirmUpdateVehicleData
  const timeStamp = getTime()
  const vehiclePath = firebase.firestore()
    .collection('warsztat')
    .doc('Pojazdy').collection('VIN')

  const newVehiclePath = vehiclePath.doc(updatedData.VIN)

  // aktualizujemy stare dane, ktore maja wszystkie dane potrzebne do przeniesienia nowymi zmiennymi z formularza
  let setNewData = Object.assign(JSON.parse(JSON.stringify(oldData)), updatedData)

  ConfirmUpdateVehicleData = await newVehiclePath.get().then(function (doc) {
    if (doc.exists) {
      console.log('Ten VIN juz istnieje')
      ConfirmUpdateVehicleData = false
    } else {
      newVehiclePath.set({
        ...setNewData,
        timeStamp
      }).then(async () => {
        await DeleteFunc('car', vehiclePath, oldData.VIN, 'doNotCount')
        ConfirmUpdateVehicleData = true
      }).catch(err => {
        console.log(err.code, err.message)
        ConfirmUpdateVehicleData = false
      })
    }
    return ConfirmUpdateVehicleData
  })
  return ConfirmUpdateVehicleData
}

export async function fetchAndCountClientVehicles(currentTel, newTelUpdate){
  const vehiclesPath = firebase.firestore().collection('warsztat').doc('Pojazdy').collection('VIN').where('Tel', '==', currentTel)

  const getVehicles = await vehiclesPath.get()
  const allVehicles = getVehicles.docs.map(doc => doc.data())

  allVehicles.forEach(async (car) => await relocateCarsFunc(car, car.VIN, newTelUpdate))
  return allVehicles
}