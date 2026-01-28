import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";
import { useCartStore } from "../store/useCartStore";
import { ShoppingCart, ArrowLeft, Truck, ShieldCheck } from "lucide-react";

type Product = Database["public"]["Tables"]["productos"]["Row"];

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

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

  if (loading)
    return (
      <div className="text-center py-20">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/catalogo")}
        >
          Volver al catálogo
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn btn-ghost mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="card lg:card-side bg-base-100 shadow-xl overflow-hidden">
        <figure className="lg:w-1/2 bg-gray-100">
          {product.foto_url ? (
            <img
              src={product.foto_url}
              alt={product.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-96 w-full flex items-center justify-center text-gray-400">
              Sin Imagen
            </div>
          )}
        </figure>
        <div className="card-body lg:w-1/2">
          <div className="mb-4">
            {/* @ts-ignore - joined data might not strictly match the simple Row type */}
            {product.categorias && (
              <span className="badge badge-outline mb-2">
                {product.categorias.nombre}
              </span>
            )}
            <h1 className="card-title text-3xl mb-2">{product.nombre}</h1>
            <p className="text-3xl font-bold text-primary">
              ${product.precio_final}
            </p>
          </div>

          <p className="py-4 text-gray-600">{product.descripcion}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Truck className="h-4 w-4" />
              <span>Envío disponible a toda La Habana</span>
            </div>
            {product.garantia_dias > 0 && (
              <div className="flex items-center gap-2 text-sm text-success">
                <ShieldCheck className="h-4 w-4" />
                <span>Garantía de {product.garantia_dias} días</span>
              </div>
            )}
          </div>

          <div className="card-actions justify-end mt-auto">
            <button
              className="btn btn-primary btn-lg w-full gap-2"
              onClick={() => addItem(product)}
            >
              <ShoppingCart className="h-5 w-5" />
              Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
