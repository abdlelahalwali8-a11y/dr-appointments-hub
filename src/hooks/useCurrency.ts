import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrencySettings {
  currency_code: string;
  currency_symbol: string;
  currency_name: string;
}

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencySettings>({
    currency_code: 'YER',
    currency_symbol: 'ر.ي',
    currency_name: 'ريال يمني',
  });

  useEffect(() => {
    fetchCurrencySettings();
  }, []);

  const fetchCurrencySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('center_settings')
        .select('currency_code, currency_symbol, currency_name')
        .single();

      if (data && !error) {
        setCurrency({
          currency_code: data.currency_code || 'YER',
          currency_symbol: data.currency_symbol || 'ر.ي',
          currency_name: data.currency_name || 'ريال يمني',
        });
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error);
    }
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return `0 ${currency.currency_symbol}`;
    return `${amount.toLocaleString('ar-YE')} ${currency.currency_symbol}`;
  };

  return {
    ...currency,
    formatCurrency,
  };
};
