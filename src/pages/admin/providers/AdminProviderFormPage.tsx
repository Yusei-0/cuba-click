import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../../lib/supabase";
import type { Database } from "../../../types/database.types";
import { ArrowLeft, Save } from "lucide-react";
import { useToastStore } from "../../../store/useToastStore";

type ProviderInput = Database["public"]["Tables"]["proveedores"]["Insert"];

export function AdminProviderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [municipios, setMunicipios] = useState<any[]>([]);
  const [shippingCosts, setShippingCosts] = useState<Record<string, number>>(
    {},
  );

  const [metodosPago, setMetodosPago] = useState<any[]>([]);
  const [selectedMetodosPago, setSelectedMetodosPago] = useState<Set<string>>(
    new Set(),
  );

  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderInput>();

  useEffect(() => {
    async function loadData() {
      setInitialLoading(true);

      try {
        // Load initial data in parallel
        const [munRes, payRes] = await Promise.all([
          supabase
            .from("municipios")
            .select("id, nombre, provincias(nombre)")
            .order("nombre"),
          supabase.from("metodos_pago").select("*").order("nombre"),
        ]);

        if (munRes.data) setMunicipios(munRes.data);
        if (payRes.data) setMetodosPago(payRes.data);

        // If editing, load provider specific data
        if (isEditing && id) {
          const { data: provData } = await (supabase.from("proveedores") as any)
            .select("*")
            .eq("id", id)
            .single();

          if (provData) {
            Object.keys(provData).forEach((key) => {
              setValue(key as any, provData[key]);
            });
          }

          // Load costs and payment methods
          const [costsRes, methodsRes] = await Promise.all([
            (supabase.from("costos_envio") as any)
              .select("municipio_id, costo")
              .eq("proveedor_id", id),
            (supabase.from("proveedor_metodos_pago") as any)
              .select("metodo_pago_id")
              .eq("proveedor_id", id),
          ]);

          if (costsRes.data) {
            const costsMap: Record<string, number> = {};
            costsRes.data.forEach((c: any) => {
              costsMap[c.municipio_id] = c.costo;
            });
            setShippingCosts(costsMap);
          }

          if (methodsRes.data) {
            const methodIds = new Set(
              methodsRes.data.map((m: any) => m.metodo_pago_id),
            );
            setSelectedMetodosPago(methodIds as Set<string>);
          }
        }
      } catch (e) {
        console.error("Error loading data", e);
        addToast("Error al cargar datos", "error");
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [id, isEditing, setValue, addToast]);

  const handleCostChange = (municipioId: string, value: string) => {
    const numValue = parseFloat(value);
    setShippingCosts((prev) => ({
      ...prev,
      [municipioId]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const toggleMetodoPago = (metodoId: string) => {
    const next = new Set(selectedMetodosPago);
    if (next.has(metodoId)) {
      next.delete(metodoId);
    } else {
      next.add(metodoId);
    }
    setSelectedMetodosPago(next);
  };

  const onSubmit = async (data: ProviderInput) => {
    setLoading(true);
    try {
      let providerId = id;

      // 1. Save Provider
      if (isEditing && id) {
        const { error } = await (supabase.from("proveedores") as any)
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data: newProv, error } = await (
          supabase.from("proveedores") as any
        )
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        providerId = newProv.id;
      }

      // 2. Save Shipping Costs & Payment Methods
      if (providerId) {
        // Shipping Costs
        const costsToUpsert = Object.entries(shippingCosts)
          .map(([municipioId, costo]) => ({
            proveedor_id: providerId,
            municipio_id: municipioId,
            costo: costo,
          }))
          .filter((c) => c.costo >= 0);

        if (costsToUpsert.length > 0) {
          await (supabase.from("costos_envio") as any).upsert(costsToUpsert);
        }

        // Payment Methods: Delete all then insert selected (easiest sync)
        await (supabase.from("proveedor_metodos_pago") as any)
          .delete()
          .eq("proveedor_id", providerId);

        const methodsToInsert = Array.from(selectedMetodosPago).map((mid) => ({
          proveedor_id: providerId,
          metodo_pago_id: mid,
        }));

        if (methodsToInsert.length > 0) {
          await (supabase.from("proveedor_metodos_pago") as any).insert(
            methodsToInsert,
          );
        }
      }

      navigate("/admin/proveedores");
      addToast("Proveedor guardado correctamente", "success");
    } catch (error) {
      console.error("Error saving provider:", error);
      addToast("Error al guardar proveedor", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-10 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-base-300 rounded mb-6"></div>
        <div className="card bg-base-100 shadow-xl h-64"></div>
        <div className="card bg-base-100 shadow-xl h-48"></div>
        <div className="card bg-base-100 shadow-xl h-96"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <Link
          to="/admin/proveedores"
          className="btn btn-ghost gap-2 mb-2 px-0 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Proveedores
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Info del Proveedor */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-gray-700 mb-4">
              Información General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label font-medium text-gray-600">
                  Nombre del Proveedor
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:input-primary"
                  {...register("nombre", {
                    required: "El nombre es obligatorio",
                  })}
                />
                {errors.nombre && (
                  <span className="text-error text-sm mt-1">
                    {errors.nombre.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label font-medium text-gray-600">
                  Contacto
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Teléfono, email..."
                  {...register("contacto")}
                />
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="cursor-pointer label justify-start gap-4">
                <span className="label-text font-medium text-gray-600">
                  ¿Proveedor Activo?
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  {...register("activo")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-gray-700 mb-4">
              Métodos de Pago Aceptados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metodosPago.map((metodo) => (
                <label
                  key={metodo.id}
                  className="label cursor-pointer justify-start gap-3 border rounded p-2 hover:bg-base-200 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedMetodosPago.has(metodo.id)}
                    onChange={() => toggleMetodoPago(metodo.id)}
                  />
                  <span className="label-text font-medium">
                    {metodo.nombre}
                  </span>
                </label>
              ))}
              {metodosPago.length === 0 && (
                <p className="text-gray-500 italic">
                  No hay métodos de pago configurados en el sistema.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Costos de Envío */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-gray-700 mb-4">
              Costos de Envío por Municipio
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Define cuánto cobra este proveedor por enviar a cada municipio.
              Deja en 0 si es gratis o no aplica.
            </p>

            <div className="overflow-x-auto max-h-96">
              <table className="table table-zebra table-pin-rows">
                <thead>
                  <tr>
                    <th>Provincia</th>
                    <th>Municipio</th>
                    <th className="w-48">Costo de Envío ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {municipios.map((mun) => (
                    <tr key={mun.id}>
                      <td className="text-gray-500 font-medium">
                        {mun.provincias?.nombre || "-"}
                      </td>
                      <td>{mun.nombre}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="input input-bordered input-sm w-full focus:input-primary"
                          placeholder="0"
                          value={shippingCosts[mun.id] || ""}
                          onChange={(e) =>
                            handleCostChange(mun.id, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {municipios.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-gray-400"
                      >
                        No hay municipios cargados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end sticky bottom-6 z-20">
          <div className="bg-base-100 p-4 rounded-xl shadow-lg border border-base-200 flex gap-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/admin/proveedores")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Todo
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
