import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CatalogPage } from "./CatalogPage";
import { NotFoundPage } from "./NotFoundPage";

export function CategoryResolver() {
  const { categoryName } = useParams();
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolveCategory() {
      if (!categoryName) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Try to match by name (case insensitive)
        const { data, error } = await (supabase.from("categorias") as any)
          .select("id")
          .ilike("nombre", categoryName.replace(/-/g, " ")) // handle dashes as spaces potentially
          .maybeSingle();

        if (error || !data) {
          // Try exact match just in case
          const { data: data2 } = await (supabase.from("categorias") as any)
            .select("id")
            .eq("nombre", categoryName)
            .maybeSingle();

          if (data2) {
            setCategoryId(data2.id);
          } else {
            setNotFound(true);
          }
        } else {
          setCategoryId(data.id);
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

  return <CatalogPage categoryIdOverride={categoryId} />;
}
