import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "../../components/ClientSidebar";

const HomeClient = () => {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    edad: "",
    sexo: "",
    region: "",
    comuna: "",
    numero: "",
    correo: "",
    rut: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/client/login");
          return;
        }
        const clienteRef = doc(db, "clientes", user.uid);
        const clienteSnap = await getDoc(clienteRef);
        if (clienteSnap.exists()) {
          setForm({ ...form, ...clienteSnap.data() });
        }
      } catch (error) {
        alert("Error al cargar datos del cliente");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/client/login");
        return;
      }
      const clienteRef = doc(db, "clientes", user.uid);
      await updateDoc(clienteRef, {
        nombres: form.nombres,
        apellidos: form.apellidos,
        edad: form.edad,
        sexo: form.sexo,
        region: form.region,
        comuna: form.comuna,
        numero: form.numero,
      });
      alert("Perfil actualizado correctamente");
    } catch (error) {
      alert("Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <div className="d-flex">
      <ClientSidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Mi Perfil</h2>
        <form onSubmit={handleSave} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombres</label>
            <input
              type="text"
              name="nombres"
              className="form-control"
              value={form.nombres}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Apellidos</label>
            <input
              type="text"
              name="apellidos"
              className="form-control"
              value={form.apellidos}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Edad</label>
            <input
              type="number"
              name="edad"
              className="form-control"
              value={form.edad}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Sexo</label>
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
          <div className="col-md-4">
            <label className="form-label">Número</label>
            <input
              type="number"
              name="numero"
              className="form-control"
              value={form.numero}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Región</label>
            <input
              type="text"
              name="region"
              className="form-control"
              value={form.region}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Comuna</label>
            <input
              type="text"
              name="comuna"
              className="form-control"
              value={form.comuna}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Correo (no editable)</label>
            <input
              type="email"
              className="form-control"
              value={form.correo}
              readOnly
              disabled
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">RUT (no editable)</label>
            <input
              type="text"
              className="form-control"
              value={form.rut}
              readOnly
              disabled
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomeClient;
