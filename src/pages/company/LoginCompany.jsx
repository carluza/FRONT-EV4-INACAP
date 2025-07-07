import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const LoginCompany = () => {
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

      // Verificar que el usuario sea una empresa
      const empresaRef = doc(db, "empresas", user.uid);
      const empresaSnap = await getDoc(empresaRef);

      if (!empresaSnap.exists()) {
        // Verificar si es admin
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          alert(
            "Este usuario es un administrador. Debe iniciar sesión en la sección de administradores."
          );
          navigate("/admin/login");
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

        alert("No tienes permisos de empresa.");
        return;
      }

      navigate("/company/home");
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
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="bg-white p-4 rounded shadow-sm w-100"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-center text-success mb-4 fw-bold">
          Inicio Empresa
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              placeholder="Contraseña"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
        </form>
        <div className="d-flex justify-content-center gap-4 mt-3">
          <Link
            to="/company/registerCompany"
            className="text-decoration-none text-success"
          >
            Registrarse
          </Link>
          <Link
            to="/company/forgot-password"
            className="text-decoration-none text-success"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="text-decoration-none text-success">
            ← Volver a opciones para iniciar sesión.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginCompany;
