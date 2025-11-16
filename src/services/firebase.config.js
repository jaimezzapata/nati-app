
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBrbHM4PsH9lWFQMA3pamOJDHyRfHDzUDk",
  authDomain: "nati-app-a4a22.firebaseapp.com",
  projectId: "nati-app-a4a22",
  storageBucket: "nati-app-a4a22.firebasestorage.app",
  messagingSenderId: "460325696106",
  appId: "1:460325696106:web:3b2bab9a1ced577f755013"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
