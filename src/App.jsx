import { useEffect, useState } from "react";
import "./App.css";

const PRODUCTOS = [
  {
    id: 1,
    nombre: "Café de Huila 500 g",
    precio: 28500,
    stock: 8,
  },
  {
    id: 2,
    nombre: "Panela orgánica 1 kg",
    precio: 9800,
    stock: 3,
  },
  {
    id: 3,
    nombre: "Arepa de choclo x6",
    precio: 12000,
    stock: 12,
  },
  {
    id: 4,
    nombre: "Chocolate de mesa",
    precio: 15400,
    stock: 1,
  },
  {
    id: 5,
    nombre: "Bocadillo veleño",
    precio: 6500,
    stock: 20,
  },
  {
    id: 6,
    nombre: "Aguardiente 750 ml",
    precio: 62000,
    stock: 5,
  },
];

function dinero(valor) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function App() {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carritoReact");

    return guardado ? JSON.parse(guardado) : [];
  });

  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("carritoReact", JSON.stringify(carrito));
  }, [carrito]);

  function mostrarMensaje(mensaje, tipo = "info", confirmar = null) {
    setToast({
      mensaje,
      tipo,
      confirmar,
    });
  }

  function cerrarMensaje() {
    setToast(null);
  }

  function cantidadEnCarrito(id) {
    const producto = carrito.find((item) => item.id === id);
    return producto ? producto.cantidad : 0;
  }

  function agregar(producto, cantidad) {
    const cantidadActual = cantidadEnCarrito(producto.id);
    const disponible = producto.stock - cantidadActual;

    if (cantidad < 1) {
      mostrarMensaje(
        "La cantidad mínima es 1. Si deseas eliminar el producto, usa el botón eliminar."
      );
      return;
    }

    if (cantidad > disponible) {
      mostrarMensaje("Este es el máximo de producto disponible en stock", "error");
      cantidad = disponible;
    }

    if (cantidad <= 0) {
      mostrarMensaje("Este producto ya no tiene stock disponible.", "error");
      return;
    }

    setCarrito((carritoAnterior) => {
      const existe = carritoAnterior.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return carritoAnterior.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + cantidad,
              }
            : item
        );
      }

      return [
        ...carritoAnterior,
        {
          ...producto,
          cantidad,
        },
      ];
    });

    mostrarMensaje("Producto agregado al carrito", "success");
  }

  function cambiarCantidad(id, nuevaCantidad) {
    const producto = PRODUCTOS.find((item) => item.id === id);

    if (!producto) return;

    if (nuevaCantidad < 1) {
      mostrarMensaje(
        "La cantidad mínima es 1. ¿Deseas eliminar este producto?",
        "warning",
        () => eliminarProducto(id)
      );

      return;
    }

    if (nuevaCantidad > producto.stock) {
      nuevaCantidad = producto.stock;

      mostrarMensaje(
        "Este es el máximo de producto disponible en stock",
        "error"
      );
    }

    setCarrito((carritoAnterior) =>
      carritoAnterior.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: nuevaCantidad,
            }
          : item
      )
    );
  }

  function eliminarProducto(id) {
    setCarrito((carritoAnterior) =>
      carritoAnterior.filter((item) => item.id !== id)
    );

    cerrarMensaje();
  }

  const totalUnidades = carrito.reduce(
    (total, producto) => total + producto.cantidad,
    0
  );

  const totalCompra = carrito.reduce(
    (total, producto) =>
      total + producto.precio * producto.cantidad,
    0
  );

  return (
    <div className="app">

      <header className="navbar">
        <div className="nombre-tienda">
          🛒 Tienda Palmira
        </div>

        <button
          className="boton-carrito"
          onClick={() => setMostrarCarrito(true)}
        >
          🛒 Carrito

          {totalUnidades > 0 && (
            <span className="badge">
              {totalUnidades}
            </span>
          )}
        </button>
      </header>

      <main className="contenido">

        <h1>Productos</h1>

        <div className="productos">

          {PRODUCTOS.map((producto) => {

            const cantidadActual = cantidadEnCarrito(producto.id);
            const stockDisponible =
              producto.stock - cantidadActual;

            return (
              <div className="producto" key={producto.id}>

                <div className="producto-icono">
                  🛍️
                </div>

                <h2>{producto.nombre}</h2>

                <p className="precio">
                  {dinero(producto.precio)}
                </p>

                <p>
                  Stock disponible:{" "}
                  <strong>{stockDisponible}</strong>
                </p>

                <input
                  className="cantidad"
                  type="number"
                  min="1"
                  value="1"
                  readOnly
                />

                <button
                  className="boton-agregar"
                  disabled={stockDisponible <= 0}
                  onClick={() => agregar(producto, 1)}
                >
                  {stockDisponible <= 0
                    ? "Sin stock"
                    : "Agregar"}
                </button>

              </div>
            );
          })}

        </div>

      </main>

      {mostrarCarrito && (

        <div className="fondo-modal">

          <div className="carrito">

            <div className="carrito-header">

              <h2>Mi carrito</h2>

              <button
                className="cerrar"
                onClick={() => setMostrarCarrito(false)}
              >
                ✕
              </button>

            </div>

            {carrito.length === 0 ? (

              <div className="carrito-vacio">
                <p>Tu carrito está vacío.</p>
              </div>

            ) : (

              <>
                <div className="items-carrito">

                  {carrito.map((producto) => (

                    <div
                      className="item-carrito"
                      key={producto.id}
                    >

                      <div>
                        <h3>{producto.nombre}</h3>

                        <p>
                          {dinero(producto.precio)}
                        </p>
                      </div>

                      <div className="controles">

                        <button
                          onClick={() =>
                            cambiarCantidad(
                              producto.id,
                              producto.cantidad - 1
                            )
                          }
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={producto.cantidad}
                          onChange={(e) =>
                            cambiarCantidad(
                              producto.id,
                              Number(e.target.value)
                            )
                          }
                        />

                        <button
                          onClick={() =>
                            cambiarCantidad(
                              producto.id,
                              producto.cantidad + 1
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                      <strong>
                        {dinero(
                          producto.precio *
                            producto.cantidad
                        )}
                      </strong>

                      <button
                        className="eliminar"
                        onClick={() =>
                          eliminarProducto(producto.id)
                        }
                      >
                        Eliminar
                      </button>

                    </div>

                  ))}

                </div>

                <div className="resumen">

                  <p>
                    Total unidades:
                    <strong>{totalUnidades}</strong>
                  </p>

                  <p className="total">
                    Total:
                    <strong>
                      {dinero(totalCompra)}
                    </strong>
                  </p>

                </div>

              </>

            )}

          </div>

        </div>

      )}

      {toast && (

        <div className={`toast ${toast.tipo}`}>

          <span>{toast.mensaje}</span>

          <button onClick={cerrarMensaje}>
            ✕
          </button>

          {toast.confirmar && (

            <button
              className="confirmar"
              onClick={toast.confirmar}
            >
              Sí, eliminar
            </button>

          )}

        </div>

      )}

    </div>
  );
}

export default App;