import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types/database.types";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useToastStore } from "../../store/useToastStore";

type ProductInput = Database["public"]["Tables"]["productos"]["Insert"];

export function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([]);
  const { uploadImage, uploading: uploadingImage } = useImageUpload();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>();

  // Watch for changes in foto_url to update preview if manually entered
  const fotoUrl = watch("foto_url");

  useEffect(() => {
    if (fotoUrl) setPreviewImage(fotoUrl);
  }, [fotoUrl]);

  useEffect(() => {
    async function loadDependencies() {
      const [catRes, provRes, munRes] = await Promise.all([
        (supabase.from("categorias") as any).select("*"),
        (supabase.from("proveedores") as any).select("*"),
        (supabase.from("municipios") as any).select("*").order("nombre"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (provRes.data) setProviders(provRes.data);
      if (munRes.data) setMunicipios(munRes.data);
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
          if (data.foto_url) setPreviewImage(data.foto_url);
          
          // Ensure moneda has a default value
          if (!data.moneda) {
            setValue("moneda", "USD");
          }
        }
        
        // Load selected municipios
        const { data: munData } = await (supabase.from("producto_municipios") as any)
          .select("municipio_id")
          .eq("producto_id", id);
        if (munData) {
          setSelectedMunicipios(munData.map((m: any) => m.municipio_id));
        }
        
        setLoading(false);
      }
      loadProduct();
    } else {
      // Set default values for new products
      setValue("moneda", "USD");
      setValue("activo", true);
    }
  }, [id, isEditing, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const publicUrl = await uploadImage(file);
      if (publicUrl) {
        setValue("foto_url", publicUrl);
        setPreviewImage(publicUrl);
      }
    }
  };

  const onSubmit = async (data: ProductInput) => {
    setLoading(true);
    try {
      let productId = id;
      
      if (isEditing && id) {
        const { error } = await (supabase.from("productos") as any)
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data: newProduct, error } = await (supabase.from("productos") as any)
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        productId = newProduct.id;
      }
      
      // Update producto_municipios
      if (productId) {
        // Delete existing relations
        await (supabase.from("producto_municipios") as any)
          .delete()
          .eq("producto_id", productId);
        
        // Insert new relations
        if (selectedMunicipios.length > 0) {
          const relations = selectedMunicipios.map(munId => ({
            producto_id: productId,
            municipio_id: munId
          }));
          await (supabase.from("producto_municipios") as any).insert(relations);
        }
      }
      
      navigate("/admin/productos");
      addToast("Producto guardado exitosamente", "success");
    } catch (error) {
      console.error("Error saving product:", error);
      addToast("Error al guardar el producto", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <Link
          to="/admin/productos"
          className="btn btn-ghost gap-2 mb-2 px-0 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Productos
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditing ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: Product Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-gray-700 mb-4">
                Información General
              </h2>

              <div className="form-control">
                <label className="label font-medium text-gray-600">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Ej: Televisor Samsung 4K"
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

              <div className="form-control mt-4">
                <label className="label font-medium text-gray-600">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Breve resumen del producto (máx. 100 caracteres)"
                  maxLength={100}
                  {...register("descripcion_corta")}
                />
              </div>

              <div className="form-control mt-4">
                <label className="label font-medium text-gray-600">
                  Descripción
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 focus:textarea-primary"
                  placeholder="Detalles del producto, características, etc."
                  {...register("descripcion")}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-gray-700 mb-4">
                Precios y Garantía
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label font-medium text-gray-600">
                    Precio Costo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-full pl-8 focus:input-primary"
                      {...register("precio_costo", {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label font-medium text-gray-600">
                    Precio Venta
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered w-full pl-8 focus:input-primary font-bold"
                      {...register("precio_final", {
                        required: true,
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-medium text-gray-600">
                    Moneda
                  </label>
                  <select
                    className="select select-bordered w-full focus:select-primary"
                    value={watch("moneda") || "USD"}
                    {...register("moneda")}
                  >
                    <option value="USD">USD (Dólares)</option>
                    <option value="CUP">CUP (Pesos Cubanos)</option>
                    <option value="EUR">EUR (Euros)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label font-medium text-gray-600">
                    Garantía (días)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full focus:input-primary"
                    {...register("garantia_dias", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-gray-700 mb-4">Clasificación</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-medium text-gray-600">
                    Categoría
                  </label>
                  <select
                    className="select select-bordered w-full focus:select-primary"
                    value={watch("categoria_id") || ""}
                    {...register("categoria_id")}
                  >
                    <option value="">Seleccionar Categoría...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label font-medium text-gray-600">
                    Proveedor
                  </label>
                  <select
                    className="select select-bordered w-full focus:select-primary"
                    value={watch("proveedor_id") || ""}
                    {...register("proveedor_id")}
                  >
                    <option value="">Seleccionar Proveedor...</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-gray-700 mb-2">Restricciones de Entrega</h2>
              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div className="text-sm">
                  <p className="font-semibold">¿Cómo funciona?</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><strong>Sin selección</strong>: El producto se entrega en TODOS los municipios del proveedor</li>
                    <li><strong>Con selección</strong>: El producto SOLO se entrega en los municipios marcados</li>
                  </ul>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto border border-base-200 rounded-lg p-3">
                {municipios.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Cargando municipios...</p>
                ) : (
                  municipios.map((mun) => (
                    <label key={mun.id} className="cursor-pointer label justify-start gap-3 py-2 hover:bg-base-200 rounded transition-colors">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={selectedMunicipios.includes(mun.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMunicipios([...selectedMunicipios, mun.id]);
                          } else {
                            setSelectedMunicipios(selectedMunicipios.filter(id => id !== mun.id));
                          }
                        }}
                      />
                      <span className="label-text">{mun.nombre}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedMunicipios.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  <strong>{selectedMunicipios.length}</strong> municipio(s) seleccionado(s)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Image & Status */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-gray-700 mb-4">
                Imagen del Producto
              </h2>

              <div className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-base-50 relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploadingImage}
                />

                {uploadingImage ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <span className="loading loading-spinner text-primary loading-lg"></span>
                    <span className="mt-2 text-sm text-gray-500">
                      Subiendo imagen...
                    </span>
                  </div>
                ) : previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                      <span className="text-white font-medium flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Cambiar
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm">Haz clic o arrastra para subir</p>
                  </div>
                )}
              </div>

              <div className="divider text-xs text-gray-400">O USA UNA URL</div>

              <input
                type="text"
                placeholder="https://..."
                className="input input-bordered input-sm w-full"
                {...register("foto_url")}
              />
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-gray-700 mb-4">Estado</h2>
              <div className="form-control">
                <label className="cursor-pointer label justify-between p-0">
                  <span className="label-text font-medium text-gray-600">
                    Activo en Catálogo
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    {...register("activo")}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Si se desactiva, el producto no será visible para los
                  clientes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sticky top-6">
            <button
              type="submit"
              className="btn btn-primary w-full shadow-lg"
              disabled={loading || uploadingImage}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : isEditing ? (
                "Guardar Cambios"
              ) : (
                "Crear Producto"
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost w-full text-gray-500"
              onClick={() => navigate("/admin/productos")}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
