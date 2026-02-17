import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useMunicipiosStore } from '../store/useMunicipiosStore';

interface ShippingCost {
  municipio_id: string;
  costo: number;
}

export const useShippingCosts = (providerId: string | undefined) => {
  const { municipios, fetchMunicipios } = useMunicipiosStore();
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('');

  // 1. Fetch Municipios (Cached)
  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  // 2. Fetch Costs for Provider
  useEffect(() => {
    const fetchCosts = async () => {
      if (!providerId) {
        setCosts({});
        return;
      }
      
      setLoading(true);
      try {
        const { data: cData, error: cError } = await supabase
          .from('costos_envio')
          .select('municipio_id, costo')
          .eq('proveedor_id', providerId);

        if (cError) throw cError;

        const costMap: Record<string, number> = {};
        cData?.forEach((item: ShippingCost) => {
          costMap[item.municipio_id] = item.costo;
        });
        setCosts(costMap);
      } catch (err) {
        console.error("Error fetching shipping costs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, [providerId]);

  return { 
    municipios, 
    costs, 
    loading, 
    selectedMunicipio, 
    setSelectedMunicipio,
    currentCost: selectedMunicipio ? (costs[selectedMunicipio] ?? 0) : null 
  };
};
