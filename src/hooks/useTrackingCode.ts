import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateTrackingCode } from '../lib/trackingCodeGenerator';

export function useTrackingCode() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateUniqueCode = async (): Promise<string> => {
    setIsGenerating(true);
    
    try {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const code = generateTrackingCode();
        
        // Check if code already exists in database
        const { data, error } = await supabase
          .from('pedidos')
          .select('codigo_tracking')
          .eq('codigo_tracking', code)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking tracking code:', error);
          attempts++;
          continue;
        }
        
        // If code doesn't exist, return it
        if (!data) {
          setIsGenerating(false);
          return code;
        }
        
        attempts++;
      }
      
      throw new Error('Could not generate unique tracking code after ' + maxAttempts + ' attempts');
    } catch (error) {
      setIsGenerating(false);
      throw error;
    }
  };

  return {
    generateUniqueCode,
    isGenerating,
  };
}
