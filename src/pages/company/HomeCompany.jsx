import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import CompanySidebar from "../../components/Sidebar";

const HomeCompany = () => {
  const [empresa, setEmpresa] = useState({
    nombre: "",
    comuna: "",
    direccion: "",
    email: "",
    rut: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/company/login");
          return;
        }

        const empresaRef = doc(db, "empresas", user.uid);
        const empresaSnap = await getDoc(empresaRef);

        if (empresaSnap.exists()) {
          const data = empresaSnap.data();
          setEmpresa({
            nombre: data.nombre || "",
            comuna: data.comuna || "",
            direccion: data.direccion || "",
            email: data.email || user.email || "",
            rut: data.rut || "",
          });
        }
      } catch (error) {
        console.error("Error al cargar datos de la empresa:", error);
        alert("Error al cargar los datos de la empresa");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresaData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/company/login");
        return;
      }

      const empresaRef = doc(db, "empresas", user.uid);
      await updateDoc(empresaRef, {
        nombre: empresa.nombre,
        comuna: empresa.comuna,
        direccion: empresa.direccion,
      });

      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/company/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <CompanySidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Panel de Empresa</h2>

        <div className="mb-4">
          <h4>Perfil de la Empresa</h4>
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label">Nombre de la Empresa</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={empresa.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Comuna</label>
              <input
                type="text"
                name="comuna"
                className="form-control"
                value={empresa.comuna}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-control"
                value={empresa.direccion}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo (no editable)</label>
              <input
                type="email"
                className="form-control"
                value={empresa.email}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label className="form-label">RUT (no editable)</label>
              <input
                type="text"
                className="form-control"
                value={empresa.rut}
                readOnly
                disabled
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>

        <div className="d-flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/company/add-product")}
            className="btn btn-outline-success"
          >
            Agregar Productos
          </button>
          <button
            onClick={() => navigate("/company/requests")}
            className="btn btn-outline-success"
          >
            Ver Solicitudes
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeCompany;
