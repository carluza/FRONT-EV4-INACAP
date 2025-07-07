import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
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
      <h4 className="mb-4 text-success">Panel Administrador</h4>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <button
            onClick={() => navigate("/admin/home")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/admin/home") ? "active" : ""
            }`}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/admin/companies")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/admin/companies") ? "active" : ""
            }`}
          >
            Gestionar Empresas
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/admin/clients")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/admin/clients") ? "active" : ""
            }`}
          >
            Gestionar Clientes
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate("/admin/products")}
            className={`nav-link text-dark w-100 text-start border-0 bg-transparent ${
              isActive("/admin/products") ? "active" : ""
            }`}
          >
            Gestionar Productos
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

export default AdminSidebar;
