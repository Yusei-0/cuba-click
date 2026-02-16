import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { ProductCard } from "../components/ui/ProductCard";
import { Search, Filter, X } from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Header } from "../components/layout/Header";

type Product = Database["public"]["Tables"]["productos"]["Row"];
type Category = Database["public"]["Tables"]["categorias"]["Row"];

// ... imports

import { NotFoundPage } from "./NotFoundPage";

// ... imports

interface CatalogPageProps {
  categoryIdOverride?: string;
  categoryNameOverride?: string;
  categorySlug?: string;
}

export function CatalogPage({ categoryIdOverride, categoryNameOverride, categorySlug }: CatalogPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryCategory = searchParams.get("categoria");
  // Preliminary categoryId from direct props or query params
  const directCategoryId = queryCategory || categoryIdOverride;

  const searchQuery = searchParams.get("busqueda") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  
  // We need to store the resolved ID from slug if applicable
  const [resolvedCategoryId, setResolvedCategoryId] = useState<string | null>(null);

  // Local state for inputs to allow typing before submitting/syncing
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setIsNotFound(false);
      try {
        // 1. Fetch Categories first (fast lookup)
        const { data: cats } = await supabase.from("categorias").select("*, productos!inner(id)");
        let currentCategories: Category[] = cats || [];
        if (currentCategories.length > 0) setCategories(currentCategories);

        // 2. Resolve target Category ID
        let targetId = directCategoryId;

        if (categorySlug && currentCategories.length > 0) {
            // Try to resolve slug using the loaded categories (avoids extra DB call + blocking)
            const slugLower = categorySlug.toLowerCase();
            
            // Priority 1: Exact Slug Match
            let match = currentCategories.find(c => c.slug === slugLower);
            
            // Priority 2: Exact Name Match
            if (!match) {
                match = currentCategories.find(c => c.nombre.toLowerCase() === slugLower);
            }

            // Priority 3: Fuzzy Name Match (replace dashes with spaces)
            if (!match) {
                const fuzzyName = slugLower.replace(/-/g, " ");
                match = currentCategories.find(c => c.nombre.toLowerCase() === fuzzyName);
            }

            if (match) {
                targetId = match.id;
                setResolvedCategoryId(match.id);
            } else {
                // Invalid slug provided
                console.warn("Category slug not found:", categorySlug);
                setIsNotFound(true);
                setLoading(false);
                return; 
            }
        } else if (directCategoryId) {
            // Reset resolved ID if we are using direct ID
             setResolvedCategoryId(null);
        }


        // 3. Fetch Products with filters
        let query = supabase.from("productos").select("*");

        if (targetId) {
          query = query.eq("categoria_id", targetId);
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
  }, [directCategoryId, categorySlug, searchQuery]);

  // Handle 404 immediately
  if (isNotFound) {
      return <NotFoundPage />;
  }

  const activeCategoryId = resolvedCategoryId || directCategoryId;

  const handleCategoryChange = (id: string | null) => {
    if (id) {
       const category = categories.find((c) => c.id === id);
       if (category?.slug) {
          navigate(`/categorias/${category.slug}`);
       } else {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("categoria", id);
          setSearchParams(newParams);
       }
    } else {
      navigate("/catalogo");
    }
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
 
  // Re-calculate activeFiltersCount using activeCategoryId
  const activeFiltersCount = (activeCategoryId ? 1 : 0) + (searchQuery ? 1 : 0);

  // Determine page title
  const getPageTitle = () => {
     if (activeCategoryId && activeCategoryId === categoryIdOverride && categoryNameOverride) {
         return categoryNameOverride;
     }
     if (activeCategoryId) {
         return categories.find((c) => c.id === activeCategoryId)?.nombre || "Productos";
     }
     return "Todos los productos";
  };

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-4">
        <Header />
        <div className="flex flex-col md:flex-row gap-6 p-4">
            {/* Mobile Category Title */}
          <div className="md:hidden mb-1 px-1">
            {loading && !activeCategoryId ? (
               <div className="skeleton h-9 w-48 mb-1 rounded-lg"></div>
            ) : (
                <h1 className="text-3xl font-extrabold text-gray-900 capitalize tracking-tight">
                {getPageTitle()}
                </h1>
            )}
          </div>

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
                    className={!activeCategoryId ? "active font-bold" : ""}
                    onClick={() => handleCategoryChange(null)}
                  >
                    Todas las categorías
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={activeCategoryId === cat.id ? "active font-bold" : ""}
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
              {loading && !activeCategoryId ? (
                  <div className="skeleton h-8 w-64 rounded-lg"></div>
              ) : (
                  <h2 className="text-2xl font-bold">
                    {getPageTitle()}
                    {searchQuery && (
                      <span className="text-gray-500 font-normal ml-2 text-lg">
                        Resultados para "{searchQuery}"
                      </span>
                    )}
                  </h2>
              )}

              <span className="text-sm text-gray-500">
                {products.length} resultados
              </span>
            </div>

            {/* Mobile Filter Summary Line */}
            <div className="md:hidden flex justify-between items-center mb-4 px-1 min-h-[32px]">
              <span className="text-sm text-gray-500 font-medium">
                {products.length} resultados
              </span>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="btn btn-xs btn-error btn-outline gap-1 rounded-full normal-case font-medium"
                >
                  <X className="w-3 h-3" />
                  Limpiar filtros ({activeFiltersCount})
                </button>
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
