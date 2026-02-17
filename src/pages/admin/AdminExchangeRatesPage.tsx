import { useState, useEffect } from 'react';
import type { Database } from '../../types/database.types';
import { Save, Plus, Trash2, ArrowRight, X } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import { useExchangeRatesStore } from '../../store/useExchangeRatesStore';
import { supabase } from '../../lib/supabase';

type Moneda = Database['public']['Tables']['monedas']['Row'];
type MetodoPago = Database['public']['Tables']['metodos_pago']['Row'];

export function AdminExchangeRatesPage() {
  const { rates: tasas, loading, fetchRates, addRate, updateRate, deleteRate } = useExchangeRatesStore();
  const { addToast } = useToastStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Auxiliary Data State
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [loadingAux, setLoadingAux] = useState(true);

  // New Rate State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRate, setNewRate] = useState({
    moneda_origen_id: '',
    metodo_pago_origen_id: '',
    moneda_destino_id: '',
    metodo_pago_destino_id: '',
    tasa: ''
  });

  useEffect(() => {
    fetchRates();
    fetchAuxData();
  }, []);

  const fetchAuxData = async () => {
    try {
      const [monedasRes, metodosRes] = await Promise.all([
        supabase.from('monedas').select('*').order('codigo'),
        supabase.from('metodos_pago').select('*').order('nombre')
      ]);

      if (monedasRes.error) throw monedasRes.error;
      if (metodosRes.error) throw metodosRes.error;

      setMonedas(monedasRes.data || []);
      setMetodosPago(metodosRes.data || []);
    } catch (error) {
      console.error('Error loading aux data:', error);
      addToast('Error al cargar monedas y métodos de pago', 'error');
    } finally {
      setLoadingAux(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const value = parseFloat(editValue);
    if (isNaN(value) || value <= 0) {
      addToast('Ingrese un valor válido', 'error');
      return;
    }

    try {
      await updateRate(id, value);
      addToast('Tasa actualizada correctamente', 'success');
      setEditingId(null);
    } catch (error) {
      addToast('Error al actualizar la tasa', 'error');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const tasaValue = parseFloat(newRate.tasa);
    if (
      !newRate.moneda_origen_id ||
      !newRate.metodo_pago_origen_id ||
      !newRate.moneda_destino_id ||
      !newRate.metodo_pago_destino_id ||
      isNaN(tasaValue) || 
      tasaValue <= 0
    ) {
      addToast('Complete todos los campos correctamente', 'error');
      return;
    }

    try {
      await addRate({
        moneda_origen_id: newRate.moneda_origen_id,
        metodo_pago_origen_id: newRate.metodo_pago_origen_id,
        moneda_destino_id: newRate.moneda_destino_id,
        metodo_pago_destino_id: newRate.metodo_pago_destino_id,
        tasa: tasaValue,
      });
      addToast('Tasa agregada correctamente', 'success');
      setShowAddForm(false);
      setNewRate({
        moneda_origen_id: '',
        metodo_pago_origen_id: '',
        moneda_destino_id: '',
        metodo_pago_destino_id: '',
        tasa: ''
      });
    } catch (error) {
      addToast('Error al agregar la tasa', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tasa?')) return;
    
    try {
      await deleteRate(id);
      addToast('Tasa eliminada correctamente', 'success');
    } catch (error) {
      addToast('Error al eliminar la tasa', 'error');
    }
  };

  const startEdit = (tasa: any) => {
    setEditingId(tasa.id);
    setEditValue(tasa.tasa.toString());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tasas de Cambio</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary btn-sm gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancelar' : 'Nueva Tasa'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4">Nueva Tasa de Cambio</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Origen */}
            <div className="space-y-2">
               <h3 className="text-sm font-semibold text-gray-500">Origen</h3>
               <div>
                  <label className="block text-xs text-gray-400 mb-1">Moneda</label>
                  <select
                    className="select select-bordered w-full select-sm"
                    value={newRate.moneda_origen_id}
                    onChange={(e) => setNewRate({ ...newRate, moneda_origen_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar Moneda</option>
                    {monedas.map(m => (
                      <option key={m.id} value={m.id}>{m.codigo} - {m.simbolo}</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-xs text-gray-400 mb-1">Método de Pago</label>
                  <select
                    className="select select-bordered w-full select-sm"
                    value={newRate.metodo_pago_origen_id}
                    onChange={(e) => setNewRate({ ...newRate, metodo_pago_origen_id: e.target.value })}
                    required
                  >
                     <option value="">Seleccionar Método</option>
                    {metodosPago.map(mp => (
                      <option key={mp.id} value={mp.id}>{mp.nombre}</option>
                    ))}
                  </select>
               </div>
            </div>

            {/* Destino */}
            <div className="space-y-2">
               <h3 className="text-sm font-semibold text-gray-500">Destino</h3>
               <div>
                  <label className="block text-xs text-gray-400 mb-1">Moneda</label>
                  <select
                    className="select select-bordered w-full select-sm"
                    value={newRate.moneda_destino_id}
                    onChange={(e) => setNewRate({ ...newRate, moneda_destino_id: e.target.value })}
                    required
                  >
                     <option value="">Seleccionar Moneda</option>
                    {monedas.map(m => (
                      <option key={m.id} value={m.id}>{m.codigo} - {m.simbolo}</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-xs text-gray-400 mb-1">Método de Pago</label>
                  <select
                    className="select select-bordered w-full select-sm"
                    value={newRate.metodo_pago_destino_id}
                    onChange={(e) => setNewRate({ ...newRate, metodo_pago_destino_id: e.target.value })}
                    required
                  >
                     <option value="">Seleccionar Método</option>
                    {metodosPago.map(mp => (
                      <option key={mp.id} value={mp.id}>{mp.nombre}</option>
                    ))}
                  </select>
               </div>
            </div>

            {/* Tasa y Acción */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500">Valor</h3>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tasa de Cambio</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  className="input input-bordered w-full input-sm"
                  value={newRate.tasa}
                  onChange={(e) => setNewRate({ ...newRate, tasa: e.target.value })}
                  required
                />
              </div>
              <div className="pt-6">
                 <button type="submit" className="btn btn-primary w-full btn-sm" disabled={loading || loadingAux}>
                  {loading ? 'Guardando...' : 'Guardar Tasa'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
              <th className="px-6 py-3 text-left"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && tasas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Cargando...</td>
              </tr>
            ) : tasas.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay tasas de cambio registradas</td>
                </tr>
            ) : tasas.map((tasa) => (
              <tr key={tasa.id}>
                {/* Origen */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{tasa.moneda_origen?.codigo}</span>
                    <span className="text-xs text-gray-500">{tasa.metodo_pago_origen?.nombre}</span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  <ArrowRight className="w-5 h-5" />
                </td>

                {/* Destino */}
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{tasa.moneda_destino?.codigo}</span>
                    <span className="text-xs text-gray-500">{tasa.metodo_pago_destino?.nombre}</span>
                  </div>
                </td>

                {/* Tasa */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === tasa.id ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input input-sm input-bordered w-32"
                      step="0.01"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{tasa.tasa}</span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === tasa.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdate(tasa.id)}
                        className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900 bg-gray-50 p-1 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(tasa)}
                        className="text-primary hover:text-primary-dark"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(tasa.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
