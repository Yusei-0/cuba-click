import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Header } from "../components/layout/Header";

export function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <MobileLayout>
        <div className="bg-white min-h-screen pb-4">
           <Header />
           <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    Parece que aún no has añadido productos. Explora nuestro catálogo.
                </p>
                <Link to="/catalogo" className="btn btn-primary rounded-xl px-8 shadow-lg shadow-blue-500/20">
                    Ir de compras
                </Link>
           </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-4">
        <Header />
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Carrito de Compras</h1>

          <div className="flex flex-col gap-6">
            {/* Cart Items */}
            <div className="grow space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card card-side bg-white shadow-sm border border-gray-100 p-3 items-center rounded-2xl"
                >
                  <figure className="w-20 h-20 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                    {item.foto_url ? (
                      <img
                        src={item.foto_url}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-xs text-gray-300">
                        Sin img
                      </div>
                    )}
                  </figure>
                  <div className="card-body py-0 px-3 grow block">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.nombre}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            ${item.precio_final} / ud
                          </p>
                       </div>
                       <button
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-error min-h-0 h-6 w-6 p-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <p className="text-primary font-bold">
                        ${item.precio_final * item.quantity}
                      </p>

                      <div className="join border border-gray-200 rounded-lg h-8">
                        <button
                          className="join-item btn btn-xs btn-ghost hover:bg-gray-50 border-r border-gray-200"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="join-item px-3 text-sm flex items-center bg-white font-medium">
                          {item.quantity}
                        </span>
                        <button
                          className="join-item btn btn-xs btn-ghost hover:bg-gray-50 border-l border-gray-200"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  className="text-xs text-error font-medium hover:underline flex items-center gap-1"
                  onClick={clearCart}
                >
                  <Trash2 className="h-3 w-3" />
                  Vaciar Carrito
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="shrink-0 mt-auto">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Resumen</h3>

                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totalPrice()}</span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-xs italic text-gray-400">
                    Por definir
                  </span>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between text-lg font-bold mb-6 text-gray-900">
                  <span>Total</span>
                  <span>${totalPrice()}</span>
                </div>

                <button
                  className="btn btn-primary w-full gap-2 rounded-xl shadow-lg shadow-blue-500/20"
                  onClick={() => navigate("/checkout")}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
