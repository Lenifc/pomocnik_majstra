import firebase from 'firebase/app'
let _ = require('lodash')


export async function callTicketsHistory(VIN, phoneNum) {
  let ticketsHistory = []
  const paths = ['wolne', 'obecne', 'zakonczone']

  paths.forEach(async path => {
    // console.log(path, VIN, phoneNum);

    const clients = firebase.firestore()
      .collection('warsztat')
      .doc('zlecenia').collection(path)
      .doc(phoneNum)

    const response = await clients.get()
    let outData = response.data()

    outData = outData ? Object.entries(outData).filter(item => item[0] != 'timeStamp') : ''
    outData = _.flattenDeep(outData)

    let readyData = await outData.filter(item => (item instanceof Object && item.VIN == VIN) ? item : '')

    if (readyData) ticketsHistory.push([path, readyData])
    if (ticketsHistory.length == 3) return ticketsHistory

  })
  return ticketsHistory
}