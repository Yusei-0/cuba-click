import { Link } from "react-router-dom";
import type { Database } from "../../types/database.types";
import { useCartStore } from "../../store/useCartStore";
import { formatPrice } from "../../lib/utils";
import { CheckCircle2 } from "lucide-react";

type Product = Database["public"]["Tables"]["productos"]["Row"];

interface ProductCardProps {
  product: Product;
  variant?: "default" | "catalog";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addItem } = useCartStore();
  
  const hasWarranty = product.garantia_dias > 0; 
  const displayWarranty = product.garantia_dias >= 30 
    ? `${Math.floor(product.garantia_dias / 30)}m` 
    : `${product.garantia_dias}d`;

  const isCatalog = variant === "catalog";

  return (
    <div className={`card bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group p-3 border border-gray-100 ${isCatalog ? 'h-full flex flex-col' : ''}`}>
      <div className="relative rounded-xl overflow-hidden bg-gray-50 aspect-square mb-2">
        {product.foto_url ? (
          <img
            src={product.foto_url}
            alt={product.nombre}
            className="object-cover w-full h-full mix-blend-multiply"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-300">
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
            {/* Warranty Badge - Only for Catalog */}
            {isCatalog && hasWarranty && (
                <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Garantía {displayWarranty}</span>
                </div>
            )}

            {/* Price Badge - Only for Default (Home) */}
            {!isCatalog && (
                <div className="bg-white text-gray-900 text-xs font-bold px-2 py-1 rounded-lg shadow-sm ml-auto">
                    {formatPrice(product.precio_final)}
                </div>
            )}
        </div>
      </div>
      
      <div className={`flex flex-col gap-1 ${isCatalog ? 'grow' : 'px-1'}`}>
        <h2 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight min-h-[2.5em]">
          {product.nombre}
        </h2>
        
        {/* Catalog Variant: Price and Provider/Brand */}
        {isCatalog && (
            <div className="mt-1">
                 <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                    {product.descripcion_corta || product.descripcion || "Disponible en La Habana"}
                 </p>
                 <p className="text-lg font-bold text-blue-600">
                    {formatPrice(product.precio_final)} 
                    <span className="text-xs font-normal text-gray-400 ml-1">USD</span>
                 </p>
            </div>
        )}

        {!isCatalog && (
             <p className="text-[11px] text-gray-500 font-medium">
                  Disponible en La Habana
             </p>
        )}

        <div className="mt-auto pt-2">
            <button
              className={`btn w-full rounded-xl text-base font-bold min-h-0 h-10 shadow-none border-none z-20 relative
                ${isCatalog 
                    ? 'btn-ghost bg-blue-50 text-blue-600 hover:bg-blue-100' 
                    : 'btn-primary bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
            >
              {isCatalog ? 'Ver detalles' : 'Ver producto'}
            </button>
        </div>
      </div>
      
      {/* Clickable area for details */}
      <Link to={`/producto/${product.id}`} className="absolute inset-0 z-0" aria-label={`Ver detalles de ${product.nombre}`} />
    </div>
  );
}
