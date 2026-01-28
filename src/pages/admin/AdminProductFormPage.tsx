import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types/database.types";
import { ArrowLeft } from "lucide-react";

type ProductInput = Database["public"]["Tables"]["productos"]["Insert"];

export function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>();

  useEffect(() => {
    async function loadDependencies() {
      const [catRes, provRes] = await Promise.all([
        (supabase.from("categorias") as any).select("*"),
        (supabase.from("proveedores") as any).select("*"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (provRes.data) setProviders(provRes.data);
    }
    loadDependencies();

    if (isEditing && id) {
      async function loadProduct() {
        setLoading(true);
        const { data } = await (supabase.from("productos") as any)
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          // Set form values
          Object.keys(data).forEach((key) => {
            setValue(key as any, data[key]);
          });
        }
        setLoading(false);
      }
      loadProduct();
    }
  }, [id, isEditing, setValue]);

  const onSubmit = async (data: ProductInput) => {
    setLoading(true);
    try {
      if (isEditing && id) {
        const { error } = await (supabase.from("productos") as any)
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("productos") as any).insert(
          data,
        );
        if (error) throw error;
      }
      navigate("/admin/productos");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/admin/productos" className="btn btn-ghost gap-2 mb-2 px-0">
          <ArrowLeft className="w-4 h-4" /> Volver a Productos
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          {/* Basic Info */}
          <div className="form-control">
            <label className="label">Nombre del Producto</label>
            <input
              type="text"
              className="input input-bordered"
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
            {errors.nombre && (
              <span className="text-error text-sm mt-1">
                {errors.nombre.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label">Descripción</label>
            <textarea
              className="textarea textarea-bordered h-24"
              {...register("descripcion")}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">Precio Costo</label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered"
                {...register("precio_costo", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="form-control">
              <label className="label">Precio Final (Venta)</label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered"
                {...register("precio_final", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">URL de la Foto</label>
            <input
              type="text"
              placeholder="https://ejemplo.com/imagen.jpg"
              className="input input-bordered"
              {...register("foto_url")}
            />
            <label className="label text-xs text-gray-400">
              * Por ahora usa URLs externas o sube a un bucket público y pega el
              link.
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">Categoría</label>
              <select
                className="select select-bordered"
                {...register("categoria_id")}
              >
                <option value="">Seleccionar...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">Proveedor</label>
              <select
                className="select select-bordered"
                {...register("proveedor_id")}
              >
                <option value="">Seleccionar...</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">Garantía (días)</label>
              <input
                type="number"
                className="input input-bordered"
                {...register("garantia_dias", { valueAsNumber: true })}
              />
            </div>
            <div className="form-control">
              <label className="cursor-pointer label justify-start gap-4">
                <span className="label-text">¿Producto Activo?</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  {...register("activo")}
                />
              </label>
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/admin/productos")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Guardar Producto"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
