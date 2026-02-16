import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CatalogPage } from "./CatalogPage";
import { NotFoundPage } from "./NotFoundPage";

export function CategoryResolver() {
  const { categoryName } = useParams();
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [resolvedCategoryName, setResolvedCategoryName] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolveCategory() {
      if (!categoryName) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // 1. Try to match by slug (exact match)
        const { data: dataSlug, error: errorSlug } = await (supabase.from("categorias") as any)
          .select("id, nombre, slug")
          .eq("slug", categoryName)
          .maybeSingle();

        if (dataSlug) {
           setCategoryId(dataSlug.id);
           setResolvedCategoryName(dataSlug.nombre);
           return;
        }

        // 2. Fallback: Try to match by name (case insensitive) for backward compatibility
        const { data, error } = await (supabase.from("categorias") as any)
          .select("id, nombre")
          .ilike("nombre", categoryName.replace(/-/g, " ")) // handle dashes as spaces potentially
          .maybeSingle();

        if (error || !data) {
          // 3. Last resort: Try exact match just in case
          const { data: data2 } = await (supabase.from("categorias") as any)
            .select("id, nombre")
            .eq("nombre", categoryName)
            .maybeSingle();

          if (data2) {
            setCategoryId(data2.id);
            setResolvedCategoryName(data2.nombre);
          } else {
            console.log("Category not found for:", categoryName);
            setNotFound(true);
          }
        } else {
          setCategoryId(data.id);
          setResolvedCategoryName(data.nombre);
        }
      } catch (err) {
        console.error("Error resolving category:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    resolveCategory();
  }, [categoryName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (notFound || !categoryId) {
    return <NotFoundPage />;
  }

  return <CatalogPage categoryIdOverride={categoryId} categoryNameOverride={resolvedCategoryName} />;
}
