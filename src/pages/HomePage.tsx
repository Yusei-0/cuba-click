import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { ProductCard } from "../components/ui/ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Header } from "../components/layout/Header";
import { SearchBar } from "../components/ui/SearchBar";
import { CategoryList } from "../components/ui/CategoryList";
import { ProductCardSkeleton } from "../components/ui/skeletons/ProductCardSkeleton";
import { CategoryListSkeleton } from "../components/ui/skeletons/CategoryListSkeleton";


type Product = Database["public"]["Tables"]["productos"]["Row"];
type Category = Database["public"]["Tables"]["categorias"]["Row"];

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreCategories, setLoadingMoreCategories] = useState(false);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const navigate = useNavigate();
  const PAGE_SIZE = 10;

  const fetchCategories = async (from: number, to: number) => {
    try {
        const { data, error } = await supabase
            .from("categorias")
            .select("*, productos!inner(id)")
            .range(from, to)
            .order("nombre");
        
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching categories:", e);
        return [];
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productsRes, initialCategories] = await Promise.all([
          supabase
            .from("productos")
            .select("*")
            .limit(10)
            .order("created_at", { ascending: false }),
          fetchCategories(0, PAGE_SIZE - 1),
        ]);

        if (productsRes.data) setFeaturedProducts(productsRes.data);
        if (initialCategories) {
             setCategories(initialCategories);
             if (initialCategories.length < PAGE_SIZE) setHasMoreCategories(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLoadMoreCategories = async () => {
      if (loadingMoreCategories || !hasMoreCategories) return;
      
      setLoadingMoreCategories(true);
      const from = categories.length;
      const to = from + PAGE_SIZE - 1;
      
      const newCategories = await fetchCategories(from, to);
      
      if (newCategories.length > 0) {
          setCategories(prev => [...prev, ...newCategories]);
          if (newCategories.length < PAGE_SIZE) setHasMoreCategories(false);
      } else {
          setHasMoreCategories(false);
      }
      setLoadingMoreCategories(false);
  };

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    const category = categories.find((c) => c.id === id);
    if (category?.slug) {
      navigate(`/categorias/${category.slug}`);
    } else {
      navigate(`/catalogo?categoria=${id}`);
    }
  };

  // Remove blocking loader check
  // if (loading) { ... }

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-4">
        {/* Header - Always visible */}
        <Header />

        <div className="space-y-6">
          {/* Hero / Title */}


          {/* Search */}
          <div className="px-4 mt-4">
            <SearchBar onSearch={(q) => navigate(`/catalogo?busqueda=${encodeURIComponent(q)}`)} />
          </div>

          {/* Categories */}
          <div>
            <div className="px-4 flex justify-between items-end mb-2">
              <h2 className="text-lg font-bold text-gray-900">Categorías</h2>
              <Link to="/catalogo" className="text-sm text-primary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            
            {loading && categories.length === 0 ? (
               <CategoryListSkeleton />
            ) : (
                <CategoryList
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                  onEndReached={handleLoadMoreCategories}
                  isLoadingMore={loadingMoreCategories}
                />
            )}
          </div>



          {/* Featured Products */}
          <div className="px-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Productos Destacados</h2>
            
            {loading && featuredProducts.length === 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No hay productos disponibles.</p>
              </div>
            )}
          </div>
          
           {/* Footer Info */}
           <div className="px-4 py-8 mt-4 bg-gray-50 text-center space-y-4">
               <div className="flex justify-center gap-8">
                   <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 10 12 10 12 18 4 18 4 22 19 22 19 18 20 18 20 10 19 10 16 10"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                       </div>
                       <p className="text-xs font-medium text-gray-600">Envíos a toda la isla</p>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                       </div>
                       <p className="text-xs font-medium text-gray-600">Pagos 100% Seguros</p>
                   </div>
               </div>
               <p className="text-[10px] text-gray-400">© 2024 Cuba Click. Todos los derechos reservados.</p>
           </div>
        </div>
      </div>
    </MobileLayout>
  );
}
