import { useEffect, useState } from 'react';
import { useConfigStore } from '../../store/useConfigStore';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToastStore } from '../../store/useToastStore';

export function AdminSettingsPage() {
  const { fetchConfig, updateConfig, loading: configLoading } = useConfigStore();
  const { addToast } = useToastStore();
  
  const [monedas, setMonedas] = useState<any[]>([]);
  const [metodosPago, setMetodosPago] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [baseConfig, setBaseConfig] = useState({
    moneda_id: '',
    metodo_pago_id: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [monedasRes, metodosRes, configRes] = await Promise.all([
          supabase.from('monedas').select('*').order('codigo'),
          supabase.from('metodos_pago').select('*').order('nombre'),
          fetchConfig('base_exchange_source')
        ]);

        if (monedasRes.error) throw monedasRes.error;
        if (metodosRes.error) throw metodosRes.error;

        setMonedas(monedasRes.data || []);
        setMetodosPago(metodosRes.data || []);

        if (configRes) {
            setBaseConfig(configRes);
        }

      } catch (error) {
        console.error('Error loading settings data:', error);
        addToast('Error al cargar configuraciones', 'error');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig('base_exchange_source', baseConfig);
      addToast('Configuración guardada correctamente', 'success');
    } catch (error) {
      addToast('Error al guardar configuración', 'error');
    }
  };

  if (loadingData || configLoading) {
    return <div className="p-8 text-center">Cargando configuraciones...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Configuración del Sistema</h1>

      <div className="card bg-base-100 shadow-xl max-w-2xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Configuración de Tasa Base</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Define la moneda y método de pago base que se usará como referencia para calcular los precios en otras monedas.
            Por ejemplo: USD (Efectivo).
          </p>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Moneda Base</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={baseConfig.moneda_id}
                onChange={(e) => setBaseConfig({ ...baseConfig, moneda_id: e.target.value })}
                required
              >
                <option value="">Seleccionar Moneda</option>
                {monedas.map(m => (
                  <option key={m.id} value={m.id}>{m.codigo} - {m.simbolo}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Método de Pago Base</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={baseConfig.metodo_pago_id}
                onChange={(e) => setBaseConfig({ ...baseConfig, metodo_pago_id: e.target.value })}
                required
              >
                <option value="">Seleccionar Método de Pago</option>
                {metodosPago.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div className="card-actions justify-end mt-4">
              <button type="submit" className="btn btn-primary gap-2">
                <Save className="w-4 h-4" />
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
