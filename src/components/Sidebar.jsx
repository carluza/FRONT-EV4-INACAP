import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const CompanySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/company/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="d-flex flex-column p-3 bg-light"
      style={{ width: "250px", height: "100vh" }}
    >
      <h4 className="mb-4 text-success">Panel Empresa</h4>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <button
            onClick={() => navigate("/company/home")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/company/home") ? "active" : ""
            }`}
          >
            Perfil
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/company/add-product")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/company/add-product") ? "active" : ""
            }`}
          >
            Agregar Productos
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/company/requests")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/company/requests") ? "active" : ""
            }`}
          >
            Solicitudes
          </button>
        </li>
        <li className="mt-auto">
          <button
            onClick={handleLogout}
            className="nav-link text-danger w-100 text-start border-0 bg-transparent"
          >
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </div>
  );
};

export default CompanySidebar;
