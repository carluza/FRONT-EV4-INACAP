import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import ClientSidebar from "../../components/ClientSidebar";

const RequestsClient = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [solicitudesPorPagina, setSolicitudesPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    cargarSolicitudes();
    // eslint-disable-next-line
  }, []);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const solicitudesRef = collection(db, "solicitudes");
      const q = query(solicitudesRef, where("clienteId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const solicitudesData = [];
      for (const docSnap of querySnapshot.docs) {
        const solicitud = { id: docSnap.id, ...docSnap.data() };
        // Info empresa
        if (solicitud.empresaId) {
          try {
            const empresaDoc = await getDoc(
              doc(db, "empresas", solicitud.empresaId)
            );
            if (empresaDoc.exists()) solicitud.empresaInfo = empresaDoc.data();
          } catch (error) {}
        }
        // Info productos
        if (solicitud.productos) {
          solicitud.productosInfo = [];
          for (const prod of solicitud.productos) {
            try {
              const prodDoc = await getDoc(
                doc(db, "productos", prod.productoId)
              );
              if (prodDoc.exists())
                solicitud.productosInfo.push({ ...prodDoc.data(), ...prod });
            } catch (error) {}
          }
        }
        solicitudesData.push(solicitud);
      }
      setSolicitudes(solicitudesData);
    } catch (error) {
      alert("Error al cargar solicitudes");
    } finally {
      setLoading(false);
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
      <ClientSidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Mis Solicitudes de Compra</h2>
        <div className="card">
          <div className="card-header">
            <div className="row align-items-center">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todas</option>
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
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
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
                          <th>Empresa</th>
                          <th>Productos</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                          <th>Respuesta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudesPaginadas.map((solicitud) => (
                          <tr key={solicitud.id}>
                            <td>
                              <div>
                                <strong>
                                  {solicitud.empresaInfo?.nombreEmpresa ||
                                    solicitud.empresaInfo?.nombre ||
                                    "Empresa"}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  {solicitud.empresaInfo?.correo || "-"}
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
                              {solicitud.estado !== "pendiente" &&
                              solicitud.fechaRespuesta ? (
                                <small className="text-muted">
                                  {solicitud.estado === "aprobada"
                                    ? "Aprobada"
                                    : "Rechazada"}{" "}
                                  el {formatDate(solicitud.fechaRespuesta)}
                                </small>
                              ) : (
                                <span className="text-muted">-</span>
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

export default RequestsClient;
