import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "../../components/ClientSidebar";

const ProductsClient = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const productosCol = collection(db, "productos");
        const q = query(productosCol, where("cantidad", ">", 0));
        const productosSnap = await getDocs(q);
        setProductos(
          productosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        alert("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      } else {
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, cantidad: Math.max(1, p.cantidad + delta) } : p
        )
        .filter((p) => p.cantidad > 0)
    );
  };

  const handleEnviarSolicitud = () => {
    navigate("/client/cart", { state: { carrito } });
  };

  return (
    <div className="d-flex">
      <ClientSidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="text-success mb-4">Productos Disponibles</h2>
        <button
          className="btn btn-outline-primary mb-3"
          onClick={() => setShowCart((v) => !v)}
        >
          {showCart ? "Ocultar Carrito" : `Ver Carrito (${carrito.length})`}
        </button>
        {showCart && (
          <div className="card mb-4">
            <div className="card-header">Mi Carrito</div>
            <div className="card-body">
              {carrito.length === 0 ? (
                <div className="text-muted">El carrito está vacío</div>
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
                        <div>
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => cambiarCantidad(item.id, -1)}
                            disabled={item.cantidad <= 1}
                          >
                            -
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => cambiarCantidad(item.id, 1)}
                            disabled={item.cantidad >= item.cantidadOriginal}
                          >
                            +
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => quitarDelCarrito(item.id)}
                          >
                            Quitar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-success w-100"
                    onClick={handleEnviarSolicitud}
                  >
                    Enviar Solicitud de Compra
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {loading ? (
          <div className="text-center">Cargando productos...</div>
        ) : (
          <div className="row">
            {productos.map((prod) => (
              <div className="col-md-4 mb-3" key={prod.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{prod.nombre}</h5>
                    <p className="card-text">{prod.descripcion}</p>
                    <p className="card-text">
                      <strong>Precio:</strong> ${prod.precio}
                    </p>
                    <p className="card-text">
                      <strong>Stock:</strong> {prod.cantidad}
                    </p>
                    <button
                      className="btn btn-outline-success"
                      onClick={() =>
                        agregarAlCarrito({
                          ...prod,
                          cantidadOriginal: prod.cantidad,
                        })
                      }
                      disabled={prod.cantidad === 0}
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsClient;
