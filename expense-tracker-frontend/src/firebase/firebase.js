import * as firebase from "firebase";

const config = {
    apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
    authDomain: "expense-tracker-14f47.firebaseapp.com",
    databaseURL: "https://expense-tracker-14f47-default-rtdb.firebaseio.com",
    projectId: "expense-tracker-14f47",
    storageBucket: "expense-tracker-14f47.firebasestorage.app",
    messagingSenderId: "139042768566",
    appId: "1:139042768566:web:b102e28053a0c04abb8817",
    measurementId: "G-CP8K7PD2XN"

};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

const db = firebase.database();
const auth = firebase.auth();

export { auth, db };
