import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Truck, CheckCircle2, AlertCircle, CreditCard, Banknote, Landmark, Smartphone } from 'lucide-react';
import { useProductData } from '../hooks/useProductData';
import { useFavorites } from '../hooks/useFavorites';
import { useShippingCosts } from '../hooks/useShippingCosts';

// Helper to get payment icon
const getPaymentIcon = (methodName: string) => {
  const name = methodName.toLowerCase();
  if (name.includes('efectivo')) return <Banknote size={24} className="text-green-600" />;
  if (name.includes('transferencia')) return <Landmark size={24} className="text-blue-600" />;
  if (name.includes('tropipay') || name.includes('zelle')) return <Smartphone size={24} className="text-purple-600" />;
  return <CreditCard size={24} className="text-gray-600" />;
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  // For now using slug as ID as discussed in hooks creation
  const { product, loading, error } = useProductData(slug || '');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { 
    municipios, 
    selectedMunicipio, 
    setSelectedMunicipio, 
    currentCost: shippingCost,
    loading: loadingShipping 
  } = useShippingCosts(product?.proveedor_id);
  
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Scroll to top on load/change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Producto no encontrado</h2>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-primary btn-sm"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // --- SKELETON LOADING STATE ---
  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 relative animate-pulse">
        {/* Header Skeleton */}
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center bg-transparent">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Image Skeleton */}
        <div className="w-full h-[400px] bg-gray-300"></div>

        {/* Content Skeleton */}
        <div className="px-5 py-6 bg-white rounded-t-[30px] -mt-8 relative z-10 min-h-[500px]">
           <div className="w-32 h-4 bg-gray-200 rounded mb-3"></div> {/* Category */}
           <div className="w-3/4 h-8 bg-gray-300 rounded mb-4"></div> {/* Title */}
           
           <div className="flex items-center gap-4 mb-6">
             <div className="w-32 h-8 bg-gray-300 rounded"></div> {/* Price */}
             <div className="w-20 h-6 bg-gray-200 rounded"></div> {/* Discount */}
           </div>

           <div className="space-y-2 mb-8"> {/* Description */}
             <div className="w-full h-4 bg-gray-200 rounded"></div>
             <div className="w-full h-4 bg-gray-200 rounded"></div>
             <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
           </div>

           <div className="h-24 bg-gray-100 rounded-xl mb-6"></div> {/* Shipping */}
           
           <div className="grid grid-cols-2 gap-4">
             <div className="h-20 bg-gray-100 rounded-xl"></div>
             <div className="h-20 bg-gray-100 rounded-xl"></div>
           </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  const discountPercentage = product.precio_costo > product.precio_final 
    ? Math.round(((product.precio_costo - product.precio_final) / product.precio_costo) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative font-sans">
      
      {/* 1. Header Transparente/Flotante */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => toggleFavorite(product.id)}
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <Heart 
              size={20} 
              className={isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-gray-800"} 
            />
          </button>
        </div>
      </div>

      {/* 2. Galería de Imágenes */}
      <div className="relative w-full h-[65vh] bg-white flex items-center justify-center overflow-hidden">
        {product.foto_url ? (
            <img 
              src={product.foto_url} 
              alt={product.nombre} 
              className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                Sin Imagen
            </div>
        )}
        {/* Dot indicators - Hidden as requested */}
      </div>

      {/* 3. Contenedor Principal (Rounded Top) */}
      <div className="px-5 py-8 bg-white rounded-t-[30px] -mt-8 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] min-h-[50vh]">
        
        {/* Categoría y Rating */}
        <div className="flex justify-between items-start mb-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                {product.categoria?.nombre || 'General'}
            </span>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                <span className="text-yellow-500 text-xs">★</span>
                <span className="text-xs font-bold text-gray-800">4.9</span>
            </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">
            {product.nombre}
        </h1>

        {/* Precio */}
        <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-blue-600">
                ${product.precio_final} <span className="text-lg font-normal text-gray-500">{product.moneda || 'USD'}</span>
            </span>
            {discountPercentage > 0 && (
                <>
                    <span className="text-lg text-gray-400 line-through mb-1">
                        ${product.precio_costo}
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mb-2">
                        -{discountPercentage}%
                    </span>
                </>
            )}
        </div>

        {/* Descripción */}
        <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
                {product.descripcion || "Sin descripción disponible."}
            </p>
            {product.descripcion && product.descripcion.length > 100 && (
                <button className="text-blue-600 text-sm font-semibold mt-1">Ver más</button>
            )}
        </div>

        {/* 4. Calculadora de Envío */}
        <div className="bg-blue-50/50 rounded-2xl p-4 mb-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
                <Truck className="text-blue-600" size={20} />
                <span className="font-bold text-gray-800">Calculadora de Envío</span>
            </div>
            
            <div className="flex flex-col gap-3">
                <select 
                    className="select select-bordered select-sm w-full bg-white text-gray-700 focus:outline-none focus:border-blue-500"
                    value={selectedMunicipio}
                    onChange={(e) => setSelectedMunicipio(e.target.value)}
                    disabled={loadingShipping}
                >
                    <option value="">Selecciona tu municipio</option>
                    {municipios.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                </select>

                <div className="flex justify-between items-center px-1">
                    <span className="text-sm text-gray-500">Costo estimado:</span>
                    <span className={`font-bold ${shippingCost != null ? 'text-gray-900' : 'text-gray-400'}`}>
                        {shippingCost != null 
                            ? `$${shippingCost.toFixed(2)} USD` 
                            : '--'}
                    </span>
                </div>
            </div>
        </div>

        {/* Métodos de Pago */}
        {product.metodos_pago && product.metodos_pago.length > 0 && (
            <div className="mb-8">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Métodos de Pago</h3>
               <div className="flex gap-4 flex-wrap">
                   {product.metodos_pago.map((mp: any) => (
                       <div key={mp.metodo_pago.id} className="flex flex-col items-center gap-2">
                           <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                               {getPaymentIcon(mp.metodo_pago.nombre)}
                           </div>
                           <span className="text-[10px] text-gray-500 font-medium text-center truncate max-w-[70px]">
                               {mp.metodo_pago.nombre}
                           </span>
                       </div>
                   ))}
               </div>
            </div>
        )}

        {/* Garantía y Devoluciones */}
        <div className="grid grid-cols-2 gap-3 mb-24">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1 items-start">
               <CheckCircle2 size={18} className="text-green-600 mb-1" />
               <span className="text-xs font-bold text-gray-900">Garantía</span>
               <span className="text-[10px] text-gray-500">{product.garantia_dias ? `${product.garantia_dias} días de cobertura` : 'Sin garantía'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1 items-start">
               <AlertCircle size={18} className="text-blue-600 mb-1" />
               <span className="text-xs font-bold text-gray-900">Devoluciones</span>
               <span className="text-[10px] text-gray-500">Gratis primeros 7 días</span>
            </div>
        </div>

      </div>

      {/* 5. Bottom Bar (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 pb-6 z-50 flex items-center gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
         <div className="flex items-center bg-gray-100 rounded-full px-1 py-1">
             <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold active:bg-gray-200 rounded-full transition-colors"
            >-</button>
             <span className="w-8 text-center font-bold text-gray-900 text-sm">{quantity}</span>
             <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold active:bg-gray-200 rounded-full transition-colors"
            >+</button>
         </div>

         <button className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
             <span>Comprar ahora</span>
             <ArrowLeft className="rotate-180" size={18} />
         </button>
      </div>

    </div>
  );
}
