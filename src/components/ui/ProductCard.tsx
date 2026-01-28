import { Link } from "react-router-dom";
import type { Database } from "../../types/database.types";
import { useCartStore } from "../../store/useCartStore";
import { ShoppingCart } from "lucide-react";

type Product = Database["public"]["Tables"]["productos"]["Row"];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CU", {
      style: "currency",
      currency: "USD", // Assuming USD for now based on context, or use proper currency logic
    }).format(price);
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <figure className="h-48 overflow-hidden bg-gray-100 relative">
        {product.foto_url ? (
          <img
            src={product.foto_url}
            alt={product.nombre}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-400">
            Sin imagen
          </div>
        )}
        {product.precio_costo < product.precio_final && (
          <div className="badge badge-secondary absolute top-2 right-2">
            Oferta
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <Link
          to={`/producto/${product.id}`}
          className="hover:text-primary transition-colors"
        >
          <h2 className="card-title text-base line-clamp-2 min-h-12">
            {product.nombre}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2">
          {product.descripcion}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.precio_final)}
          </span>
          <button
            className="btn btn-circle btn-primary btn-sm"
            onClick={() => addItem(product)}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
