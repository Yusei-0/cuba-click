
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types/database.types";
import {
  User,
  MapPin,
  DollarSign,
  Search,
  Edit,
  Trash2,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react";
import { useToastStore } from "../../store/useToastStore";
// import debounce from "lodash/debounce"; // We can implement a simple debounce hook or utility if needed, or just use timeout

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
  const [totalOrders, setTotalOrders] = useState(0);
  const { addToast } = useToastStore();

  // --- Server-Side Filter States ---
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"id" | "client" | "tracking">("client");
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Modal States ---
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // --- Fetch Orders (Server Side) ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
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
                { count: 'exact' }
            );

        // 1. Filter by Status
        if (filterStatus !== "todos") {
            query = query.eq("estado", filterStatus);
        }

        // 2. Filter by Search
        if (searchQuery.trim()) {
            const term = searchQuery.trim();
            if (searchType === "id") {
                 // ID is UUID, exact match usually, or we can try casting if Supabase supports it, 
                 // but typically ID search is exact. Let's try partial if compatible, else exact.
                 // UUIDs don't support ilike easily without casting. 
                 // For now, let's assume strict ID match or maybe partial if we cast.
                 // Simplest: check if it looks like a UUID part or perform exact match.
                 query = query.or(`id.eq.${term},id.ilike.%${term}%`); // ilike might fail on uuid type
            } else if (searchType === "client") {
                query = query.or(`cliente_nombre.ilike.%${term}%,cliente_telefono.ilike.%${term}%`);
            } else if (searchType === "tracking") {
                query = query.ilike("codigo_tracking", `%${term}%`);
            }
        }

        // 3. Pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;

        setOrders((data as any) || []);
        setTotalOrders(count || 0);

    } catch (error) {
        console.error("Error fetching orders:", error);
        addToast("Error al cargar pedidos", "error");
    } finally {
        setLoading(false);
    }
  }, [currentPage, filterStatus, searchQuery, searchType, addToast]);

  // Debounced fetch or Effect
  useEffect(() => {
    // Reset page when filters change (except currentPage dependency itself)
    // We handle this by resetting page in the input handlers essentially, 
    // but here we just want to fetch when dependencies change.
    const timeout = setTimeout(() => {
        fetchOrders();
    }, 500); // Debounce search
    return () => clearTimeout(timeout);
  }, [fetchOrders]);


  // --- Handlers ---

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleFilterStatusChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const handleSearchTypeChange = (val: "id" | "client" | "tracking") => {
    setSearchType(val);
    setSearchQuery(""); // Optional: clear query when switching type to avoid confusing results? 
                        // Or keep it. Let's keep it but user might need to adjust.
    setCurrentPage(1);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("pedidos")
        .update({ estado: newStatus })
        .eq("id", id);
      if (error) throw error;

      setOrders(orders.map((o) => (o.id === id ? { ...o, estado: newStatus } : o)));
      addToast("Estado actualizado", "success");
    } catch (e) {
      console.error("Error updating status:", e);
      addToast("Error al actualizar estado", "error");
    }
  };

  // --- Delete Modal State ---
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const { error } = await supabase.from("pedidos").delete().eq("id", orderToDelete.id);
      if (error) throw error;

      setOrders(orders.filter((o) => o.id !== orderToDelete.id));
      setTotalOrders((prev) => prev - 1);
      addToast("Pedido eliminado correctamente", "success");
      setOrderToDelete(null);
    } catch (e) {
      console.error("Error deleting order:", e);
      addToast("Error al eliminar pedido", "error");
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
        const { error } = await supabase.from("pedidos")
            .update({ 
                estado: editingOrder.estado,
                codigo_tracking: editingOrder.codigo_tracking,
                direccion_detalle: editingOrder.direccion_detalle
            })
            .eq("id", editingOrder.id);
        
        if (error) throw error;
        setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
        setIsEditModalOpen(false);
        setEditingOrder(null);
        addToast("Pedido actualizado", "success");
    } catch (error) {
        console.error("Error updating order:", error);
        addToast("Error al actualizar", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pendiente': return 'badge-warning';
        case 'pagado': return 'badge-info';
        case 'enviado': return 'badge-primary';
        case 'entregado': return 'badge-success';
        case 'completado': return 'badge-success';
        case 'cancelado': return 'badge-error';
        default: return 'badge-ghost';
    }
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-gray-900">{totalOrders}</span> registros
        </div>
      </div>

      {/* --- Server Side Filters --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Search Type */}
        <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Buscar por</label>
            <select 
                className="select select-bordered select-sm w-full"
                value={searchType}
                onChange={(e) => handleSearchTypeChange(e.target.value as any)}
            >
                <option value="client">Cliente</option>
                <option value="id">ID Pedido</option>
                <option value="tracking">Tracking</option>
            </select>
        </div>

        {/* Search Input */}
        <div className="md:col-span-4 space-y-1">
             <label className="text-xs font-semibold text-gray-500 uppercase">
                {searchType === 'client' ? 'Nombre o Teléfono' : searchType === 'id' ? 'ID del Pedido' : 'Código de Rastreo'}
             </label>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Escribe para buscar..." 
                    className="input input-bordered input-sm w-full pl-9 focus:input-primary"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
             </div>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
            <select 
                className="select select-bordered select-sm w-full"
                value={filterStatus}
                onChange={(e) => handleFilterStatusChange(e.target.value)}
            >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
            </select>
        </div>
        
        {/* Refresh Button */}
        <div className="md:col-span-1 md:col-start-12 flex justify-end">
             <button className="btn btn-sm btn-ghost btn-circle tooltip" data-tip="Recargar" onClick={() => fetchOrders()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
            <table className="table w-full">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center py-20">
                                <span className="loading loading-spinner loading-lg text-primary"></span>
                            </td>
                        </tr>
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-20 text-gray-500">
                                <div className="flex flex-col items-center gap-2">
                                    <Package size={48} className="text-gray-300" />
                                    <p>No se encontraron resultados</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                {/* Order ID & Tracking */}
                                <td>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900" title={order.id}>#{order.id.slice(0, 8)}</span>
                                        {order.codigo_tracking && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded w-fit font-mono mt-1">
                                                {order.codigo_tracking}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                
                                {/* Customer */}
                                <td>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{order.cliente_nombre}</span>
                                        <span className="text-xs text-gray-500">{order.cliente_telefono}</span>
                                    </div>
                                </td>

                                {/* Status */}
                                <td>
                                    <div className={`badge ${getStatusColor(order.estado || 'pendiente')} badge-sm`}>
                                        {order.estado?.toUpperCase()}
                                    </div>
                                </td>

                                {/* Total */}
                                <td>
                                    <div className="font-bold text-gray-900">
                                        ${(order.total_productos + order.total_envio).toFixed(2)}
                                        <span className="text-xs font-normal text-gray-500 ml-1">
                                            {order.monedas?.codigo}
                                        </span>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>

                                {/* Actions */}
                                <td className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <button 
                                            onClick={() => setViewingOrder(order)}
                                            className="btn btn-ghost btn-xs text-info tooltip"
                                            data-tip="Ver"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setEditingOrder(order);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="btn btn-ghost btn-xs text-primary tooltip"
                                            data-tip="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(order)}
                                            className="btn btn-ghost btn-xs text-error tooltip"
                                            data-tip="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages || 1}
            </div>
            <div className="join">
                <button 
                    className="join-item btn btn-sm" 
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="join-item btn btn-sm bg-white pointer-events-none border-t border-b border-gray-300 px-4">
                    {currentPage}
                </div>
                <button 
                    className="join-item btn btn-sm" 
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* --- View Modal --- */}
      {viewingOrder && (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-2xl">Detalles del Pedido #{viewingOrder.id.slice(0, 8)}</h3>
                    <button onClick={() => setViewingOrder(null)} className="btn btn-sm btn-circle btn-ghost">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     {/* Client Info */}
                     <div className="space-y-4">
                        <div className="card bg-base-100 border border-base-200 p-4">
                            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                                <User size={18} /> Cliente
                            </h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold">Nombre:</span> {viewingOrder.cliente_nombre}</p>
                                <p><span className="font-semibold">Teléfono:</span> {viewingOrder.cliente_telefono}</p>
                                {/* <p><span className="font-semibold">CI:</span> {viewingOrder.cliente_ci || '-'}</p> */}
                            </div>
                        </div>

                        <div className="card bg-base-100 border border-base-200 p-4">
                            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                                <MapPin size={18} /> Envío
                            </h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold">Municipio:</span> {viewingOrder.municipios?.nombre}</p>
                                <p><span className="font-semibold">Dirección:</span> {viewingOrder.direccion_detalle}</p>
                                <p><span className="font-semibold">Tracking:</span> <span className="font-mono bg-gray-100 px-1 rounded">{viewingOrder.codigo_tracking || 'N/A'}</span></p>
                            </div>
                        </div>
                     </div>

                     {/* Products Info */}
                     <div className="space-y-4">
                        <div className="card bg-base-100 border border-base-200 p-4">
                            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                                <Package size={18} /> Productos
                            </h4>
                            <ul className="space-y-3">
                                {viewingOrder.detalles_pedido.map((detail: any) => (
                                    <li key={detail.id} className="flex gap-3 text-sm items-start">
                                        <img 
                                            src={detail.productos?.foto_url || "/placeholder.png"} 
                                            alt={detail.productos?.nombre}
                                            className="w-12 h-12 object-cover rounded bg-gray-100" 
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{detail.productos?.nombre}</p>
                                            <p className="text-gray-500">{detail.cantidad} x ${detail.precio_unitario}</p>
                                        </div>
                                        <p className="font-bold">${(detail.cantidad * detail.precio_unitario).toFixed(2)}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="card bg-primary text-primary-content p-4">
                            <h4 className="font-bold flex items-center gap-2 mb-3">
                                <DollarSign size={18} /> Resumen de Pago
                            </h4>
                             <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Método:</span>
                                    <span className="font-semibold">{viewingOrder.metodos_pago?.nombre}</span>
                                </div>
                                <div className="divider my-1 bg-primary-content/20"></div>
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${viewingOrder.total_productos.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Envío:</span>
                                    <span>${viewingOrder.total_envio.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg mt-2">
                                    <span>Total:</span>
                                    <span>${(viewingOrder.total_productos + viewingOrder.total_envio).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setViewingOrder(null)}></div>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {isEditModalOpen && editingOrder && (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Editar Pedido #{editingOrder.id.slice(0, 8)}</h3>
                <form onSubmit={handleUpdateOrder}>
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text">Estado del Pedido</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            value={editingOrder.estado || 'pendiente'}
                            onChange={(e) => setEditingOrder({...editingOrder, estado: e.target.value})}
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="pagado">Pagado</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>

                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text">Código de Tracking (Opcional)</span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full"
                            value={editingOrder.codigo_tracking || ''}
                            onChange={(e) => setEditingOrder({...editingOrder, codigo_tracking: e.target.value})}
                            placeholder="Ej: TRK-123456"
                        />
                    </div>

                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text">Dirección de Entrega</span>
                        </label>
                        <textarea 
                            className="textarea textarea-bordered h-24"
                            value={editingOrder.direccion_detalle}
                            onChange={(e) => setEditingOrder({...editingOrder, direccion_detalle: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}></div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {orderToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Eliminar Pedido</h3>
            <p className="py-4">
              ¿Estás seguro de que deseas eliminar permanentemente el pedido 
              <span className="font-bold ml-1">#{orderToDelete.id.slice(0, 8)}</span>?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">Esta acción no se puede deshacer.</span>
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setOrderToDelete(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-error" 
                onClick={confirmDelete}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setOrderToDelete(null)}></div>
        </div>
      )}

    </div>
  );
}

