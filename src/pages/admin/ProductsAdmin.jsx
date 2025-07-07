import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const ProductsAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const productosCol = collection(db, "productos");
      const productosSnap = await getDocs(productosCol);
      const productosData = [];
      for (const d of productosSnap.docs) {
        const prod = { id: d.id, ...d.data() };
        // Obtener nombre de la empresa
        if (prod.empresaId) {
          try {
            const empresaDoc = await getDoc(
              doc(db, "empresas", prod.empresaId)
            );
            if (empresaDoc.exists())
              prod.empresaNombre =
                empresaDoc.data().nombreEmpresa || empresaDoc.data().nombre;
          } catch (error) {}
        }
        productosData.push(prod);
      }
      setProductos(productosData);
    } catch (error) {
      alert("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "productos", id));
      setProductos(productos.filter((p) => p.id !== id));
    } catch (error) {
      alert("Error al eliminar producto");
    } finally {
      setDeleting("");
    }
  };

  const handleEdit = (producto) => {
    setEditingId(producto.id);
    setEditForm({ ...producto });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, empresaNombre, ...data } = editForm;
      data.cantidad = parseInt(data.cantidad);
      data.precio = parseFloat(data.precio);
      await updateDoc(doc(db, "productos", editingId), data);
      setProductos(
        productos.map((p) => (p.id === editingId ? { ...p, ...data } : p))
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
        <h2 className="text-success mb-4">Productos registrados</h2>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Empresa</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Fecha Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id}>
                    {editingId === prod.id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            name="nombre"
                            className="form-control"
                            value={editForm.nombre}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>{prod.empresaNombre || prod.empresaId}</td>
                        <td>
                          <input
                            type="text"
                            name="descripcion"
                            className="form-control"
                            value={editForm.descripcion}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="cantidad"
                            className="form-control"
                            value={editForm.cantidad}
                            onChange={handleEditChange}
                            min={0}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="precio"
                            className="form-control"
                            value={editForm.precio}
                            onChange={handleEditChange}
                            min={0}
                            step={0.01}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            name="fechaVencimiento"
                            className="form-control"
                            value={editForm.fechaVencimiento}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="estado"
                            className="form-control"
                            value={editForm.estado}
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
                        <td>{prod.nombre}</td>
                        <td>{prod.empresaNombre || prod.empresaId}</td>
                        <td>{prod.descripcion}</td>
                        <td>{prod.cantidad}</td>
                        <td>${prod.precio}</td>
                        <td>{prod.fechaVencimiento}</td>
                        <td>{prod.estado}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => handleEdit(prod)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(prod.id)}
                            disabled={deleting === prod.id}
                          >
                            {deleting === prod.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {productos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      No hay productos registrados
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

export default ProductsAdmin;
