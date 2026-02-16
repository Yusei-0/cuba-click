
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Municipio {
  id: string;
  nombre: string;
}

interface ShippingCost {
  municipio_id: string;
  costo: number;
}

export const useShippingCosts = (providerId: string | undefined) => {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('');

  useEffect(() => {
    const fetchShippingData = async () => {
      if (!providerId) return;
      
      setLoading(true);
      try {
        // 1. Fetch all municipalities (for the dropdown)
        const { data: mData, error: mError } = await supabase
          .from('municipios')
          .select('id, nombre')
          .order('nombre');
        
        if (mError) throw mError;
        setMunicipios(mData || []);

        // 2. Fetch costs for this provider
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
        console.error("Error fetching shipping data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingData();
  }, [providerId]);

  return { 
    municipios, 
    costs, 
    loading, 
    selectedMunicipio, 
    setSelectedMunicipio,
    currentCost: costs[selectedMunicipio] ?? null 
  };
};
