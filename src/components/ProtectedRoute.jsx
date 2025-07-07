import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children, userType }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Verificar el tipo de usuario en Firestore
        try {
          // Verificar si es admin
          const adminRef = doc(db, "admins", firebaseUser.uid);
          const adminSnap = await getDoc(adminRef);

          if (adminSnap.exists()) {
            setUserRole("admin");
          } else {
            // Verificar si es empresa
            const empresaRef = doc(db, "empresas", firebaseUser.uid);
            const empresaSnap = await getDoc(empresaRef);

            if (empresaSnap.exists()) {
              setUserRole("empresa");
            } else {
              // Verificar si es cliente
              const clienteRef = doc(db, "clientes", firebaseUser.uid);
              const clienteSnap = await getDoc(clienteRef);

              if (clienteSnap.exists()) {
                setUserRole("cliente");
              } else {
                setUserRole("unknown");
              }
            }
          }
        } catch (error) {
          console.error("Error verificando tipo de usuario:", error);
          setUserRole("unknown");
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirigir a la página de login correcta según el tipo de ruta
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" replace />;
    } else if (location.pathname.startsWith("/company")) {
      return <Navigate to="/company/login" replace />;
    } else if (location.pathname.startsWith("/client")) {
      return <Navigate to="/client/login" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Verificar que el usuario tenga el rol correcto para acceder a esta ruta
  if (userType && userRole !== userType) {
    // Redirigir según el tipo de usuario detectado
    if (userRole === "admin") {
      return <Navigate to="/admin/home" replace />;
    } else if (userRole === "empresa") {
      return <Navigate to="/company/home" replace />;
    } else if (userRole === "cliente") {
      return <Navigate to="/client/home" replace />;
    } else {
      // Usuario no tiene rol válido, redirigir a la página principal
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
