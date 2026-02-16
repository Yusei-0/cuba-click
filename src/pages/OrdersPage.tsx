import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { Search, Package } from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Header } from "../components/layout/Header";

type Order = Database["public"]["Tables"]["pedidos"]["Row"] & {
  detalles_pedido: (Database["public"]["Tables"]["detalles_pedido"]["Row"] & {
    productos: Database["public"]["Tables"]["productos"]["Row"] | null;
  })[];
};

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // Since we don't have Auth, we rely on the UUID ID for "security" (it's hard to guess).
      // A phone number search would be insecure without SMS verification.
      // Users should have saved their Order ID from the checkout page.

      // Actually, let's allow searching by ID for now.
      const { data, error } = await supabase
        .from("pedidos")
        .select("*, detalles_pedido(*, productos(*))")
        .eq("id", searchTerm.trim())
        .single();

      if (error) throw error;
      if (!data) {
        setError("Pedido no encontrado. Verifique el ID.");
      } else {
        setOrder(data as any);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        "No se pudo encontrar el pedido. Asegúrese de que el ID es correcto.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-4">
        <Header />
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Rastrear Pedido</h1>

          <div className="card bg-white shadow-sm border border-gray-100 mb-8 rounded-2xl">
            <div className="card-body p-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ID del pedido (ej. a1b2...)"
                  className="input input-bordered grow bg-gray-50 focus:bg-white transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-square"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <Search className="w-5 h-5 text-white" />
                  )}
                </button>
              </form>
              {error && <p className="text-error text-xs mt-2 text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
            </div>
          </div>

          {order && (
            <div className="card bg-white shadow-md border border-gray-100 rounded-2xl overflow-hidden">
              <div className="card-body p-5">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Pedido #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`badge badge-lg border-0 text-white font-bold ${
                      order.estado === "completado"
                        ? "bg-green-500"
                        : order.estado === "cancelado"
                          ? "bg-red-500"
                          : "bg-amber-500"
                    }`}
                  >
                    {order.estado?.toUpperCase()}
                  </div>
                </div>

                <div className="divider my-0"></div>

                <div className="space-y-4 py-4">
                  <h3 className="font-bold flex items-center gap-2 text-gray-800">
                    <Package className="w-5 h-5 text-primary" /> Productos
                  </h3>
                  <ul className="space-y-3">
                    {order.detalles_pedido.map((detalle: any) => (
                      <li
                        key={detalle.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                {detalle.cantidad}
                            </span>
                          <span className="text-gray-700 font-medium line-clamp-1 max-w-[160px]">
                              {detalle.productos?.nombre || "Producto desconocido"}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">${detalle.precio_unitario * detalle.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="divider my-0"></div>

                <div className="bg-gray-50 -mx-5 -mb-5 p-5">
                    <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-500 max-w-[50%]">
                        <p className="truncate">
                        <span className="font-bold text-gray-700">Dirección:</span>{" "}
                        {order.direccion_detalle}
                        </p>
                        <p className="truncate">
                        <span className="font-bold text-gray-700">Cliente:</span>{" "}
                        {order.cliente_nombre}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">
                        Envío: ${order.total_envio}
                        </p>
                        <p className="text-xl font-extrabold text-primary">
                        Total: ${order.total_productos + order.total_envio}
                        </p>
                    </div>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
