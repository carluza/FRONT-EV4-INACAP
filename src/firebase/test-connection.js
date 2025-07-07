import { auth, db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export const testFirestoreConnection = async () => {
  try {
    console.log("Probando conexión con Firestore...");

    // Verificar si hay usuario autenticado
    const user = auth.currentUser;
    console.log("Usuario actual:", user ? user.uid : "No autenticado");

    // Intentar leer la colección de productos
    const productosRef = collection(db, "productos");
    const snapshot = await getDocs(productosRef);

    console.log("Conexión exitosa. Productos encontrados:", snapshot.size);

    return {
      success: true,
      userAuthenticated: !!user,
      productsCount: snapshot.size,
    };
  } catch (error) {
    console.error("Error en la conexión con Firestore:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
