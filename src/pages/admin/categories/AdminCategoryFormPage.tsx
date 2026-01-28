import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../../lib/supabase";
import type { Database } from "../../../types/database.types";
import { ArrowLeft } from "lucide-react";

type CategoryInput = Database["public"]["Tables"]["categorias"]["Insert"];

export function AdminCategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryInput>();

  useEffect(() => {
    if (isEditing && id) {
      async function loadCategory() {
        setLoading(true);
        const { data } = await (supabase.from("categorias") as any)
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          setValue("nombre", data.nombre);
        }
        setLoading(false);
      }
      loadCategory();
    }
  }, [id, isEditing, setValue]);

  const onSubmit = async (data: CategoryInput) => {
    setLoading(true);
    try {
      if (isEditing && id) {
        const { error } = await (supabase.from("categorias") as any)
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("categorias") as any).insert(
          data,
        );
        if (error) throw error;
      }
      navigate("/admin/categorias");
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error al guardar categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to="/admin/categorias" className="btn btn-ghost gap-2 mb-2 px-0">
          <ArrowLeft className="w-4 h-4" /> Volver a Categorías
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Editar Categoría" : "Nueva Categoría"}
        </h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          <div className="form-control">
            <label className="label">Nombre de la Categoría</label>
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

          <div className="card-actions justify-end mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/admin/categorias")}
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
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
