import React from "react";
import AdminSidebar from "../../components/AdminSidebar";

const HomeAdmin = () => {
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Bienvenido Administrador</h2>
        <div className="alert alert-success">
          <strong>¡Bienvenido al panel de administración!</strong>
          <br />
          Desde aquí puedes gestionar empresas, clientes, productos y
          solicitudes.
        </div>
        {/* Aquí irá el dashboard o resumen de la plataforma (KPIs, estadísticas, etc.) */}
      </div>
    </div>
  );
};

export default HomeAdmin;
