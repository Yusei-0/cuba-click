import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Check, Copy, Home } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useToastStore } from '../store/useToastStore';
import { Header } from '../components/layout/Header';

interface OrderItem {
  id: string;
  cantidad: number;
  precio_unitario: number;
  producto: {
    nombre: string;
    foto_url: string;
  };
  variante?: {
    nombre: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total: number; // This might need to be calculated or fetched if it exists on table, let's assume calculated for now or check schema
  // Schema check: schema has total_productos and total_envio, but maybe we want a calculated total?
  // Let's rely on what we get or calculate it.
  total_productos: number;
  total_envio: number;
  codigo: string; 
  items: OrderItem[];
  moneda?: {
    codigo: string;
  };
}

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            *,
            moneda:monedas!moneda_id (
                codigo
            ),
            items:detalles_pedido (
              id,
              cantidad,
              precio_unitario,
              producto:productos (
                nombre,
                foto_url
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        addToast('No se pudo cargar la información del pedido', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, addToast]);

  const copyToClipboard = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      addToast('ID del pedido copiado', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
        <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <div className="py-8 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-base-content">
            ¡Pedido recibido correctamente!
          </h1>
          <p className="text-base-content/70">
            Te contactaremos pronto para coordinar la entrega.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-6">
            
            {/* Order Number & Date */}
            <div className="text-center border-b border-base-200 pb-6 mb-6">
              <p className="text-sm font-bold text-base-content/50 uppercase tracking-wide mb-1">
                NÚMERO DE ORDEN
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-primary">
                  #{order.id.slice(0, 8).toUpperCase()}
                </h2>
                <button 
                  onClick={copyToClipboard}
                  className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">Fecha</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="font-bold mb-4">Resumen de compra</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-base-200/50 p-3 rounded-lg">
                    <div className="w-16 h-16 bg-base-100 rounded-md overflow-hidden shrink-0 border border-base-200">
                      <img 
                        src={item.producto.foto_url || '/placeholder.png'} 
                        alt={item.producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.producto.nombre}</h4>
                      <p className="text-xs text-base-content/70">
                        Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <div className="font-bold text-primary">
                       {formatPrice(item.precio_unitario, order.moneda?.codigo)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordion / Expand for more details could go here */}
             <div className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-box mt-4">
                <input type="checkbox" /> 
                <div className="collapse-title text-sm font-medium text-base-content/70">
                    Ver detalles completos
                </div>
                <div className="collapse-content text-sm"> 
                    <div className="flex justify-between py-2 border-b border-base-200">
                        <span>Subtotal (Productos)</span>
                        <span>{formatPrice(order.total_productos || 0, order.moneda?.codigo)}</span>
                    </div>
                     <div className="flex justify-between py-2 border-b border-base-200">
                        <span>Envío</span>
                        <span>{formatPrice(order.total_envio || 0, order.moneda?.codigo)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                        <span>Total</span>
                        <span>{formatPrice((order.total_productos || 0) + (order.total_envio || 0), order.moneda?.codigo)}</span>
                    </div>
                </div>
            </div>


          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4 text-center">
          <Link to="/" className="btn btn-primary w-full gap-2 text-lg">
            <Home className="w-5 h-5" />
            Volver al inicio
          </Link>
          
          <button className="btn btn-ghost btn-sm gap-2 text-base-content/70 normal-case font-normal">
            Necesito ayuda con mi orden
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}
