import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth } from "../../firebase/firebase";
import { db } from "../../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombreEmpresa: "",
    comuna: "",
    direccion: "",
    correo: "",
    contraseña: "",
    rut: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { correo, contraseña, rut, ...rest } = form;

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        correo,
        contraseña
      );
      await setDoc(doc(db, "empresas", cred.user.uid), {
        ...rest,
        correo,
        rut: form.rut,
      });
      navigate("/company/home");
    } catch (err) {
      setError("Error al registrar empresa: " + err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center text-success">Registrar Empresa</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre de la Empresa</label>
          <input
            type="text"
            name="nombreEmpresa"
            className="form-control"
            value={form.nombreEmpresa}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Comuna</label>
          <input
            type="text"
            name="comuna"
            className="form-control"
            value={form.comuna}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            className="form-control"
            value={form.direccion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>RUT</label>
          <input
            type="text"
            name="rut"
            className="form-control"
            value={form.rut}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Correo</label>
          <input
            type="email"
            name="correo"
            className="form-control"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            name="contraseña"
            className="form-control"
            value={form.contraseña}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn btn-success w-100" type="submit">
          Registrarse
        </button>
        <div className="text-center mt-3">
          <Link
            to="/company/login"
            className="text-decoration-none text-success"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
