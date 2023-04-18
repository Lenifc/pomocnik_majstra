import firebase from 'firebase/app'

const vehicleDocumentsPath = firebase
    .firestore()
    .collection('warsztat')
    .doc('Pojazdy')

const VINCollectionPath = vehicleDocumentsPath.collection('VIN')

export async function getVehiclesFromFirebase(limit = 50) {
    let vehiclesList = VINCollectionPath.orderBy(
        'Ostatnia_Aktualizacja',
        'desc',
    ).limit(limit)

    if (limit === 'all') {
        vehiclesList = VINCollectionPath.orderBy(
            'Ostatnia_Aktualizacja',
            'desc',
        )
    }

    try {
        const response = await vehiclesList.get()
        const recivedVehicles = response.docs.map(doc => doc.data())
        const totalNumberOfVehicles = await vehicleDocumentsPath.get()
        const total = totalNumberOfVehicles?.data()?.Pojazdy

        return {
            vehicles: recivedVehicles,
            total,
        }
    } catch (error) {
        throw Error(error)
    }
}
