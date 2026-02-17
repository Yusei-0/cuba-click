import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PaymentMethod {
  id: string;
  nombre: string;
  tasa?: number; // Tasa de cambio aplicable (si existe)
  moneda_destino?: string; // Moneda a la que se convierte (ej: CUP)
}

interface PaymentMethodsResult {
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook para cargar métodos de pago filtrados por proveedor y moneda
 * Incluye la tasa de cambio configurada si existe.
 */
export function usePaymentMethods(
  providerId: string | undefined,
  moneda: string | undefined
): PaymentMethodsResult {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMethods() {
      if (!providerId || !moneda) {
        setMethods([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Base Configuration
        const { data: configData, error: configError } = await supabase
          .from('configuraciones')
          .select('value')
          .eq('key', 'base_exchange_source')
          .single();

        if (configError && configError.code !== 'PGRST116') {
             console.error('Error fetching config:', configError);
        }

        const baseConfig = (configData as any)?.value || { moneda_id: '', metodo_pago_id: '' };

        // 2. Fetch Provider's Allowed Methods (just the IDs)
        const { data: providerMethods, error: providerError } = await supabase
          .from('proveedor_moneda_metodos_pago')
          .select(`
            metodo_pago_id,
            metodos_pago (
              id,
              nombre
            )
          `)
          .eq('proveedor_id', providerId)
          .eq('moneda', moneda);
        
        if (providerError) throw providerError;

        // 3. Perform Logic
        // If product currency matches base currency match, we use dynamic rates.
        // Otherwise, or if no config, we might fallback or handle differently.
        // For now, assuming product currency matches base currency for this logic to apply effectively
        // or we simply look for rates starting from the Base.

        // Let's fetch compatible rates from the rates table
        // Source: Base Config
        // Destination Method: Must be one of the provider's allowed methods
        
        const allowedMethodIds = providerMethods?.map((pm: any) => pm.metodo_pago_id) || [];

        let validRates: any[] = [];

        if (baseConfig.moneda_id && baseConfig.metodo_pago_id && allowedMethodIds.length > 0) {
             const { data: ratesData, error: ratesError } = await supabase
            .from('tasas_cambio')
            .select(`
                *,
                moneda_destino:monedas!moneda_destino_id(codigo),
                metodo_pago_destino:metodos_pago!metodo_pago_destino_id(nombre)
            `)
            .eq('moneda_origen_id', baseConfig.moneda_id)
            .eq('metodo_pago_origen_id', baseConfig.metodo_pago_id)
            .in('metodo_pago_destino_id', allowedMethodIds);

            if (!ratesError) {
                validRates = ratesData || [];
            }
        }

        // 4. Map Results
        // We create a PaymentMethod for each valid rate found
        // If no rate is found for a method, maybe we shouldn't show it? 
        // Or show it with rate 1 if currency matches?
        
        const finalMethods: PaymentMethod[] = [];

        validRates.forEach(rate => {
            finalMethods.push({
                id: rate.metodo_pago_destino_id,
                nombre: rate.metodo_pago_destino?.nombre || 'Desconocido',
                tasa: rate.tasa,
                moneda_destino: rate.moneda_destino?.codigo
            });
        });
        
        // Also consider default "Same Currency" methods if they exist in provider list but not in rates?
        // For now, let's strictly return what we have rates for, AS REQUESTED "vincular las tasas... con la configuracion".
        // BUT if the base coin == target coin (e.g. USD Cash -> USD Transfer), there might not be a rate? 
        // Usually there is a rate 1.0 or with fee.
        
        setMethods(finalMethods);

      } catch (err) {
        console.error('Error loading payment methods:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setMethods([]);
      } finally {
        setLoading(false);
      }
    }

    loadMethods();
  }, [providerId, moneda]);

  return { methods, loading, error };
}
