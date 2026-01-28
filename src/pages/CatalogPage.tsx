import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { ProductCard } from "../components/ui/ProductCard";

type Product = Database["public"]["Tables"]["productos"]["Row"];
type Category = Database["public"]["Tables"]["categorias"]["Row"];

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("categoria");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryId,
  );

  useEffect(() => {
    setSelectedCategory(categoryId);
  }, [categoryId]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Categories
        const { data: cats } = await supabase.from("categorias").select("*");
        if (cats) setCategories(cats);

        // Fetch Products
        let query = supabase.from("productos").select("*");

        if (selectedCategory) {
          query = query.eq("categoria_id", selectedCategory);
        }

        const { data: prods, error } = await query;
        if (error) throw error;
        if (prods) setProducts(prods);
      } catch (error) {
        console.error("Error loading catalog:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory]);

  const handleCategoryChange = (id: string | null) => {
    setSelectedCategory(id);
    if (id) {
      setSearchParams({ categoria: id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="card bg-base-100 shadow-md p-4 sticky top-20">
          <h3 className="font-bold text-lg mb-4">Categorías</h3>
          <ul className="menu bg-base-100 w-full p-0 [&_li>*]:rounded-md">
            <li>
              <button
                className={!selectedCategory ? "active" : ""}
                onClick={() => handleCategoryChange(null)}
              >
                Todas
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  className={selectedCategory === cat.id ? "active" : ""}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="grow">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.nombre ||
                "Productos"
              : "Todos los productos"}
          </h2>
          <span className="text-sm text-gray-500">
            {products.length} resultados
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="skeleton h-48 w-full"></div>
                <div className="skeleton h-4 w-28"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-base-100 rounded-box">
            <p className="text-lg text-gray-500">
              No se encontraron productos en esta categoría.
            </p>
            <button
              className="btn btn-link"
              onClick={() => handleCategoryChange(null)}
            >
              Ver todos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
