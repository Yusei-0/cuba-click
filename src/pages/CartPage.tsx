import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";

export function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <p className="mb-8 text-gray-500">
          Parece que aún no has añadido productos.
        </p>
        <Link to="/catalogo" className="btn btn-primary">
          Ir de compras
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="grow space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card card-side bg-base-100 shadow-sm border border-base-200 p-4 items-center"
            >
              <figure className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {item.foto_url ? (
                  <img
                    src={item.foto_url}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-xs text-gray-400">
                    Sin img
                  </div>
                )}
              </figure>
              <div className="card-body py-0 px-4 grow block sm:flex sm:justify-between sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <h3 className="card-title text-base">{item.nombre}</h3>
                  <p className="text-primary font-bold">
                    ${item.precio_final * item.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    ${item.precio_final} / unidad
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="join border border-base-300">
                    <button
                      className="join-item btn btn-xs btn-ghost"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="join-item px-2 text-sm flex items-center bg-base-100">
                      {item.quantity}
                    </span>
                    <button
                      className="join-item btn btn-xs btn-ghost"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              className="btn btn-ghost btn-sm text-error"
              onClick={clearCart}
            >
              Vaciar Carrito
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Resumen del Pedido</h3>

              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${totalPrice()}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Envío</span>
                <span className="text-sm italic text-gray-500">
                  Calculado en el siguiente paso
                </span>
              </div>

              <div className="divider my-2"></div>

              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span>${totalPrice()}</span>
              </div>

              <button
                className="btn btn-primary w-full gap-2"
                onClick={() => navigate("/checkout")}
              >
                Continuar Compra
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
