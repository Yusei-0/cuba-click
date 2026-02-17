import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface LocalOrder {
  id: string;
  codigo_tracking: string;
  producto_id: string;
  producto_nombre: string;
  producto_foto: string;
  cantidad: number;
  precio_unitario: number;
  costo_envio: number;
  total: number;
  moneda: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_ci: string;
  municipio_nombre: string;
  direccion: string;
  metodo_pago: string;
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  created_at: string;
}

interface OrdersStore {
  orderIds: string[];
  orders: LocalOrder[];
  loading: boolean;
  addOrder: (order: LocalOrder) => void;
  fetchOrders: () => Promise<void>;
  getOrderByTrackingCode: (code: string) => LocalOrder | undefined;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orderIds: [],
      orders: [],
      loading: false,
      
      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders],
          orderIds: [order.id, ...state.orderIds],
        }));
      },

      fetchOrders: async () => {
        const { orderIds } = get();
        if (orderIds.length === 0) {
            set({ orders: [], loading: false });
            return;
        }

        set({ loading: true });
        try {
            // Fetch orders that are in our local ID list
            const { data, error } = await supabase
                .from('pedidos')
                .select(`
                    *,
                    moneda:monedas!moneda_id(codigo),
                    municipio:municipios!municipio_id(nombre),
                    metodo_pago:metodos_pago!metodo_pago_id(nombre),
                    items:detalles_pedido(
                        cantidad,
                        precio_unitario,
                        producto:productos(
                            id,
                            nombre,
                            foto_url
                        )
                    )
                `)
                .in('id', orderIds)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedOrders: LocalOrder[] = data.map((order: any) => {
                    const item = order.items?.[0]; // Assuming single item per order logic for now as per previous structure
                    
                    return {
                        id: order.id,
                        codigo_tracking: order.codigo_tracking,
                        producto_id: item?.producto?.id || '',
                        producto_nombre: item?.producto?.nombre || 'Producto desconocido',
                        producto_foto: item?.producto?.foto_url || '',
                        cantidad: item?.cantidad || 1,
                        precio_unitario: item?.precio_unitario || 0, // In original currency of order (USD usually)
                        costo_envio: order.total_envio || 0,
                        total: (order.total_productos || 0) + (order.total_envio || 0),
                        moneda: order.moneda?.codigo || 'USD',
                        cliente_nombre: order.cliente_nombre,
                        cliente_telefono: order.cliente_telefono,
                        cliente_ci: order.cliente_ci,
                        municipio_nombre: order.municipio?.nombre || '',
                        direccion: order.direccion_detalle,
                        metodo_pago: order.metodo_pago?.nombre || '',
                        estado: order.estado,
                        created_at: order.created_at
                    };
                });
                
                set({ orders: mappedOrders });
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            set({ loading: false });
        }
      },
      
      getOrderByTrackingCode: (code) => {
        return get().orders.find((order) => order.codigo_tracking === code);
      },
      
      clearOrders: () => {
        set({ orders: [], orderIds: [] });
      },
    }),
    {
      name: 'cuba-click-orders',
      partialize: (state) => ({ orderIds: state.orderIds }), // Only persist IDs
    }
  )
);
