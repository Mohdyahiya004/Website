// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   projectId: "ecom-app-c26b8",
//   storageBucket: "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "AIzaSyDHrrTuiCvAO3Eg41K0es6KPE2CLCH8B3w",
// };

const firebaseConfig = {
  apiKey: "AIzaSyDHrrTuiCvAO3Eg41K0es6KPE2CLCH8B3w",
  authDomain: "ecom-app-c26b8.firebaseapp.com",
  projectId: "ecom-app-c26b8",
  storageBucket: "ecom-app-c26b8.firebasestorage.app",
  messagingSenderId: "200204434333",
  appId: "1:200204434333:web:4e3fff401758699c080d74"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
