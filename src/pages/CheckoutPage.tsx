import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/useCartStore";
import { useOrdersStore } from "../store/useOrdersStore";
import { useTrackingCode } from "../hooks/useTrackingCode";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import type { Database } from "../types/database.types";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Home,
  CreditCard,
  Banknote,
  Minus,
  Plus,
  Smartphone,
  Landmark,
} from "lucide-react";
import { CustomSelect } from "../components/ui/CustomSelect";
import { useToastStore } from "../store/useToastStore";
import { formatPrice } from "../lib/utils";
import { OrderSuccessModal } from "../components/OrderSuccessModal";
import { CheckoutSkeleton } from "../components/CheckoutSkeleton";

type Municipality = Database["public"]["Tables"]["municipios"]["Row"];

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { addOrder } = useOrdersStore();
  const { generateUniqueCode } = useTrackingCode();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [municipios, setMunicipios] = useState<Municipality[]>([]);
  const [selectedMoneda, setSelectedMoneda] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    cliente_ci: "",
    municipio_id: "",
    direccion: "",
    metodo_pago_id: "",
  });

  const [cantidad, setCantidad] = useState(1);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedTrackingCode, setGeneratedTrackingCode] = useState("");

  // Get product info (assuming single product checkout for now)
  const product = items[0];

  // Load payment methods based on selected currency
  const { methods: metodosPago, loading: loadingMethods } = usePaymentMethods(
    product?.proveedor_id || undefined,
    selectedMoneda || undefined
  );

  // Load initial data
  useEffect(() => {
    async function initData() {
      if (items.length === 0) {
        navigate("/cart");
        return;
      }

      // Set default currency from product
      if (product?.moneda) {
        setSelectedMoneda(product.moneda);
      }

      // Load municipios
      const { data: munData } = await supabase
        .from("municipios")
        .select("*")
        .order("nombre");

      if (munData) setMunicipios(munData);

      setLoading(false);
    }

    initData();
  }, [items, navigate, product]);

  // Reset payment method when currency changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, metodo_pago_id: "" }));
  }, [selectedMoneda]);

  // Calculate shipping when municipio changes
  useEffect(() => {
    async function calculateShipping() {
      if (!formData.municipio_id || items.length === 0) {
        setShippingCost(0);
        return;
      }

      const providerId = items[0].proveedor_id;
      if (!providerId) return;

      const { data: costData } = await (supabase.from("costos_envio") as any)
        .select("costo")
        .eq("municipio_id", formData.municipio_id)
        .eq("proveedor_id", providerId)
        .single();

      if (costData) {
        setShippingCost(costData.costo);
      } else {
        setShippingCost(0);
      }
    }

    calculateShipping();
  }, [formData.municipio_id, items]);

  // Get selected payment method details
  const selectedPaymentMethod = metodosPago.find(
    (m) => m.id === formData.metodo_pago_id
  );

  // Determine exchange rate and final currency
  const exchangeRate = selectedPaymentMethod?.tasa || 1;
  const finalCurrency = selectedPaymentMethod?.moneda_destino || selectedMoneda || "USD";

  // Calculate totals
  const subtotalUSD = totalPrice() * cantidad;
  const totalUSD = subtotalUSD + shippingCost;
  
  const subtotalConverted = subtotalUSD * exchangeRate;
  const shippingConverted = shippingCost * exchangeRate;
  const totalConverted = totalUSD * exchangeRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Generate unique tracking code
      const trackingCode = await generateUniqueCode();

      const providerId = items[0].proveedor_id;

      // Get currency ID (using product's currency)
      // Note: We are saving the order in the PRODUCT'S currency (usually USD) for consistency
      // The conversion is for display and payment purposes.
      const { data: currencyData } = await (supabase.from("monedas") as any)
        .select("id")
        .eq("codigo", product.moneda || "USD")
        .single();
      const currencyId = currencyData?.id;

      // Create order
      const orderData = {
        cliente_nombre: formData.nombre,
        cliente_telefono: formData.telefono,
        cliente_ci: formData.cliente_ci,
        municipio_id: formData.municipio_id,
        direccion_detalle: formData.direccion,
        moneda_id: currencyId,
        metodo_pago_id: formData.metodo_pago_id,
        proveedor_id: providerId,
        total_productos: subtotalUSD, // Saving in USD
        total_envio: shippingCost,    // Saving in USD
        estado: "pendiente",
        codigo_tracking: trackingCode,
      };

      const { data: order, error: orderError } = await (
        supabase.from("pedidos") as any
      )
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order details
      for (const item of items) {
        const { error: detailError } = await (
          supabase.from("detalles_pedido") as any
        ).insert({
          pedido_id: order.id,
          producto_id: item.id,
          cantidad: cantidad,
          precio_unitario: item.precio_final, // Saving in USD
        });

        if (detailError) throw detailError;
      }

      // Save to local storage
      const municipioNombre =
        municipios.find((m) => m.id === formData.municipio_id)?.nombre || "";
      const metodoPagoNombre = selectedPaymentMethod?.nombre || "";

      // Correct way: Update the local store adding to the list
      // I will create a separate object for addOrder call to ensure I pass the converted values.
      
      const localOrderData = {
        id: order.id,
        codigo_tracking: trackingCode,
        producto_id: product.id,
        producto_nombre: product.nombre,
        producto_foto: product.foto_url || "",
        cantidad,
        precio_unitario: product.precio_final * exchangeRate, // Converted
        costo_envio: shippingConverted,
        total: totalConverted,
        moneda: finalCurrency,
        cliente_nombre: formData.nombre,
        cliente_telefono: formData.telefono,
        cliente_ci: formData.cliente_ci,
        municipio_nombre: municipioNombre,
        direccion: formData.direccion,
        metodo_pago: metodoPagoNombre,
        estado: "pendiente" as const, // Explicit cast to literal type
        created_at: new Date().toISOString(),
      };
      
      addOrder(localOrderData);

      // Clear cart
      clearCart();

      // Show success modal
      setGeneratedTrackingCode(trackingCode);
      setShowSuccessModal(true);

      addToast("Pedido creado exitosamente", "success");
    } catch (error) {
      console.error("Error creating order:", error);
      addToast("Error al crear el pedido", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.nombre &&
    formData.telefono &&
    formData.cliente_ci &&
    formData.municipio_id &&
    formData.direccion &&
    formData.metodo_pago_id &&
    cantidad > 0;

  // Helper to get payment icon
  const getPaymentIcon = (methodName: string) => {
    const name = methodName.toLowerCase();
    if (name.includes('efectivo')) return <Banknote size={24} className="text-green-600" />;
    if (name.includes('transferencia')) return <Landmark size={24} className="text-blue-600" />;
    if (name.includes('tropipay') || name.includes('zelle')) return <Smartphone size={24} className="text-purple-600" />;
    return <CreditCard size={24} className="text-gray-600" />;
  };

  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Finalizar Pedido</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* DATOS DEL CLIENTE - Unchanged parts omitted for brevity in replace_file_content... 
           Actually replace_file_content requires exact match usually. 
           I will try to match the block starting from handleSubmit definition to the end of form submission or summary.
        */}

        {/* DATOS DEL CLIENTE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">DATOS DEL CLIENTE</h2>
          </div>

          <div className="space-y-4">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                className="input input-bordered w-full"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            {/* Teléfono Móvil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Móvil
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+53 5x xx xxxx"
                  className="input input-bordered w-full pl-10"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Carnet de Identidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carnet de Identidad (CI)
              </label>
              <input
                type="text"
                placeholder="12345678901"
                className="input input-bordered w-full"
                value={formData.cliente_ci}
                onChange={(e) =>
                  setFormData({ ...formData, cliente_ci: e.target.value })
                }
                required
                maxLength={11}
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Municipio
                </label>
                <CustomSelect
                  value={formData.municipio_id}
                  onChange={(val) => setFormData({ ...formData, municipio_id: val })}
                  options={municipios.map(m => ({ value: m.id, label: m.nombre }))}
                  placeholder="Selecciona tu municipio"
                  icon={<MapPin className="w-5 h-5" />}
                  required
                />
              </div>

            {/* Dirección de Entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de Entrega
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  placeholder="Calle, # Apartamento, entre calles..."
                  className="textarea textarea-bordered w-full pl-10 min-h-[5rem]"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* DATOS DEL PEDIDO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">DATOS DEL PEDIDO</h2>
          </div>

          <div className="space-y-4">
            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="btn btn-circle btn-outline btn-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">{cantidad}</span>
                <button
                  type="button"
                  onClick={() => setCantidad(cantidad + 1)}
                  className="btn btn-circle btn-outline btn-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Moneda de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['CUP', 'USD', 'MLC'].map((moneda) => (
                  <button
                    key={moneda}
                    type="button"
                    onClick={() => setSelectedMoneda(moneda)}
                    className={`btn ${
                      selectedMoneda === moneda ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {moneda}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Moneda del producto: {product.moneda || "USD"}
              </p>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              {loadingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : metodosPago.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <p className="text-sm text-yellow-800">
                    No hay métodos de pago disponibles para {selectedMoneda}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {metodosPago.map((metodo) => (
                    <label
                      key={metodo.id}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.metodo_pago_id === metodo.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="metodo_pago"
                        value={metodo.id}
                        checked={formData.metodo_pago_id === metodo.id}
                        onChange={(e) =>
                          setFormData({ ...formData, metodo_pago_id: e.target.value })
                        }
                        className="radio radio-primary radio-sm"
                        required
                      />
                      <div className="flex flex-col items-center gap-1">
                        {getPaymentIcon(metodo.nombre)}
                        <p className="font-medium text-gray-900 text-sm text-center">
                          {metodo.nombre}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">RESUMEN</h2>

          {/* Product info */}
          <div className="flex gap-4 mb-4 pb-4 border-b">
            <img
              src={product.foto_url || "/placeholder.png"}
              alt={product.nombre}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{product.nombre}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.descripcion_corta || product.descripcion}
              </p>
              <p className="text-sm font-bold text-blue-600 mt-1">
                {formatPrice(product.precio_final, product.moneda || "USD")}
              </p>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">
                {formatPrice(subtotalConverted, finalCurrency)}
                {exchangeRate !== 1 && (
                  <span className="text-xs text-gray-400 block text-right">
                    Only {formatPrice(subtotalUSD, selectedMoneda || "USD")}
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                Envío
                {shippingCost === 0 && formData.municipio_id && (
                  <span className="text-xs text-green-600">(Gratis)</span>
                )}
              </span>
              <span className="font-medium">
                {formatPrice(shippingConverted, finalCurrency)}
              </span>
            </div>
            <div className="h-px bg-gray-200 my-3"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total a Pagar</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600 block">
                  {formatPrice(totalConverted, finalCurrency)}
                </span>
                {exchangeRate !== 1 && (
                  <span className="text-sm text-gray-500">
                    ({formatPrice(totalUSD, selectedMoneda || "USD")})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation message */}
          {isFormValid && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl flex items-start gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-green-800">
                Pago seguro al recibir tu pedido en {finalCurrency}
              </p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className="btn btn-primary btn-lg w-full text-white font-bold text-lg disabled:opacity-50"
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Procesando...
            </>
          ) : (
            <>
              Confirmar Pedido
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </>
          )}
        </button>
      </form>

      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/");
        }}
        trackingCode={generatedTrackingCode}
        orderTotal={formatPrice(totalConverted, finalCurrency)}
      />
    </div>
  );
}
