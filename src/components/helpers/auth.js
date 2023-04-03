import firebase from 'firebase/app'
require('firebase/auth')
require('firebase/functions')

const googleProvider = new firebase.auth.GoogleAuthProvider()

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

function checkAuthStatus() {
    firebase.auth().onAuthStateChanged(user => {
        user
    })
}

// TODO - fix OAuth2
// Access blocked: This app’s request is invalid
export async function handleOAuth() {
    try {
        await firebase.auth().signInWithPopup(googleProvider)
        checkAuthStatus()
        const provideData = firebase.auth().currentUser.providerData
        firebase.functions().httpsCallable('userSignedIn', { provideData })
        return provideData
    } catch (error) {
        throw Error(error)
    }
}

export async function handleLoginWithEmail(credentials) {
    const { username, password } = credentials

    if (username && password) {
        try {
            await firebase.auth().signInWithEmailAndPassword(username, password)
            checkAuthStatus()
            const provideData = firebase.auth().currentUser.providerData
            firebase.functions().httpsCallable('userSignedIn', { provideData })
            return provideData
        } catch (error) {
            const errorCode = error.code

            if (errorCode == 'auth/invalid-email')
                throw Error('toast.error.invalid_email')
            if (
                errorCode == 'auth/wrong-password' ||
                errorCode == 'auth/user-not-found'
            )
                throw Error('toast.error.invalid_data')
            if (errorCode == 'auth/network-request-failed')
                throw Error('toast.error.network_issue')
        }
    } else throw Error('toast.fill_the_inputs')
}
