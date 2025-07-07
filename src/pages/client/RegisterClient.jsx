import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

const RegisterClient = () => {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    edad: "",
    sexo: "",
    region: "",
    comuna: "",
    numero: "",
    correo: "",
    contrasena: "",
    rut: "",
  });

  const [errors, setErrors] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validarContrasena = (pass) => {
    return (
      /[a-z]/.test(pass) &&
      /[A-Z]/.test(pass) &&
      /\d/.test(pass) &&
      pass.length >= 8
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");

    if (!validarContrasena(form.contrasena)) {
      setErrors(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.correo,
        form.contrasena
      );
      const user = userCredential.user;

      await setDoc(doc(db, "clientes", user.uid), {
        nombres: form.nombres,
        apellidos: form.apellidos,
        edad: form.edad,
        sexo: form.sexo,
        region: form.region,
        comuna: form.comuna,
        numero: form.numero,
        correo: form.correo,
        rut: form.rut,
      });

      navigate("/client/home");
    } catch (error) {
      setErrors("Error al registrar: " + error.message);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="bg-white p-4 rounded shadow-sm w-100"
        style={{ maxWidth: "500px" }}
      >
        <h2 className="text-center text-success mb-4 fw-bold">
          Registro Cliente
        </h2>
        <form onSubmit={handleSubmit}>
          {["nombres", "apellidos", "edad"].map((field) => (
            <div className="mb-3" key={field}>
              <input
                type={field === "edad" ? "number" : "text"}
                className="form-control"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="mb-3">
            <select
              name="sexo"
              className="form-control"
              value={form.sexo}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione su sexo</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {["region", "comuna", "numero", "rut", "correo", "contrasena"].map(
            (field) => (
              <div className="mb-3" key={field}>
                <input
                  type={
                    field === "contrasena"
                      ? "password"
                      : field === "correo"
                      ? "email"
                      : field === "numero"
                      ? "number"
                      : "text"
                  }
                  className="form-control"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required
                />
                {field === "contrasena" && (
                  <small
                    className={
                      validarContrasena(form.contrasena)
                        ? "text-muted"
                        : "text-danger"
                    }
                  >
                    La contraseña debe tener al menos 8 caracteres, una
                    mayúscula, una minúscula y un número.
                  </small>
                )}
              </div>
            )
          )}

          {errors && <div className="alert alert-danger">{errors}</div>}
          <button type="submit" className="btn btn-success w-100">
            Registrarse
          </button>
        </form>
        <div className="text-center mt-3">
          <Link
            to="/client/login"
            className="btn btn-link text-success text-decoration-none"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterClient;
