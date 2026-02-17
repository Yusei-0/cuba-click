import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToastStore } from "../../../store/useToastStore";
import { supabase } from "../../../lib/supabase";
import type { Database } from "../../../types/database.types";
import { Plus, Edit, Trash2, Search } from "lucide-react";

type Category = Database["public"]["Tables"]["categorias"]["Row"];

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToastStore();

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) console.error(error);
    else setCategories((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "¿Estás seguro? Esto podría afectar a productos asociados.",
      )
    )
      return;

    try {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
      addToast("Categoría eliminada correctamente", "success");
    } catch (err) {
      console.error("Error deleting:", err);
      addToast("Error al eliminar categoría", "error");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Link to="/admin/categorias/nueva" className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nueva Categoría
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-xl">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center py-10">
                  Cargando...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-10">
                  No hay categorías.
                </td>
              </tr>
            ) : (
              filteredCategories.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-medium text-lg">{c.nombre}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/categorias/editar/${c.id}`}
                        className="btn btn-sm btn-square btn-ghost"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="btn btn-sm btn-square btn-ghost"
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
