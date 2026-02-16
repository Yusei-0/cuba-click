import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrdersStore } from "../store/useOrdersStore";
import {
  ArrowLeft,
  Package,
  Copy,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Search,
} from "lucide-react";
import { formatPrice } from "../lib/utils";

const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  confirmado: {
    label: "Confirmado",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  enviado: {
    label: "Enviado",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  entregado: {
    label: "Entregado",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders } = useOrdersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOrders = orders.filter(
    (order) =>
      order.codigo_tracking.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Mis Pedidos</h1>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código o producto..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {searchTerm ? "No se encontraron pedidos" : "No tienes pedidos"}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Intenta con otro término de búsqueda"
                : "Tus pedidos aparecerán aquí"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/")}
                className="btn btn-primary text-white"
              >
                Explorar Productos
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.estado];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order header */}
                  <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${statusConfig.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </p>
                        <p className={`text-sm font-bold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(order.total, order.moneda)}
                      </p>
                    </div>
                  </div>

                  {/* Tracking code */}
                  <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Código de Seguimiento:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600 tracking-wider">
                          {order.codigo_tracking}
                        </span>
                        <button
                          onClick={() => handleCopy(order.codigo_tracking, order.id)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Copiar código"
                        >
                          {copiedId === order.id ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={order.producto_foto || "/placeholder.png"}
                        alt={order.producto_nombre}
                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 truncate">
                          {order.producto_nombre}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Cantidad:</span> {order.cantidad}
                          </p>
                          <p>
                            <span className="font-medium">Precio unitario:</span>{" "}
                            {formatPrice(order.precio_unitario, order.moneda)}
                          </p>
                          <p>
                            <span className="font-medium">Envío:</span>{" "}
                            {order.costo_envio === 0 ? (
                              <span className="text-green-600 font-medium">Gratis</span>
                            ) : (
                              formatPrice(order.costo_envio, order.moneda)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-medium text-gray-900">
                          {order.cliente_nombre}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium text-gray-900">
                          {order.cliente_telefono}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Municipio:</span>
                        <span className="font-medium text-gray-900">
                          {order.municipio_nombre}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Método de pago:</span>
                        <span className="font-medium text-gray-900">
                          {order.metodo_pago}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
