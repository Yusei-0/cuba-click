import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { ProductCard } from "../components/ui/ProductCard";
import { Search, Filter, X } from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Header } from "../components/layout/Header";

type Product = Database["public"]["Tables"]["productos"]["Row"];
type Category = Database["public"]["Tables"]["categorias"]["Row"];

// ... imports

interface CatalogPageProps {
  categoryIdOverride?: string;
}

export function CatalogPage({ categoryIdOverride }: CatalogPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  // If override is present, use it, UNLESS search params are explicitly set (navigation within the page)
  // Actually, simpler: searchParam takes precedence if it exists (user clicked something),
  // otherwise fallback to override.
  const queryCategory = searchParams.get("categoria");
  const categoryId = queryCategory || categoryIdOverride;

  const searchQuery = searchParams.get("busqueda") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state for inputs to allow typing before submitting/syncing
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Categories
        const { data: cats } = await supabase.from("categorias").select("*, productos!inner(id)");
        if (cats) setCategories(cats);

        // Fetch Products with filters
        let query = supabase.from("productos").select("*");

        if (categoryId) {
          query = query.eq("categoria_id", categoryId);
        }

        if (searchQuery) {
          query = query.ilike("nombre", `%${searchQuery}%`);
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
  }, [categoryId, searchQuery]);

  const handleCategoryChange = (id: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) {
      newParams.set("categoria", id);
    } else {
      newParams.delete("categoria");
    }
    setSearchParams(newParams);
    setShowMobileFilters(false); // Close mobile menu on selection
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set("busqueda", searchTerm.trim());
    } else {
      newParams.delete("busqueda");
    }
    setSearchParams(newParams);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm("");
    setShowMobileFilters(false);
  };

  const activeFiltersCount = (categoryId ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-4">
        <Header />
        <div className="flex flex-col md:flex-row gap-6 p-4">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden flex gap-2 mb-2">
            <form onSubmit={handleSearchSubmit} className="grow relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="input input-bordered w-full pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-gray-500"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
            <button
              className="btn btn-square btn-outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Filters (Desktop + Mobile Drawer style) */}
          <aside
            className={`
              fixed inset-0 z-50 bg-base-100 p-6 transition-transform duration-300 transform 
              md:relative md:transform-none md:w-64 md:shrink-0 md:bg-transparent md:p-0 md:inset-auto md:z-auto
              ${showMobileFilters ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
          >
            <div className="flex justify-between items-center md:hidden mb-6">
              <h3 className="font-bold text-xl">Filtros</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-ghost btn-circle"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Desktop Search (Hidden on mobile as it has its own active bar) */}
            <div className="hidden md:block mb-6">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input input-bordered w-full pr-10 bg-base-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 text-gray-400 hover:text-primary"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200 p-4 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Categorías</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              <ul className="menu bg-base-100 w-full p-0 [&_li>*]:rounded-md gap-1">
                <li>
                  <button
                    className={!categoryId ? "active font-bold" : ""}
                    onClick={() => handleCategoryChange(null)}
                  >
                    Todas las categorías
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={categoryId === cat.id ? "active font-bold" : ""}
                      onClick={() => handleCategoryChange(cat.id)}
                    >
                      {cat.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Mobile Overlay Backdrop */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileFilters(false)}
            ></div>
          )}

          {/* Product Grid */}
          <div className="grow">
            <div className="hidden md:flex mb-6 justify-between items-center">
              <h2 className="text-2xl font-bold">
                {categoryId
                  ? categories.find((c) => c.id === categoryId)?.nombre ||
                    "Productos"
                  : "Todos los productos"}
                {searchQuery && (
                  <span className="text-gray-500 font-normal ml-2 text-lg">
                    Resultados para "{searchQuery}"
                  </span>
                )}
              </h2>
              <span className="text-sm text-gray-500">
                {products.length} resultados
              </span>
            </div>

            {/* Mobile Filter Summary Line */}
            <div className="md:hidden flex justify-between items-center mb-4 px-1">
              <span className="text-sm text-gray-500 font-medium">
                {products.length} resultados
              </span>
              {activeFiltersCount > 0 && (
                <div className="badge badge-primary gap-1">
                  {activeFiltersCount} Filtros
                  <X className="w-3 h-3 cursor-pointer" onClick={clearFilters} />
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="skeleton h-48 w-full"></div>
                    <div className="skeleton h-4 w-28"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} variant="catalog" />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-base-100 rounded-box border border-dashed border-base-300">
                <div className="max-w-xs mx-auto">
                  <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-500 mb-6">
                    INTENTA con otra categoría o ajusta tu búsqueda.
                  </p>
                  <button
                    className="btn btn-outline btn-primary"
                    onClick={clearFilters}
                  >
                    Ver todos los productos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
