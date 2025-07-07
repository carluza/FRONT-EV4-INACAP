import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const LoginAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Verificar que el usuario sea un admin
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        // Verificar si es empresa
        const empresaRef = doc(db, "empresas", user.uid);
        const empresaSnap = await getDoc(empresaRef);

        if (empresaSnap.exists()) {
          alert(
            "Este usuario es una empresa. Debe iniciar sesión en la sección de empresas."
          );
          navigate("/company/login");
          return;
        }

        // Verificar si es cliente
        const clienteRef = doc(db, "clientes", user.uid);
        const clienteSnap = await getDoc(clienteRef);

        if (clienteSnap.exists()) {
          alert(
            "Este usuario es un cliente. Debe iniciar sesión en la sección de clientes."
          );
          navigate("/client/login");
          return;
        }

        alert("No tienes permisos de administrador.");
        return;
      }

      navigate("/admin/home");
    } catch (error) {
      console.error(error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        alert("Correo o contraseña incorrectos");
      } else if (error.code === "auth/too-many-requests") {
        alert("Demasiados intentos fallidos. Intente más tarde.");
      } else {
        alert("Error al iniciar sesión. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center text-success mb-4 fw-bold">
          Admin - Iniciar sesión
        </h2>
        <form onSubmit={handleLogin} className="bg-white p-4 rounded shadow-sm">
          <div className="mb-3">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-success w-100 mb-2"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
          <div className="text-center">
            <Link
              to="/admin/forgot-password"
              className="btn btn-link text-success text-decoration-none p-0"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
        <div className="text-center mt-3">
          <Link to="/" className="text-decoration-none text-success">
            ← Volver a opciones para iniciar sesión.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
