import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFavorites } from '../hooks/useFavorites';
import { ProductCard } from '../components/ui/ProductCard';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Header } from '../components/layout/Header';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*, categoria:categorias(nombre, slug)')
          .in('id', favorites);

        if (error) {
          console.error('Error fetching favorites:', error);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [favorites]);

  return (
    <MobileLayout>
      <Header />
      
      {/* Page Title - Standardized with Catalog style but for Favorites */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Favoritos
          <Heart className="fill-red-500 text-red-500 mt-1" size={24} />
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {products.length} {products.length === 1 ? 'producto guardado' : 'productos guardados'}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 h-[280px] flex flex-col gap-3 animate-pulse">
                <div className="w-full h-40 bg-gray-100 rounded-2xl"></div>
                <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
                <div className="w-1/2 h-6 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                variant="default" // Using default variant as requested/standard
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Aún no tienes favoritos</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[200px]">
              Guarda los productos que te gusten para verlos aquí más tarde.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              Explorar Tienda
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
