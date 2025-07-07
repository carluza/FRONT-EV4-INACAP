import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const LoginClient = () => {
  const [form, setForm] = useState({
    correo: "",
    contrasena: "",
  });

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.correo,
        form.contrasena
      );
      const user = userCredential.user;

      // Verificar si es cliente
      const clienteRef = doc(db, "clientes", user.uid);
      const clienteSnap = await getDoc(clienteRef);

      if (clienteSnap.exists()) {
        navigate("/client/home");
        return;
      }

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

      alert("No tienes permisos de cliente.");
    } catch (error) {
      console.error(error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setErrors("Correo o contraseña incorrectos");
      } else if (error.code === "auth/too-many-requests") {
        setErrors("Demasiados intentos fallidos. Intente más tarde.");
      } else {
        setErrors("Error al iniciar sesión. Intente nuevamente.");
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
          Inicio Cliente
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Correo electrónico"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          {errors && <div className="alert alert-danger">{errors}</div>}
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
        <div className="d-flex justify-content-center gap-4 mt-3">
          <Link
            to="/client/registerClient"
            className="text-decoration-none text-success"
          >
            Registrarse
          </Link>
          <Link
            to="/client/forgot-password"
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

export default LoginClient;
