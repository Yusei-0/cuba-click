import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import type { Database } from "../../../types/database.types";
import { Plus, Edit, Trash2, Search, Phone } from "lucide-react";

type Provider = Database["public"]["Tables"]["proveedores"]["Row"];

export function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) console.error(error);
    else setProviders((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar proveedor?")) return;

    try {
      const { error } = await supabase
        .from("proveedores")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setProviders(providers.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Error al eliminar proveedor");
    }
  };

  const filteredProviders = providers.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <Link to="/admin/proveedores/nuevo" className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Nuevo Proveedor
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar proveedores..."
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
              <th>Contacto</th>
              <th>Activo</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  Cargando...
                </td>
              </tr>
            ) : filteredProviders.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  No hay proveedores.
                </td>
              </tr>
            ) : (
              filteredProviders.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-bold">{p.nombre}</td>
                  <td>
                    {p.contacto ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {p.contacto}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${p.activo ? "badge-success" : "badge-ghost"}`}
                    >
                      {p.activo ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/proveedores/${p.id}`}
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
