import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useOrdersStore, type LocalOrder } from "../store/useOrdersStore";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Header } from "../components/layout/Header";
import {
  Package,
  Copy,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatPrice } from "../lib/utils";
import { OrderCardSkeleton } from "../components/ui/skeletons/OrderCardSkeleton";

const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  pagado: {
    label: "Pagado",
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  confirmado: { // Keeping for backward compatibility if needed, though likely deprecated
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
    icon: Package, // Using Package icon for delivered if CheckCircle is reused
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  completado: {
    label: "Completado",
    icon: CheckCircle,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

function OrderCardItem({ order }: { order: LocalOrder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const statusConfig = STATUS_CONFIG[order.estado] || STATUS_CONFIG["pendiente"];
  const StatusIcon = statusConfig.icon;

  const handleCopy = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(order.id);
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
    }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300">
      {/* Accordion Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${statusConfig.bgColor} rounded-full flex items-center justify-center shrink-0`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className="text-xs text-gray-400">• {formatDate(order.created_at)}</span>
            </div>
            <p className="font-medium text-gray-900 text-sm line-clamp-1">
               {order.producto_nombre}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(order.total, order.moneda)}
            </p>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Accordion Content */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          {/* Tracking */}
          <div className="px-4 py-3 bg-blue-50/50 border-y border-blue-50 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Tracking:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-700 tracking-wider">
                {order.codigo_tracking}
              </span>
              <button
                onClick={(e) => handleCopy(order.codigo_tracking, e)}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
              >
                {copiedId === order.id ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Product Details */}
            <div className="flex gap-4">
              <img
                src={order.producto_foto || "/placeholder.png"}
                alt={order.producto_nombre}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
              />
              <div className="flex-1 min-w-0 text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium">{formatPrice(order.precio_unitario, order.moneda)}</span>
                </div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-gray-500">Cantidad:</span>
                  <span className="font-medium">x{order.cantidad}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">Envío:</span>
                  <span className={order.costo_envio === 0 ? "text-green-600 font-medium" : "font-medium"}>
                    {order.costo_envio === 0 ? "Gratis" : formatPrice(order.costo_envio, order.moneda)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Details */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <p className="text-gray-500 mb-0.5">Cliente</p>
                <p className="font-medium text-gray-900 truncate">{order.cliente_nombre}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Teléfono</p>
                <p className="font-medium text-gray-900">{order.cliente_telefono}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Municipio</p>
                <p className="font-medium text-gray-900">{order.municipio_nombre}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Pago</p>
                <p className="font-medium text-gray-900">{order.metodo_pago}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ... (OrderCardItem code remains above)

export function OrdersPage() {
  const { orders, fetchOrders, loading } = useOrdersStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(
    (order) =>
      order.codigo_tracking.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <MobileLayout>
        <div className="bg-white min-h-screen">
          {/* Header */}
          <Header />

          {/* Page Title and Search */}
          <div className="px-4 pt-4 pb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Mis Pedidos</h1>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código o producto..."
                className="input input-bordered w-full pl-10 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Orders List */}
          <div className="px-4 pb-6">
            {loading ? (
              <div className="space-y-3">
                 {[1, 2, 3, 4, 5].map((i) => (
                    <OrderCardSkeleton key={i} />
                 ))}
              </div>
            ) : filteredOrders.length === 0 ? (
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
                  <Link
                    to="/"
                    className="btn btn-primary text-white"
                  >
                    Explorar Productos
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3 pb-20">
                {filteredOrders.map((order) => (
                  <OrderCardItem key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
      
      {/* Outlet for nested routes */}
      <Outlet />
    </>
  );
}
