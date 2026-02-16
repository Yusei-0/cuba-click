import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  orders: LocalOrder[];
  addOrder: (order: LocalOrder) => void;
  getOrderByTrackingCode: (code: string) => LocalOrder | undefined;
  updateOrderStatus: (id: string, estado: LocalOrder['estado']) => void;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },
      
      getOrderByTrackingCode: (code) => {
        return get().orders.find((order) => order.codigo_tracking === code);
      },
      
      updateOrderStatus: (id, estado) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, estado } : order
          ),
        }));
      },
      
      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: 'cuba-click-orders',
    }
  )
);
