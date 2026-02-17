
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ProductDetail {
  id: string;
  nombre: string;
  descripcion: string;
  precio_costo: number;
  precio_final: number;
  foto_url: string;
  garantia_dias: number;
  categoria_id: string;
  proveedor_id: string;
  activo: boolean;
  moneda: string;
  envio_gratis?: boolean;
  categoria: { nombre: string; slug: string } | null;
  metodos_pago: { 
      metodo_pago: { 
          id: string; 
          nombre: string 
      } 
  }[];
}

export const useProductData = (slug: string) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        // Fetch product by slug (assuming slug is unique or handle fetching by ID if needed)
        // Since we don't have a slug on products table yet (oops checking schema), we might use ID.
        // Wait, schema check: products table does NOT have a slug. 
        // Initial plan said /producto/:slug.
        // I need to fetch by ID if slug is not available or resolve slug to ID if I implement slug on products.
        // For now, I will assume the route might pass an ID or I need to find the product by name->slugified? 
        // No, let's stick to ID for reliability or name if unique.
        // Let's check schema again. `nombre` is NOT unique in products.
        // The user mentioned route /producto/:slug.
        // But the schema doesn't support product slugs yet.
        // I will implement fetching by ID for now as it is safest, and if the URL uses a slug derived from name, I'd have to search by name/slug logic.
        // Let's assume for now we use ID in the route /p/:id for simplicity as per plan alias used. 
        // Or if using slug, I need a way to resolve it.
        // Let's enforce fetching by ID for now to be robust.

        const { data, error } = await supabase
          .from('productos')
          .select(`
            *,
            envio_gratis,
            categoria:categorias(nombre, slug),
            proveedor:proveedores (
              proveedor_metodos_pago (
                metodo_pago:metodos_pago(id, nombre)
              )
            )
          `)
          .eq('id', slug)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Product not found");

        // Flatten the structure for the UI
        const flattenedProduct = {
          ...data,
          metodos_pago: data.proveedor?.proveedor_metodos_pago || []
        };

        setProduct(flattenedProduct as any); 
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const getPaymentIcon = (methodName: string) => {
    const name = methodName.toLowerCase();
    if (name.includes('efectivo')) return '💵';
    if (name.includes('transferencia')) return '🏦';
    if (name.includes('tropipay')) return '💳';
    if (name.includes('zelle')) return 'Z';
    return '💰';
  };

  return { product, loading, error, getPaymentIcon };
};
