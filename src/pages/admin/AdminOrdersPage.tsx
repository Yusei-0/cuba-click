import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";
import {
  ChevronDown,
  ChevronUp,
  Package,
  User,
  MapPin,
  Search,
} from "lucide-react";

type Order = Database["public"]["Tables"]["pedidos"]["Row"] & {
  detalles_pedido: (Database["public"]["Tables"]["detalles_pedido"]["Row"] & {
    productos: Database["public"]["Tables"]["productos"]["Row"];
  })[];
  municipios: Database["public"]["Tables"]["municipios"]["Row"];
  metodos_pago: Database["public"]["Tables"]["metodos_pago"]["Row"];
  monedas: Database["public"]["Tables"]["monedas"]["Row"];
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todos");

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("pedidos")
      .select(
        `
            *,
            detalles_pedido (
                *,
                productos (nombre, foto_url)
            ),
            municipios (nombre),
            metodos_pago (nombre),
            monedas (codigo)
        `,
      )
      .order("created_at", { ascending: false });

    if (filterStatus !== "todos") {
      query = query.eq("estado", filterStatus);
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching orders:", error);
    else setOrders((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ estado: newStatus })
        .eq("id", id);
      if (error) throw error;

      // Optimistic update
      setOrders(
        orders.map((o) => (o.id === id ? { ...o, estado: newStatus } : o)),
      );
    } catch (e) {
      console.error("Error updating status:", e);
      alert("Error al actualizar estado");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Administración de Pedidos</h1>

      {/* Filters */}
      <div className="flex justify-between items-center bg-base-100 p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-2 items-center">
          <span className="font-bold">Filtrar por estado:</span>
          <select
            className="select select-bordered select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchOrders}>
          Refrescar
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 bg-base-100 rounded-box">
            No hay pedidos encontrados.
          </div>
        ) : (
          orders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderItem({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Status colors
  const statusColor =
    {
      pendiente: "badge-warning",
      pagado: "badge-info",
      completado: "badge-success",
      cancelado: "badge-error",
    }[order.estado || "pendiente"] || "badge-ghost";

  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Header info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg">#{order.id.slice(0, 8)}</h3>
              <span className={`badge ${statusColor}`}>
                {order.estado?.toUpperCase()}
              </span>
              <span className="text-sm text-gray-400">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-gray-500" />
                {order.cliente_nombre} ({order.cliente_telefono})
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-primary">
                  ${(order.total_productos + order.total_envio).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <select
              className="select select-bordered select-sm w-32"
              value={order.estado || "pendiente"}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <button
              className="btn btn-circle btn-sm btn-ghost"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-base-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Products */}
              <div>
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4" /> Productos
                </h4>
                <ul className="space-y-2">
                  {order.detalles_pedido.map((detail: any) => (
                    <li key={detail.id} className="flex gap-3 text-sm">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded">
                          <img
                            src={
                              detail.productos?.foto_url ||
                              "https://placehold.co/100"
                            }
                            alt="img"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {detail.productos?.nombre}
                        </p>
                        <p className="text-gray-500">
                          {detail.cantidad} x ${detail.precio_unitario}
                        </p>
                      </div>
                      <p className="font-bold">
                        ${detail.cantidad * detail.precio_unitario}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipment Info */}
              <div className="text-sm space-y-2">
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" /> Datos de Envío
                </h4>
                <p>
                  <span className="font-semibold">Municipio:</span>{" "}
                  {order.municipios?.nombre}
                </p>
                <p>
                  <span className="font-semibold">Dirección:</span>{" "}
                  {order.direccion_detalle}
                </p>
                <p>
                  <span className="font-semibold">Método de Pago:</span>{" "}
                  {order.metodos_pago?.nombre}
                </p>
                <div className="divider my-2"></div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.total_productos}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${order.total_envio}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Total:</span>
                  <span>${order.total_productos + order.total_envio}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
