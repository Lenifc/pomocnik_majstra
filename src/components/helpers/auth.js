import firebase from 'firebase/app'
require('firebase/auth')

export async function signOut() {
    try {
        await firebase.auth().signOut()
        // ponizej zerujemy wszystko co zostalo w pamieci
        await firebase.firestore().terminate()
        localStorage.clear()
        indexedDB.deleteDatabase('firebaseLocalStorageDb')
        indexedDB.deleteDatabase('firestore/[DEFAULT]/baza-mech/main/')
        await firebase.firestore().clearPersistence()
        return
    } catch (error) {
        console.log(error)
        throw error
    }
}
