import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../../lib/supabase";
import type { Database } from "../../../types/database.types";
import { ArrowLeft } from "lucide-react";

type ProviderInput = Database["public"]["Tables"]["proveedores"]["Insert"];

export function AdminProviderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderInput>();

  useEffect(() => {
    if (isEditing && id) {
      async function loadProvider() {
        setLoading(true);
        const { data } = await (supabase.from("proveedores") as any)
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          Object.keys(data).forEach((key) => {
            setValue(key as any, data[key]);
          });
        }
        setLoading(false);
      }
      loadProvider();
    }
  }, [id, isEditing, setValue]);

  const onSubmit = async (data: ProviderInput) => {
    setLoading(true);
    try {
      if (isEditing && id) {
        const { error } = await (supabase.from("proveedores") as any)
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("proveedores") as any).insert(
          data,
        );
        if (error) throw error;
      }
      navigate("/admin/proveedores");
    } catch (error) {
      console.error("Error saving provider:", error);
      alert("Error al guardar proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to="/admin/proveedores" className="btn btn-ghost gap-2 mb-2 px-0">
          <ArrowLeft className="w-4 h-4" /> Volver a Proveedores
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
        </h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          <div className="form-control">
            <label className="label">Nombre del Proveedor</label>
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
            <label className="label">Contacto (Teléfono/Email)</label>
            <input
              type="text"
              className="input input-bordered"
              {...register("contacto")}
            />
          </div>

          <div className="form-control mt-4">
            <label className="cursor-pointer label justify-start gap-4">
              <span className="label-text">¿Proveedor Activo?</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                {...register("activo")}
              />
            </label>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/admin/proveedores")}
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
