import { useState, useMemo } from 'react';

interface SearchOptions {
  fields: string[];
  caseSensitive?: boolean;
  minChars?: number;
}

export function useSearch<T extends Record<string, any>>(
  data: T[],
  options: SearchOptions
) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm || searchTerm.length < (options.minChars || 0)) {
      return data;
    }

    const term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();

    return data.filter(item =>
      options.fields.some(field => {
        const value = String(item[field] || '');
        const fieldValue = options.caseSensitive ? value : value.toLowerCase();
        return fieldValue.includes(term);
      })
    );
  }, [data, searchTerm, options]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
}
