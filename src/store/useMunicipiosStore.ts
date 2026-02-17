import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Municipality = Database['public']['Tables']['municipios']['Row'];

interface MunicipiosState {
  municipios: Municipality[];
  loading: boolean;
  error: string | null;
  loaded: boolean; // Flag to check if data has been loaded at least once
  fetchMunicipios: () => Promise<void>;
}

export const useMunicipiosStore = create<MunicipiosState>((set, get) => ({
  municipios: [],
  loading: false,
  error: null,
  loaded: false,

  fetchMunicipios: async () => {
    // Return immediately if already loaded or currently loading
    if (get().loaded || get().loading) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('municipios')
        .select('*')
        .order('nombre');

      if (error) throw error;

      set({ 
        municipios: data || [], 
        loaded: true 
      });
    } catch (error) {
      console.error('Error fetching municipios:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
