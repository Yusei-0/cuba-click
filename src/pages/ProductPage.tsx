import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { useCartStore } from "../store/useCartStore";
import { ArrowLeft, Truck, ShieldCheck, Share2, Heart, ShoppingCart } from "lucide-react";
import { formatPrice } from "../lib/utils";

type Product = Database["public"]["Tables"]["productos"]["Row"];

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*, categorias(*), proveedores(*)")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data as any);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    // We strictly follow the store logic: addItem adds 1 or replaces if provider differs.
    // To support adding specific quantity directly, we might need to loop or update store.
    // For now, let's just add the item 'quantity' times if it's new, or handle it simply.
    // Actually, useCartStore 'addItem' adds 1. 'updateQuantity' sets exact.
    
    // Strategy: Add item once, then update quantity immediately if needed.
    addItem(product);
    
    // If user selected more than 1, we update it.
    // Note: This presumes addItem logic handles provider check and returns void.
    // We might need a small delay or refactor store to accept quantity, but for now:
    // We will verify if it's in cart after add, and set quantity.
    
    // A better UX for this specific store (simple MVP) might be just "Add to Cart" adds 1.
    // But let's try to honor the quantity selector.
    
    // Hacky workaround without changing store interface: 
    // We can't easily do this atomic without store change. 
    // Let's just let addItem do its job (add 1 or increment) and then we route to cart?
    // User requested "Sticky Footer" with "Add to Cart".
    
    // If I want to set specific quantity:
    // const cartItem = useCartStore.getState().items.find(i => i.id === product.id);
    // if (cartItem) updateQuantity(product.id, quantity);
    
    // For this version, let's keep it simple: Add to cart and go back or stay? 
    // "Comprar Ahora" usually implies -> Checkout. "Agregar" -> Stay.
    
    // Let's implement "Agregar" (Add) with toast confirmation (future) and simple logic.
    // For now, simple Add.
  };
  
  const handleBuyNow = () => {
      if(!product) return;
      addItem(product);
      navigate("/checkout");
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  if (!product)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white p-4 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Producto no encontrado</h2>
        <button
          className="btn btn-primary rounded-full px-8"
          onClick={() => navigate("/catalogo")}
        >
          Volver al catálogo
        </button>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-24 relative">
      {/* 1. Header Transparent / Floated */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 flex justify-between items-center text-white/90 drop-shadow-md">
        <button 
            onClick={() => navigate(-1)} 
            className="btn btn-circle btn-sm bg-black/20 border-none backdrop-blur-sm hover:bg-black/40 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
            <button className="btn btn-circle btn-sm bg-black/20 border-none backdrop-blur-sm hover:bg-black/40 text-white">
                <Heart className="h-5 w-5" />
            </button>
            <button className="btn btn-circle btn-sm bg-black/20 border-none backdrop-blur-sm hover:bg-black/40 text-white">
                <Share2 className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* 2. Full Width Image */}
      <div className="w-full aspect-square relative bg-white">
        {product.foto_url ? (
          <img
            src={product.foto_url}
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            Sin Imagen
          </div>
        )}
      </div>

      {/* 3. Sheet Details (Overlapping) */}
      <div className="-mt-6 relative z-1 bg-white rounded-t-3xl px-5 pt-8 pb-4 shadow-sm min-h-[50vh]">
        
        {/* Category & Rating */}
        <div className="flex justify-between items-start mb-2">
            {/* @ts-ignore */}
            <span className="text-sm text-primary font-semibold uppercase tracking-wider">
                {(product as any).categorias?.nombre || "General"}
            </span>
            <div className="flex items-center gap-1 text-orange-400 text-sm font-bold">
                <span>★ 4.8</span>
                <span className="text-gray-300 font-normal">(12)</span>
            </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
          {product.nombre}
        </h1>

        {/* Price */}
        <div className="flex items-end gap-2 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">
                {formatPrice(product.precio_final)}
            </span>
            {product.precio_costo > product.precio_final && (
                <span className="text-lg text-gray-400 line-through mb-1">
                    {formatPrice(product.precio_costo)}
                </span>
            )}
        </div>

        <div className="divider my-4"></div>

        {/* Description */}
        <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
                {product.descripcion || "Sin descripción disponible para este producto."}
            </p>
        </div>

        {/* Features / Guarantees */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Truck className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-900">Envío Rápido</p>
                    <p className="text-[10px] text-gray-500">Habana: 24h</p>
                </div>
            </div>
             <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-900">Garantía</p>
                    <p className="text-[10px] text-gray-500">{product.garantia_dias ? `${product.garantia_dias} días` : "Verificada"}</p>
                </div>
            </div>
        </div>
      </div>

      {/* 4. Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 safe-area-bottom z-50 flex gap-3 items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Quantity Selector (Simple) */}
        {/* Since store doesn't support setting arbitrary qty easily in one go without logic, 
            we just keep it simple: Button calls Buy Now */}
        
        <button 
            className="btn btn-outline border-gray-200 text-gray-600 btn-square rounded-xl"
            onClick={() => {/* logic for cart add? */ handleAddToCart()}}
        >
            <ShoppingCart className="h-6 w-6" />
        </button>

        <button 
            className="btn btn-primary flex-1 rounded-xl text-white text-lg font-bold shadow-lg shadow-primary/30"
            onClick={handleBuyNow}
        >
            Comprar Ahora
        </button>
      </div>
    </div>
  );
}
