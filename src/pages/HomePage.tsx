import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";
import { ProductCard } from "../components/ui/ProductCard";
import { Link } from "react-router-dom";

type Product = Database["public"]["Tables"]["productos"]["Row"];
type Category = Database["public"]["Tables"]["categorias"]["Row"];

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from("productos")
            .select("*")
            .limit(8)
            .order("created_at", { ascending: false }),
          supabase.from("categorias").select("*"),
        ]);

        if (productsRes.data) setFeaturedProducts(productsRes.data);
        if (categoriesRes.data) setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div
        className="hero min-h-[300px] rounded-box overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)",
        }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">
              Bienvenido a VentasHabana
            </h1>
            <p className="mb-5">
              Encuentra los mejores productos con entrega rápida en toda La
              Habana.
            </p>
            <Link to="/catalogo" className="btn btn-primary">
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>

      {/* Categorías */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">Categorías</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((cat) => (
            <Link
              to={`/catalogo?categoria=${cat.id}`}
              key={cat.id}
              className="btn btn-outline btn-lg rounded-full px-8 hover:bg-primary hover:text-white transition-all"
            >
              {cat.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* Productos Destacados */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Novedades</h2>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-base-100 rounded-box">
            <p>No hay productos disponibles por el momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
