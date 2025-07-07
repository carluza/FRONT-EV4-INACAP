import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { Link } from "react-router-dom";

export default function ResetPasswordClient() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({ type: "success", text: "Correo de recuperación enviado." });
    } catch (err) {
      setMessage({ type: "danger", text: "Error: " + err.message });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center text-success">
        Recuperar Contraseña - Cliente
      </h2>
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      <form onSubmit={handleReset}>
        <div className="mb-3">
          <label>Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-success w-100">
          Enviar correo de recuperación
        </button>
      </form>
      <div className="text-center mt-3">
        <Link to="/client/login" className="text-decoration-none text-success">
          ← Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
