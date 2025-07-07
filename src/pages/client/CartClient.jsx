import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import ClientSidebar from "../../components/ClientSidebar";

const CartClient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const carrito = location.state?.carrito || [];
  const [sending, setSending] = React.useState(false);

  const handleConfirmar = async () => {
    if (carrito.length === 0) return;
    setSending(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión");
        navigate("/client/login");
        return;
      }
      // Agrupar productos por empresa
      const empresas = {};
      carrito.forEach((item) => {
        if (!empresas[item.empresaId]) empresas[item.empresaId] = [];
        empresas[item.empresaId].push(item);
      });
      // Crear una solicitud por empresa
      const batch = Object.entries(empresas).map(async ([empresaId, items]) => {
        await addDoc(collection(db, "solicitudes"), {
          empresaId,
          clienteId: user.uid,
          productos: items.map((i) => ({
            productoId: i.id,
            cantidad: i.cantidad,
          })),
          estado: "pendiente",
          fechaSolicitud: Timestamp.now(),
        });
      });
      await Promise.all(batch);
      alert("Solicitud enviada correctamente");
      navigate("/client/home");
    } catch (error) {
      alert("Error al enviar la solicitud");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="d-flex">
      <ClientSidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Confirmar Solicitud de Compra</h2>
        {carrito.length === 0 ? (
          <div className="alert alert-warning">El carrito está vacío.</div>
        ) : (
          <>
            <ul className="list-group mb-3">
              {carrito.map((item) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={item.id}
                >
                  <span>
                    <strong>{item.nombre}</strong> x {item.cantidad}
                  </span>
                  <span>${item.precio * item.cantidad}</span>
                </li>
              ))}
            </ul>
            <div className="mb-3 text-end">
              <strong>
                Total: $
                {carrito.reduce(
                  (acc, item) => acc + item.precio * item.cantidad,
                  0
                )}
              </strong>
            </div>
            <button
              className="btn btn-success w-100"
              onClick={handleConfirmar}
              disabled={sending}
            >
              {sending ? "Enviando..." : "Confirmar y Enviar Solicitud"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartClient;
