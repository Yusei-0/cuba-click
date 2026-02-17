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

        // 1.1 Fetch Base Currency Code if config exists
        let baseCurrencyCode = '';
        if (baseConfig.moneda_id) {
            const { data: monedaDataResult } = await supabase
                .from('monedas')
                .select('codigo')
                .eq('id', baseConfig.moneda_id)
                .single();
            
            const monedaData = monedaDataResult as any;

            if (monedaData) {
                baseCurrencyCode = monedaData.codigo;
            }
        }

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
          .eq('proveedor_id', providerId) // Provider
          .eq('moneda', moneda); // The selected currency (e.g. 'USD')
        
        if (providerError) throw providerError;

        // 3. Perform Logic
        const allowedMethodIds = (providerMethods as any[])?.map((pm: any) => pm.metodo_pago_id) || [];
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

        // 3.1 Handle Identity Case (Same Currency, Same Method)
        // If the selected currency 'moneda' (e.g. 'USD') matches 'baseCurrencyCode'
        // AND the provider supports the 'baseConfig.metodo_pago_id' (e.g. Cash)
        // Then we should add it with Rate 1.0 even if not in DB.
        
        if (baseCurrencyCode && moneda === baseCurrencyCode) {
             const baseMethodSupported = (providerMethods as any[])?.find((pm: any) => pm.metodo_pago_id === baseConfig.metodo_pago_id);
             
             if (baseMethodSupported) {
                 // Check if it's already in validRates (maybe DB has specific rate)
                 const existingRateIndex = validRates.findIndex(r => r.metodo_pago_destino_id === baseConfig.metodo_pago_id);
                 
                 if (existingRateIndex === -1) {
                     // Add identity rate
                     validRates.push({
                         metodo_pago_destino_id: baseConfig.metodo_pago_id,
                         tasa: 1, // Identity rate
                         moneda_destino: { codigo: baseCurrencyCode },
                         metodo_pago_destino: { nombre: baseMethodSupported.metodos_pago?.nombre }
                     });
                 } else {
                     // Force it to 1.0 if it's the same method ID (Identity)
                     validRates[existingRateIndex].tasa = 1;
                 }
             }
        }

        // 4. Map Results
        const finalMethods: PaymentMethod[] = [];

        validRates.forEach(rate => {
            // Filter out if the currency doesn't match the selected 'moneda'
            if (rate.moneda_destino?.codigo === moneda) {
                finalMethods.push({
                    id: rate.metodo_pago_destino_id,
                    nombre: rate.metodo_pago_destino?.nombre || 'Desconocido',
                    tasa: rate.tasa,
                    moneda_destino: rate.moneda_destino?.codigo
                });
            }
        });
        
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
