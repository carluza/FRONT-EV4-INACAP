import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 Asegúrate de tener esto

const firebaseConfig = {
  apiKey: "AIzaSyBAcdJVgei_JC1k2flL-8E1AS2nWSFkTLU",
  authDomain: "ev-4-front.firebaseapp.com",
  projectId: "ev-4-front",
  storageBucket: "ev-4-front.appspot.com",
  messagingSenderId: "933757091512",
  appId: "1:933757091512:web:7edafb446c2f8aed70be4d",
  measurementId: "G-5CRSZPW7XR",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // 👈 ESTA ES LA LÍNEA QUE FALTABA
