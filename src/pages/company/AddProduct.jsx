import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Sidebar from "../../components/Sidebar";

const AddProduct = () => {
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    precio: "",
    fechaVencimiento: "",
    estado: "disponible",
  });
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [productosPorPagina, setProductosPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [updatingStock, setUpdatingStock] = useState("");
  const [deleting, setDeleting] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No hay usuario autenticado, redirigiendo...");
      navigate("/company/login");
      return;
    }

    console.log("Usuario autenticado:", user.uid);
    cargarProductos();
  }, [navigate]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No hay usuario autenticado");
        return;
      }

      const productosRef = collection(db, "productos");
      const q = query(
        productosRef,
        where("empresaId", "==", user.uid)
        // Removemos orderBy temporalmente para evitar problemas de índices
      );
      const querySnapshot = await getDocs(q);
      const productosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ordenamos los productos en el cliente por fecha de creación
      productosData.sort((a, b) => {
        const fechaA =
          a.fechaCreacion?.toDate?.() || a.fechaCreacion || new Date(0);
        const fechaB =
          b.fechaCreacion?.toDate?.() || b.fechaCreacion || new Date(0);
        return fechaB - fechaA;
      });

      setProductos(productosData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      alert("Error al cargar los productos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("No hay usuario autenticado");
        navigate("/company/login");
        return;
      }

      // Validar campos requeridos
      if (
        !producto.nombre ||
        !producto.descripcion ||
        !producto.cantidad ||
        !producto.precio ||
        !producto.fechaVencimiento
      ) {
        alert("Todos los campos son obligatorios");
        return;
      }

      // Validar descripción
      if (producto.descripcion.length > 300) {
        alert("La descripción no puede exceder los 300 caracteres");
        return;
      }

      // Validar cantidad y precio
      if (parseInt(producto.cantidad) <= 0) {
        alert("La cantidad debe ser mayor a 0");
        return;
      }

      if (parseFloat(producto.precio) <= 0) {
        alert("El precio debe ser mayor a 0");
        return;
      }

      // Validar fecha de vencimiento
      const fechaVencimiento = new Date(producto.fechaVencimiento);
      const hoy = new Date();
      let estado = "disponible";

      if (fechaVencimiento < hoy) {
        estado = "vencido";
      } else if (
        fechaVencimiento.getTime() - hoy.getTime() <
        7 * 24 * 60 * 60 * 1000
      ) {
        estado = "por vencer";
      }

      const productoData = {
        ...producto,
        empresaId: user.uid,
        estado,
        fechaCreacion: new Date(),
        cantidad: parseInt(producto.cantidad),
        precio: parseFloat(producto.precio),
      };

      await addDoc(collection(db, "productos"), productoData);

      alert("Producto agregado correctamente");
      setProducto({
        nombre: "",
        descripcion: "",
        cantidad: "",
        precio: "",
        fechaVencimiento: "",
        estado: "disponible",
      });

      cargarProductos();
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Error al agregar el producto: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "productos", id));
      setProductos(productos.filter((p) => p.id !== id));
      alert("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar producto: " + error.message);
    } finally {
      setDeleting("");
    }
  };

  const handleStockChange = async (id, currentStock, delta) => {
    setUpdatingStock(id);
    try {
      const newStock = Math.max(0, currentStock + delta);
      await updateDoc(doc(db, "productos", id), { cantidad: newStock });
      setProductos(
        productos.map((p) => (p.id === id ? { ...p, cantidad: newStock } : p))
      );
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      alert("Error al actualizar stock: " + error.message);
    } finally {
      setUpdatingStock("");
    }
  };

  const productosFiltrados = productos.filter((producto) => {
    const cumpleEstado =
      filtroEstado === "todos" || producto.estado === filtroEstado;
    const cumpleNombre = producto.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());
    return cumpleEstado && cumpleNombre;
  });

  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "disponible":
        return "badge bg-success";
      case "por vencer":
        return "badge bg-warning";
      case "vencido":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const testConnection = async () => {
    try {
      const user = auth.currentUser;
      console.log("Usuario actual:", user);

      const productosRef = collection(db, "productos");
      const snapshot = await getDocs(productosRef);

      const info = `
        Usuario: ${user ? user.uid : "No autenticado"}
        Productos totales: ${snapshot.size}
        Productos del usuario: ${
          snapshot.docs.filter((doc) => doc.data().empresaId === user?.uid)
            .length
        }
      `;

      setDebugInfo(info);
      console.log(info);
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
      console.error("Error de prueba:", error);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-success">Agregar Productos</h2>
          <div className="d-flex gap-2">
            <button
              onClick={testConnection}
              className="btn btn-outline-info btn-sm"
            >
              Probar Conexión
            </button>
            <button
              onClick={() => navigate("/company/home")}
              className="btn btn-outline-secondary"
            >
              ← Volver al Perfil
            </button>
          </div>
        </div>

        {debugInfo && (
          <div className="alert alert-info mb-3">
            <strong>Información de Debug:</strong>
            <pre className="mb-0 mt-2">{debugInfo}</pre>
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Nuevo Producto</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre del Producto</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={producto.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Descripción (máximo 300 caracteres)
                    </label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      rows="3"
                      value={producto.descripcion}
                      onChange={handleInputChange}
                      maxLength="300"
                      required
                    />
                    <small className="text-muted">
                      {producto.descripcion.length}/300 caracteres
                    </small>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cantidad</label>
                        <input
                          type="number"
                          name="cantidad"
                          className="form-control"
                          value={producto.cantidad}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Precio</label>
                        <input
                          type="number"
                          name="precio"
                          className="form-control"
                          value={producto.precio}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      name="fechaVencimiento"
                      className="form-control"
                      value={producto.fechaVencimiento}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={saving}
                  >
                    {saving ? "Agregando..." : "Agregar Producto"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Mis Productos</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="row">
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                      >
                        <option value="todos">Todos los estados</option>
                        <option value="disponible">Disponible</option>
                        <option value="por vencer">Por vencer</option>
                        <option value="vencido">Vencido</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre..."
                        value={filtroNombre}
                        onChange={(e) => setFiltroNombre(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={productosPorPagina}
                        onChange={(e) =>
                          setProductosPorPagina(parseInt(e.target.value))
                        }
                      >
                        <option value={5}>5 por página</option>
                        <option value={10}>10 por página</option>
                        <option value={15}>15 por página</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : productosFiltrados.length === 0 ? (
                  <div className="text-center">
                    <p className="text-muted">
                      {filtroEstado !== "todos" || filtroNombre
                        ? "No se encontraron productos con los filtros aplicados"
                        : "No hay productos registrados. ¡Agrega tu primer producto!"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosPaginados.map((prod) => (
                            <tr key={prod.id}>
                              <td>{prod.nombre || "Sin nombre"}</td>
                              <td>{prod.cantidad || 0}</td>
                              <td>${prod.precio || 0}</td>
                              <td>
                                <span className={getEstadoClass(prod.estado)}>
                                  {prod.estado || "disponible"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() =>
                                      handleStockChange(
                                        prod.id,
                                        prod.cantidad || 0,
                                        -1
                                      )
                                    }
                                    disabled={
                                      updatingStock === prod.id ||
                                      (prod.cantidad || 0) <= 0
                                    }
                                  >
                                    -
                                  </button>
                                  <span>{prod.cantidad || 0}</span>
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() =>
                                      handleStockChange(
                                        prod.id,
                                        prod.cantidad || 0,
                                        1
                                      )
                                    }
                                    disabled={updatingStock === prod.id}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPaginas > 1 && (
                      <nav>
                        <ul className="pagination pagination-sm justify-content-center">
                          <li
                            className={`page-item ${
                              paginaActual === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setPaginaActual(paginaActual - 1)}
                              disabled={paginaActual === 1}
                            >
                              Anterior
                            </button>
                          </li>
                          {[...Array(totalPaginas)].map((_, index) => (
                            <li
                              key={index}
                              className={`page-item ${
                                paginaActual === index + 1 ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setPaginaActual(index + 1)}
                              >
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${
                              paginaActual === totalPaginas ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setPaginaActual(paginaActual + 1)}
                              disabled={paginaActual === totalPaginas}
                            >
                              Siguiente
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
