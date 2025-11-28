import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for debounced search
 * @param initialValue Initial search value
 * @param delay Debounce delay in milliseconds (default: 250ms)
 * @returns [searchTerm, debouncedSearchTerm, setSearchTerm]
 */
export function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Search products by name, SKU, or EAN
 * @param products Array of products
 * @param searchTerm Search query (debounced)
 * @returns Filtered products
 */
export function searchProducts<T extends { name: string; sku: string; ean?: string }>(
  products: T[],
  searchTerm: string
): T[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return products;
  }

  const lowerSearch = searchTerm.toLowerCase().trim();

  return products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(lowerSearch);
    const skuMatch = product.sku.toLowerCase().includes(lowerSearch);
    const eanMatch = product.ean?.toLowerCase().includes(lowerSearch);

    return nameMatch || skuMatch || eanMatch;
  });
}

/**
 * Search warehouses by name or location
 * @param warehouses Array of warehouses
 * @param searchTerm Search query
 * @returns Filtered warehouses
 */
export function searchWarehouses<T extends { name: string; location?: string }>(
  warehouses: T[],
  searchTerm: string
): T[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return warehouses;
  }

  const lowerSearch = searchTerm.toLowerCase().trim();

  return warehouses.filter(warehouse => {
    const nameMatch = warehouse.name.toLowerCase().includes(lowerSearch);
    const locationMatch = warehouse.location?.toLowerCase().includes(lowerSearch);

    return nameMatch || locationMatch;
  });
}
