import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCmMlEu6cwpY6Dh7TvhtQzzt_qMJr5D-Jg",
    authDomain: "skillswap-c5823.firebaseapp.com",
    projectId: "skillswap-c5823",
    storageBucket: "skillswap-c5823.firebasestorage.app",
    messagingSenderId: "953518220689",
    appId: "1:953518220689:web:7739752a5d1b21091aa630",
    measurementId: "G-DQC383WY0C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };