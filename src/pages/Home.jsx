import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-center p-4">
      <h1 className="display-4 fw-bold text-success mb-4">
        Bienvenido a EcoFood
      </h1>
      <p className="lead mb-5">Elige cómo deseas iniciar sesión:</p>
      <div className="d-flex flex-column align-items-center gap-3">
        <Link
          to="/admin/login"
          className="btn btn-success w-100 py-2"
          style={{ maxWidth: "350px" }}
        >
          Iniciar como Admin
        </Link>
        <Link
          to="/company/login"
          className="btn btn-success w-100 py-2"
          style={{ maxWidth: "350px" }}
        >
          Iniciar como Empresa
        </Link>
        <Link
          to="/client/login"
          className="btn btn-success w-100 py-2"
          style={{ maxWidth: "350px" }}
        >
          Iniciar o Registrar como Cliente
        </Link>
      </div>
    </div>
  );
};

export default Home;
