import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbKJYgkVAu9RYlNa8d-HjiUjrXZIVeh_4",
  authDomain: "kasir-pintar-de090.firebaseapp.com",
  projectId: "kasir-pintar-de090",
  storageBucket: "kasir-pintar-de090.appspot.com",
  messagingSenderId: "614420171312",
  appId: "1:614420171312:web:e681fa9e2a1dccd4c6fbf5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
