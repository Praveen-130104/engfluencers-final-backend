import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import dotenv from "dotenv";

dotenv.config();



const firebaseConfig = {
    apiKey:process.env.VITE_FIREBASEAPIKEY,
    authDomain: process.env.VITE_FIREBASEAUTHDOMAIN,
    projectId: process.env.VITE_FIREBASEPROJECTID,
    storageBucket: process.env.VITE_FIREBASESTORAGEBUCKET,
    messagingSenderId: process.env.VITE_FIREBASEMESSAGINGSENDERID,
    appId: process.env.VITE_FIREBASEAPPID,
    measurementId: process.env.VITE_FIREBASEMEASUREMENTID
  };


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const storage = getStorage(app);

export { storage, app ,auth };
