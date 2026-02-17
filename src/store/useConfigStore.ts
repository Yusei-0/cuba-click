import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface ConfigState {
  configs: Record<string, any>;
  loading: boolean;
  error: string | null;
  fetchConfig: (key: string) => Promise<any>;
  updateConfig: (key: string, value: any) => Promise<void>;
  fetchAllConfigs: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  configs: {},
  loading: false,
  error: null,

  fetchConfig: async (key: string) => {
    // Return from cache if exists
    if (get().configs[key]) return get().configs[key];

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('configuraciones')
        .select('value')
        .eq('key', key)
        .single();

      if (error) throw error;

      // Cast data to any to avoid 'never' type issues
      const value = (data as any)?.value;
      set((state) => ({
        configs: { ...state.configs, [key]: value },
        loading: false,
      }));
      return value;
    } catch (error) {
      console.error(`Error fetching config ${key}:`, error);
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  fetchAllConfigs: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('configuraciones')
        .select('key, value');

      if (error) throw error;

      const configs = (data as any[]).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);

      set({ configs, loading: false });
    } catch (error) {
      console.error('Error fetching all configs:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateConfig: async (key: string, value: any) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('configuraciones')
        .upsert({ 
            key, 
            value, 
            updated_at: new Date().toISOString() 
        } as any);

      if (error) throw error;

      set((state) => ({
        configs: { ...state.configs, [key]: value },
        loading: false,
      }));
    } catch (error) {
      console.error(`Error updating config ${key}:`, error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
