import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const ClientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/client/login");
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
      <h4 className="mb-4 text-success">Panel Cliente</h4>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <button
            onClick={() => navigate("/client/home")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/client/home") ? "active" : ""
            }`}
          >
            Inicio
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/client/products")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/client/products") ? "active" : ""
            }`}
          >
            Ver Productos
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/client/cart")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/client/cart") ? "active" : ""
            }`}
          >
            Mi Carrito
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/client/requests")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/client/requests") ? "active" : ""
            }`}
          >
            Mis Solicitudes
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

export default ClientSidebar;
