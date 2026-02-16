import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  nombre: string;
}

interface PaymentMethodsResult {
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook para cargar métodos de pago filtrados por proveedor y moneda
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

        const { data, error: queryError } = await supabase
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

        if (queryError) throw queryError;

        // Extraer los métodos de pago de la respuesta
        const paymentMethods = data
          ?.map((item: any) => item.metodos_pago)
          .filter(Boolean) || [];

        setMethods(paymentMethods);
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
