import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { Search, Package } from "lucide-react";

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
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Rastrear Pedido</h1>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Ingrese el ID de su pedido (ej. a1b2...)"
              className="input input-bordered flex-grow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <Search className="w-5 h-5" />
              )}
              Buscar
            </button>
          </form>
          {error && <p className="text-error mt-2">{error}</p>}
        </div>
      </div>

      {order && (
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="card-title text-2xl mb-1">
                  Pedido #{order.id.slice(0, 8)}
                </h2>
                <p className="text-gray-500 text-sm">
                  Realizado el {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`badge badge-lg ${
                  order.estado === "completado"
                    ? "badge-success"
                    : order.estado === "cancelado"
                      ? "badge-error"
                      : "badge-warning"
                }`}
              >
                {order.estado?.toUpperCase()}
              </div>
            </div>

            <div className="divider"></div>

            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Package className="w-5 h-5" /> Productos
              </h3>
              <ul className="space-y-3">
                {order.detalles_pedido.map((detalle: any) => (
                  <li
                    key={detalle.id}
                    className="flex justify-between items-center"
                  >
                    <span className="flex items-center gap-2">
                      <span className="badge badge-sm badge-ghost">
                        {detalle.cantidad}x
                      </span>
                      {detalle.productos?.nombre || "Producto desconocido"}
                    </span>
                    <span>${detalle.precio_unitario * detalle.cantidad}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="divider"></div>

            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-500 max-w-xs">
                <p>
                  <span className="font-bold">Dirección:</span>{" "}
                  {order.direccion_detalle}
                </p>
                <p>
                  <span className="font-bold">Cliente:</span>{" "}
                  {order.cliente_nombre}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Envío: ${order.total_envio}
                </p>
                <p className="text-2xl font-bold text-primary">
                  Total: ${order.total_productos + order.total_envio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
