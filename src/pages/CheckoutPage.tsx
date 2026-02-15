import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/useCartStore";
import type { Database } from "../types/database.types";
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { useToastStore } from "../store/useToastStore";
import { formatPrice } from "../lib/utils";

type Municipality = Database["public"]["Tables"]["municipios"]["Row"];
type PaymentMethod = Database["public"]["Tables"]["metodos_pago"]["Row"];

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [municipios, setMunicipios] = useState<Municipality[]>([]);
  const [metodosPago, setMetodosPago] = useState<PaymentMethod[]>([]);

  // State
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    municipio_id: "",
    direccion: "",
    metodo_pago_id: "",
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingProviderName, setShippingProviderName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Load initial data
  useEffect(() => {
    async function initData() {
      if (items.length === 0) {
        navigate("/cart");
        return;
      }

      const providerId = items[0].proveedor_id;

      try {
        setLoading(true);
        // Load municipalities
        const { data: munData } = await supabase
          .from("municipios")
          .select("*")
          .order("nombre");
        if (munData) setMunicipios(munData);

        // Load payment methods allowed by this provider
        if (providerId) {
          const { data: provMethods } = await (
            supabase.from("proveedor_metodos_pago") as any
          )
            .select("metodo_pago_id, metodos_pago(id, nombre)")
            .eq("proveedor_id", providerId);

          if (provMethods) {
            const allowedMethods = provMethods
              .map((pm: any) => pm.metodos_pago)
              .filter(Boolean);
            setMetodosPago(allowedMethods);
          }
        }
      } catch (e) {
        console.error("Error loading checkout data", e);
        addToast("Error al cargar datos de configuración", "error");
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [items, navigate, addToast]);

  // Calculate Shipping when Municipality changes
  useEffect(() => {
    async function calculateShipping() {
      if (!formData.municipio_id || items.length === 0) {
        setShippingCost(0);
        return;
      }

      // Since we enforce single provider now, getting the provider is easy
      const providerId = items[0].proveedor_id;
      if (!providerId) return;

      const { data: costData } = await (supabase.from("costos_envio") as any)
        .select("costo, proveedores(nombre)")
        .eq("municipio_id", formData.municipio_id)
        .eq("proveedor_id", providerId)
        .single();

      if (costData) {
        setShippingCost(costData.costo);
        setShippingProviderName(costData.proveedores?.nombre);
      } else {
        // If no specific cost found, maybe default to 0 or handle otherwise
        setShippingCost(0);
        setShippingProviderName("");
      }
    }

    calculateShipping();
  }, [formData.municipio_id, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const providerId = items[0].proveedor_id;

      // 1. Create Order
      const { data: currencyData } = await (supabase.from("monedas") as any)
        .select("id")
        .eq("codigo", "USD")
        .single();
      const currencyId = currencyData?.id;

      const orderData = {
        cliente_nombre: formData.nombre,
        cliente_telefono: formData.telefono,
        municipio_id: formData.municipio_id,
        direccion_detalle: formData.direccion,
        moneda_id: currencyId,
        metodo_pago_id: formData.metodo_pago_id,
        proveedor_id: providerId, // Add provider_id to order
        total_productos: totalPrice(),
        total_envio: shippingCost,
        estado: "pendiente",
      };

      const { data: order, error: orderError } = await (
        supabase.from("pedidos") as any
      )
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("Failed to create order");

      // 2. Create Order Details
      const detailsData = items.map((item) => ({
        pedido_id: order.id,
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.precio_final,
      }));

      const { error: detailsError } = await (
        supabase.from("detalles_pedido") as any
      ).insert(detailsData);

      if (detailsError) throw detailsError;

      // Success
      setOrderSuccess(true);
      clearCart();
      addToast("Pedido realizado con éxito", "success");
    } catch (error) {
      console.error("Error creating order:", error);
      addToast("Hubo un error al procesar el pedido", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-success" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Gracias por tu compra,{" "}
          <span className="font-semibold">{formData.nombre}</span>. Nos
          pondremos en contacto contigo pronto al{" "}
          <span className="font-semibold">{formData.telefono}</span> para
          coordinar la entrega.
        </p>
        <Link
          to="/"
          className="btn btn-primary btn-lg rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Seguir Comprando
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 lg:gap-12 animate-pulse">
        <div className="grow space-y-6">
          <div className="h-8 w-48 bg-base-300 rounded"></div>
          <div className="h-64 bg-base-300 rounded-xl"></div>
          <div className="h-48 bg-base-300 rounded-xl"></div>
          <div className="h-32 bg-base-300 rounded-xl"></div>
        </div>
        <div className="lg:w-[24rem] shrink-0">
          <div className="h-64 bg-base-300 rounded-xl sticky top-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32 lg:pb-8">
      {" "}
      {/* Added padding bottom for mobile sticky button */}
      <button
        onClick={() => navigate("/cart")}
        className="btn btn-ghost mb-6 gap-2 hover:bg-transparent hover:text-primary transition-colors pl-0"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Carrito
      </button>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Form Area */}
        <div className="grow">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Finalizar Compra
          </h1>
          <p className="text-gray-500 mb-8">
            Completa tus datos para procesar el envío.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Contact & Shipping */}
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-visible">
              <div className="card-body p-6 md:p-8">
                <h2 className="card-title text-gray-700 flex items-center gap-2 border-b pb-4 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  Información de Contacto
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control w-full">
                    <label className="label font-medium text-gray-600">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre..."
                      className="input input-bordered w-full focus:input-primary"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label font-medium text-gray-600">
                      Teléfono Móvil
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="5xxxxxxx"
                      className="input input-bordered w-full focus:input-primary"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-visible">
              <div className="card-body p-6 md:p-8">
                <h2 className="card-title text-gray-700 flex items-center gap-2 border-b pb-4 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  Dirección de Entrega
                </h2>

                <div className="form-control mb-4">
                  <label className="label font-medium text-gray-600">
                    Municipio
                  </label>
                  <select
                    className="select select-bordered w-full focus:select-primary"
                    required
                    value={formData.municipio_id}
                    onChange={(e) =>
                      setFormData({ ...formData, municipio_id: e.target.value })
                    }
                  >
                    <option value="">Selecciona tu municipio...</option>
                    {municipios.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-medium text-gray-600">
                    Dirección Detallada
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-28 focus:textarea-primary"
                    required
                    placeholder="Calle, # casa, entrecalles, reparto..."
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section: Payment */}
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-visible">
              <div className="card-body p-6 md:p-8">
                <h2 className="card-title text-gray-700 flex items-center gap-2 border-b pb-4 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Método de Pago
                </h2>
                <div className="form-control">
                  {metodosPago.length > 0 ? (
                    <select
                      className="select select-bordered w-full focus:select-primary font-medium"
                      required
                      value={formData.metodo_pago_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metodo_pago_id: e.target.value,
                        })
                      }
                    >
                      <option value="">¿Cómo deseas pagar?</option>
                      {metodosPago.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="alert alert-warning">
                      <span>
                        Este proveedor no tiene métodos de pago configurados.
                      </span>
                    </div>
                  )}

                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      El pago se realiza directamente con el proveedor.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Desktop Button (Hidden on Mobile) */}
            <div className="hidden lg:block">
              <button
                type="submit"
                className={`btn btn-primary w-full btn-lg shadow-lg hover:shadow-xl transition-all text-lg ${submitting ? "loading" : ""}`}
                disabled={submitting || loading || metodosPago.length === 0}
              >
                Confirmar Pedido &bull;{" "}
                {formatPrice(totalPrice() + shippingCost)}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Side */}
        <div className="lg:w-[24rem] shrink-0">
          <div className="card bg-base-100 shadow-xl border border-base-200 sticky top-24">
            <div className="card-body p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Resumen del Pedido
              </h3>
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start gap-4"
                  >
                    <div className="flex gap-3">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded bg-base-200">
                          {item.foto_url ? (
                            <img src={item.foto_url} alt={item.nombre} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              Sin img
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium line-clamp-2">
                          {item.nombre}
                        </p>
                        <p className="text-gray-500">Cant: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm whitespace-nowrap">
                      {formatPrice(item.precio_final * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" /> Envío
                  </span>
                  <span>
                    {formData.municipio_id ? (
                      shippingCost === 0 ? (
                        <span className="text-success font-medium">Gratis</span>
                      ) : (
                        formatPrice(shippingCost)
                      )
                    ) : (
                      <span className="text-xs text-gray-400 italic">...</span>
                    )}
                  </span>
                </div>
                {shippingProviderName && (
                  <p className="text-xs text-right text-gray-400 -mt-2">
                    Provista por: {shippingProviderName}
                  </p>
                )}
              </div>

              <div className="divider my-2"></div>

              <div className="flex justify-between text-2xl font-bold text-primary">
                <span>Total</span>
                <span>{formatPrice(totalPrice() + shippingCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Sticky Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-base-100 border-t border-base-200 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <button
          onClick={handleSubmit} // Trigger the form submit programmatically or link it
          className={`btn btn-primary w-full btn-lg shadow-lg text-lg ${submitting ? "loading" : ""}`}
          disabled={submitting || loading || metodosPago.length === 0}
        >
          Confirmar &bull; {formatPrice(totalPrice() + shippingCost)}
        </button>
      </div>
    </div>
  );
}
