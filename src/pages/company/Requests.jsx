import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import CompanySidebar from "../../components/Sidebar";

const Requests = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [solicitudesPorPagina, setSolicitudesPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/company/login");
      return;
    }
    cargarSolicitudes();
  }, [navigate]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const solicitudesRef = collection(db, "solicitudes");
      const q = query(solicitudesRef, where("empresaId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const solicitudesData = [];
      for (const docSnap of querySnapshot.docs) {
        const solicitud = { id: docSnap.id, ...docSnap.data() };
        // Obtener información del cliente
        if (solicitud.clienteId) {
          try {
            const clienteDoc = await getDoc(
              doc(db, "clientes", solicitud.clienteId)
            );
            if (clienteDoc.exists()) {
              solicitud.clienteInfo = clienteDoc.data();
            }
          } catch (error) {}
        }
        // Obtener información de productos
        if (solicitud.productos) {
          solicitud.productosInfo = [];
          for (const prod of solicitud.productos) {
            try {
              const prodDoc = await getDoc(
                doc(db, "productos", prod.productoId)
              );
              if (prodDoc.exists()) {
                solicitud.productosInfo.push({ ...prodDoc.data(), ...prod });
              }
            } catch (error) {}
          }
        }
        solicitudesData.push(solicitud);
      }
      setSolicitudes(solicitudesData);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      alert("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (solicitudId) => {
    setProcessing(true);
    try {
      // Obtener la solicitud
      const solicitudRef = doc(db, "solicitudes", solicitudId);
      const solicitudSnap = await getDoc(solicitudRef);
      if (!solicitudSnap.exists()) throw new Error("Solicitud no encontrada");
      const solicitud = solicitudSnap.data();
      // Verificar stock de todos los productos
      for (const prod of solicitud.productos) {
        const prodRef = doc(db, "productos", prod.productoId);
        const prodSnap = await getDoc(prodRef);
        if (!prodSnap.exists()) throw new Error("Producto no encontrado");
        const prodData = prodSnap.data();
        if (prodData.cantidad < prod.cantidad) {
          alert(`Stock insuficiente para el producto ${prodData.nombre}`);
          setProcessing(false);
          return;
        }
      }
      // Descontar stock
      for (const prod of solicitud.productos) {
        const prodRef = doc(db, "productos", prod.productoId);
        const prodSnap = await getDoc(prodRef);
        const prodData = prodSnap.data();
        await updateDoc(prodRef, {
          cantidad: prodData.cantidad - prod.cantidad,
        });
      }
      // Aprobar solicitud
      await updateDoc(solicitudRef, {
        estado: "aprobada",
        fechaRespuesta: new Date(),
      });
      cargarSolicitudes();
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
      alert("Error al aprobar la solicitud");
    } finally {
      setProcessing(false);
    }
  };

  const handleRechazar = async (solicitudId) => {
    setProcessing(true);
    try {
      const solicitudRef = doc(db, "solicitudes", solicitudId);
      await updateDoc(solicitudRef, {
        estado: "rechazada",
        fechaRespuesta: new Date(),
      });
      cargarSolicitudes();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      alert("Error al rechazar la solicitud");
    } finally {
      setProcessing(false);
    }
  };

  const solicitudesFiltradas = solicitudes.filter(
    (solicitud) => filtroEstado === "todos" || solicitud.estado === filtroEstado
  );

  const solicitudesPaginadas = solicitudesFiltradas.slice(
    (paginaActual - 1) * solicitudesPorPagina,
    paginaActual * solicitudesPorPagina
  );

  const totalPaginas = Math.ceil(
    solicitudesFiltradas.length / solicitudesPorPagina
  );

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "pendiente":
        return "badge bg-warning";
      case "aprobada":
        return "badge bg-success";
      case "rechazada":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date.toDate ? date.toDate() : date).toLocaleDateString(
      "es-ES"
    );
  };

  return (
    <div className="d-flex">
      <CompanySidebar />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-success">Solicitudes de Productos</h2>
          <button
            onClick={() => navigate("/company/home")}
            className="btn btn-outline-secondary"
          >
            ← Volver al Perfil
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="row align-items-center">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todas las solicitudes</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobada">Aprobadas</option>
                  <option value="rechazada">Rechazadas</option>
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={solicitudesPorPagina}
                  onChange={(e) =>
                    setSolicitudesPorPagina(parseInt(e.target.value))
                  }
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={15}>15 por página</option>
                </select>
              </div>
              <div className="col-md-4 text-end">
                <span className="text-muted">
                  {solicitudesFiltradas.length} solicitudes encontradas
                </span>
              </div>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              <>
                {solicitudesPaginadas.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      No hay solicitudes para mostrar
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Productos Solicitados</th>
                          <th>Fecha Solicitud</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudesPaginadas.map((solicitud) => (
                          <tr key={solicitud.id}>
                            <td>
                              <div>
                                <strong>
                                  {solicitud.clienteInfo?.nombres || "Cliente"}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {solicitud.clienteInfo?.correo ||
                                    "Email no disponible"}
                                </small>
                              </div>
                            </td>
                            <td>
                              <ul className="mb-0">
                                {solicitud.productosInfo?.map((prod, idx) => (
                                  <li key={idx}>
                                    {prod.nombre} x {prod.cantidad} ($
                                    {prod.precio} c/u)
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td>
                              <small>
                                {formatDate(solicitud.fechaSolicitud)}
                              </small>
                            </td>
                            <td>
                              <span
                                className={getEstadoClass(solicitud.estado)}
                              >
                                {solicitud.estado || "pendiente"}
                              </span>
                            </td>
                            <td>
                              {solicitud.estado === "pendiente" && (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-success"
                                    onClick={() => handleAprobar(solicitud.id)}
                                    disabled={processing}
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleRechazar(solicitud.id)}
                                    disabled={processing}
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              )}
                              {solicitud.estado !== "pendiente" && (
                                <small className="text-muted">
                                  Respondida el{" "}
                                  {formatDate(solicitud.fechaRespuesta)}
                                </small>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

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
  );
};

export default Requests;
