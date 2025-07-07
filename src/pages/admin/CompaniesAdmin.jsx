import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const CompaniesAdmin = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [form, setForm] = useState({
    nombreEmpresa: "",
    correo: "",
    comuna: "",
    direccion: "",
    rut: "",
    password: "",
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const empresasCol = collection(db, "empresas");
      const empresasSnap = await getDocs(empresasCol);
      setEmpresas(
        empresasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      alert("Error al cargar empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta empresa?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "empresas", id));
      setEmpresas(empresas.filter((e) => e.id !== id));
    } catch (error) {
      alert("Error al eliminar empresa");
    } finally {
      setDeleting("");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setAdding(true);

    try {
      // Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.correo,
        form.password
      );
      const user = userCredential.user;

      // Crear documento en empresas
      await setDoc(doc(db, "empresas", user.uid), {
        nombreEmpresa: form.nombreEmpresa,
        correo: form.correo,
        comuna: form.comuna,
        direccion: form.direccion,
        rut: form.rut,
        uid: user.uid,
      });

      // Cerrar sesión de la empresa recién creada
      await signOut(auth);

      setForm({
        nombreEmpresa: "",
        correo: "",
        comuna: "",
        direccion: "",
        rut: "",
        password: "",
      });
      fetchEmpresas();
      alert(
        "Empresa creada exitosamente. Por favor, inicie sesión nuevamente como administrador."
      );

      // Redirigir al login de admin
      navigate("/admin/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Empresas registradas</h2>
        <div className="card mb-4">
          <div className="card-header">Agregar nueva empresa</div>
          <div className="card-body">
            <form onSubmit={handleAdd} className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  name="nombreEmpresa"
                  className="form-control"
                  placeholder="Nombre de la empresa"
                  value={form.nombreEmpresa}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="email"
                  name="correo"
                  className="form-control"
                  placeholder="Correo electrónico"
                  value={form.correo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  name="rut"
                  className="form-control"
                  placeholder="RUT"
                  value={form.rut}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  name="comuna"
                  className="form-control"
                  placeholder="Comuna"
                  value={form.comuna}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  name="direccion"
                  className="form-control"
                  placeholder="Dirección"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={adding}
                >
                  {adding ? "Agregando..." : "Agregar Empresa"}
                </button>
                {error && <div className="text-danger mt-2">{error}</div>}
              </div>
            </form>
          </div>
        </div>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Comuna</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.nombreEmpresa || empresa.nombre || "-"}</td>
                    <td>{empresa.correo || empresa.email || "-"}</td>
                    <td>{empresa.comuna || "-"}</td>
                    <td>{empresa.direccion || "-"}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(empresa.id)}
                        disabled={deleting === empresa.id}
                      >
                        {deleting === empresa.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </td>
                  </tr>
                ))}
                {empresas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No hay empresas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesAdmin;
