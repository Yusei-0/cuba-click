import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/useCartStore";
import type { Database } from "../types/database.types";
import { ArrowLeft, CheckCircle } from "lucide-react";

type Municipality = Database["public"]["Tables"]["municipios"]["Row"];
type PaymentMethod = Database["public"]["Tables"]["metodos_pago"]["Row"];

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  // Redirect if empty
  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items, navigate]);

  const [municipios, setMunicipios] = useState<Municipality[]>([]);
  const [metodosPago, setMetodosPago] = useState<PaymentMethod[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    municipio_id: "",
    direccion: "",
    metodo_pago_id: "",
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Load initial data
  useEffect(() => {
    async function initData() {
      try {
        const [munRes, payRes] = await Promise.all([
          supabase.from("municipios").select("*").order("nombre"),
          supabase.from("metodos_pago").select("*"),
        ]);
        if (munRes.data) setMunicipios(munRes.data);
        if (payRes.data) setMetodosPago(payRes.data);
      } catch (e) {
        console.error("Error loading checkout data", e);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Calculate Shipping when Municipality changes
  useEffect(() => {
    async function calculateShipping() {
      if (!formData.municipio_id || items.length === 0) {
        setShippingCost(0);
        return;
      }

      // Get unique providers in cart
      const providerIds = Array.from(
        new Set(items.map((i) => i.proveedor_id).filter(Boolean)),
      );

      let totalShipping = 0;

      // Fetch shipping costs for these providers to this municipality
      // This is a simplified logic needed because we might have mixed providers.
      // We query cost for each provider to the selected municipality.

      if (providerIds.length === 0) return; // No providers? Should not happen if products have providers

      // We can't do a simple "IN" query easily for composite checks without stored procedure or complex logic.
      // Or we just fetch all costs for this municipality and filter in JS.
      const { data: costs } = await (supabase.from("costos_envio") as any)
        .select("*")
        .eq("municipio_id", formData.municipio_id)
        .in("proveedor_id", providerIds as string[]);

      if (costs) {
        providerIds.forEach((pid) => {
          const costEntry = costs.find((c: any) => c.proveedor_id === pid);
          // If cost found, add it. If not found, assume 0 or a default?
          // Let's assume 0 or maybe warn. For now 0.
          if (costEntry) {
            totalShipping += costEntry.costo;
          }
        });
      }

      setShippingCost(totalShipping);
    }

    calculateShipping();
  }, [formData.municipio_id, items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Create Order
      // Get USD currency ID for now, or fetch dynamically.
      // Let's assume we need to fetch currency ID for 'USD' first or hardcode if we knew it.
      // Check Metadata: sql inserts USD.
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
    } catch (error) {
      console.error("Error creating order:", error);
      alert(
        "Hubo un error al procesar el pedido. Por favor intente nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle className="w-24 h-24 text-success mb-6" />
        <h1 className="text-4xl font-bold mb-4">¡Pedido Realizado!</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Gracias por tu compra. Nos pondremos en contacto contigo pronto al{" "}
          {formData.telefono} para confirmar la entrega.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/cart")}
        className="btn btn-ghost mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Carrito
      </button>

      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="grow">
          <form
            onSubmit={handleSubmit}
            className="card bg-base-100 shadow-xl p-6 space-y-4"
          >
            <h2 className="card-title mb-4">Datos de Envío</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nombre Completo</span>
                </label>
                <input
                  type="text"
                  required
                  className="input input-bordered"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Teléfono</span>
                </label>
                <input
                  type="tel"
                  required
                  className="input input-bordered"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Municipio</span>
              </label>
              <select
                className="select select-bordered"
                required
                value={formData.municipio_id}
                onChange={(e) =>
                  setFormData({ ...formData, municipio_id: e.target.value })
                }
              >
                <option value="">Selecciona un municipio</option>
                {municipios.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Dirección detallada</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                required
                placeholder="Calle, número, entrecalles, puntos de referencia..."
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
              ></textarea>
            </div>

            <div className="divider">Pago</div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Método de Pago</span>
              </label>
              <select
                className="select select-bordered"
                required
                value={formData.metodo_pago_id}
                onChange={(e) =>
                  setFormData({ ...formData, metodo_pago_id: e.target.value })
                }
              >
                <option value="">Selecciona un método</option>
                {metodosPago.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className={`btn btn-primary w-full btn-lg ${submitting ? "loading" : ""}`}
                disabled={submitting || loading}
              >
                Confirmar Pedido (${totalPrice() + shippingCost})
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Side */}
        <div className="md:w-80 shrink-0">
          <div className="card bg-base-100 shadow-md p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Resumen</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1">
                    {item.quantity}x {item.nombre}
                  </span>
                  <span>${item.precio_final * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${totalPrice()}</span>
            </div>
            <div className="flex justify-between text-primary">
              <span>Envío</span>
              <span>
                {formData.municipio_id ? `$${shippingCost}` : "Seleccione mun."}
              </span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${totalPrice() + shippingCost}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
