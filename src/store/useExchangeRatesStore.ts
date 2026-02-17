import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type TasaCambio = Database['public']['Tables']['tasas_cambio']['Row'];
type TasaCambioInsert = Database['public']['Tables']['tasas_cambio']['Insert'];

interface TasaCambioWithDetails extends TasaCambio {
  moneda_origen?: { codigo: string };
  metodo_pago_origen?: { nombre: string };
  moneda_destino?: { codigo: string };
  metodo_pago_destino?: { nombre: string };
}

interface ExchangeRatesState {
  rates: TasaCambioWithDetails[];
  loading: boolean;
  error: string | null;
  fetchRates: () => Promise<void>;
  addRate: (rate: TasaCambioInsert) => Promise<void>;
  updateRate: (id: string, tasa: number) => Promise<void>;
  deleteRate: (id: string) => Promise<void>;
}

export const useExchangeRatesStore = create<ExchangeRatesState>((set) => ({
  rates: [],
  loading: false,
  error: null,

  fetchRates: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasas_cambio')
        .select(`
          *,
          moneda_origen:monedas!moneda_origen_id(codigo),
          metodo_pago_origen:metodos_pago!metodo_pago_origen_id(nombre),
          moneda_destino:monedas!moneda_destino_id(codigo),
          metodo_pago_destino:metodos_pago!metodo_pago_destino_id(nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ rates: data as any || [] }); // Cast to any because the types are complex with joins
    } catch (error) {
      console.error('Error fetching rates:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addRate: async (rate: TasaCambioInsert) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasas_cambio')
        // @ts-ignore
        .insert(rate as any) 
        .select(`
          *,
          moneda_origen:monedas!moneda_origen_id(codigo),
          metodo_pago_origen:metodos_pago!metodo_pago_origen_id(nombre),
          moneda_destino:monedas!moneda_destino_id(codigo),
          metodo_pago_destino:metodos_pago!metodo_pago_destino_id(nombre)
        `)
        .single();

      if (error) throw error;
      set((state) => ({ rates: [data as any, ...state.rates] }));
    } catch (error) {
      console.error('Error adding rate:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateRate: async (id, tasa) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('tasas_cambio')
        // @ts-ignore
        .update({ tasa, actualizado_en: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        rates: state.rates.map((r) => 
          r.id === id ? { ...r, tasa, actualizado_en: new Date().toISOString() } : r
        ),
      }));
    } catch (error) {
      console.error('Error updating rate:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteRate: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('tasas_cambio')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        rates: state.rates.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting rate:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
