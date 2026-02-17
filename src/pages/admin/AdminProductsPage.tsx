import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types/database.types";
import { Plus, Edit, Trash2, Search } from "lucide-react";

type Product = Database["public"]["Tables"]["productos"]["Row"];

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const query = supabase
      .from("productos")
      .select("*, categorias(nombre), proveedores(nombre)")
      .order("created_at", { ascending: false });

    // Simple client side search or server side if needed later.
    // For now get all and filter client side or basic search

    const { data, error } = await query;
    if (error) console.error(error);
    else setProducts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?"))
      return;

    try {
      const { error } = await supabase.from("productos").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Error al eliminar producto");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
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
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio Final</th>
              <th>Categoría</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  Cargando...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  No hay productos encontrados.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12 bg-base-200">
                        {p.foto_url && <img src={p.foto_url} alt={p.nombre} />}
                      </div>
                    </div>
                  </td>
                  <td className="font-bold">{p.nombre}</td>
                  <td>${p.precio_final}</td>
                  <td>{p.categorias?.nombre || "-"}</td>
                  <td>
                    <span
                      className={`badge ${p.activo ? "badge-success" : "badge-ghost"}`}
                    >
                      {p.activo ? "Sí" : "No"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/productos/editar/${p.id}`}
                        className="btn btn-sm btn-square btn-ghost"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
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
