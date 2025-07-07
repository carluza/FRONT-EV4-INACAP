import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const ClientsAdmin = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const clientesCol = collection(db, "clientes");
      const clientesSnap = await getDocs(clientesCol);
      setClientes(
        clientesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      alert("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "clientes", id));
      setClientes(clientes.filter((c) => c.id !== id));
    } catch (error) {
      alert("Error al eliminar cliente");
    } finally {
      setDeleting("");
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setEditForm({ ...cliente });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { correo, rut, id, ...data } = editForm;
      await updateDoc(doc(db, "clientes", editingId), data);
      setClientes(
        clientes.map((c) => (c.id === editingId ? { ...c, ...data } : c))
      );
      setEditingId(null);
    } catch (error) {
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Clientes registrados</h2>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                  <th>RUT</th>
                  <th>Comuna</th>
                  <th>Región</th>
                  <th>Número</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    {editingId === cliente.id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            name="nombres"
                            className="form-control"
                            value={editForm.nombres}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="apellidos"
                            className="form-control"
                            value={editForm.apellidos}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            className="form-control"
                            value={editForm.correo}
                            readOnly
                            disabled
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.rut}
                            readOnly
                            disabled
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="comuna"
                            className="form-control"
                            value={editForm.comuna}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="region"
                            className="form-control"
                            value={editForm.region}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="numero"
                            className="form-control"
                            value={editForm.numero}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            Guardar
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{cliente.nombres}</td>
                        <td>{cliente.apellidos}</td>
                        <td>{cliente.correo}</td>
                        <td>{cliente.rut}</td>
                        <td>{cliente.comuna}</td>
                        <td>{cliente.region}</td>
                        <td>{cliente.numero}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => handleEdit(cliente)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(cliente.id)}
                            disabled={deleting === cliente.id}
                          >
                            {deleting === cliente.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      No hay clientes registrados
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

export default ClientsAdmin;
