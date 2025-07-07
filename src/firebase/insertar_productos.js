import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";

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
const db = getFirestore(app);

// UID de la empresa "frutillas del sur"
const empresaId = "2mZAfACTaVN4Z5O8C58RUr78hau1";

// Productos genéricos a insertar
const productos = [
  {
    nombre: "Manzanas",
    descripcion: "Fruta fresca y deliciosa.",
    cantidad: 100,
    precio: 500,
    fechaVencimiento: "2024-12-31",
    estado: "disponible",
  },
  {
    nombre: "Leche",
    descripcion: "Leche entera 1L.",
    cantidad: 50,
    precio: 1200,
    fechaVencimiento: "2024-08-15",
    estado: "disponible",
  },
  {
    nombre: "Pan",
    descripcion: "Pan integral recién hecho.",
    cantidad: 80,
    precio: 800,
    fechaVencimiento: "2024-07-10",
    estado: "disponible",
  },
  {
    nombre: "Tomates",
    descripcion: "Tomates orgánicos.",
    cantidad: 60,
    precio: 700,
    fechaVencimiento: "2024-07-20",
    estado: "disponible",
  },
  // Puedes agregar más productos aquí
];

async function insertarProductos() {
  for (const prod of productos) {
    await addDoc(collection(db, "productos"), {
      ...prod,
      empresaId,
      fechaCreacion: Timestamp.now(),
    });
    console.log(`Producto ${prod.nombre} insertado`);
  }
  console.log("¡Todos los productos insertados!");
}

insertarProductos();
