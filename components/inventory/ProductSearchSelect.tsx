import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce, searchProducts } from '../../utils/searchUtils';

interface Product {
  id: string;
  sku: string;
  name: string;
  ean?: string;
  [key: string]: any;
}

interface ProductSearchSelectProps {
  label: string;
  products: Product[];
  value: string; // SKU
  onChange: (sku: string, product?: Product) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Product Search Select with debounced search
 * Searches by SKU, Name, or EAN with 250ms debounce
 */
export default function ProductSearchSelect({
  label,
  products,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Search by SKU, Name, or EAN',
}: ProductSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 250);

  // Filter products based on debounced search
  const filteredProducts = debouncedSearch 
    ? searchProducts(products, debouncedSearch)
    : products;

  // Get selected product for display
  const selectedProduct = products.find(p => p.sku === value);

  useEffect(() => {
    // Close dropdown when clearing search and value exists
    if (!searchTerm && value) {
      setShowDropdown(false);
    }
  }, [searchTerm, value]);

  const handleSelectProduct = (product: Product) => {
    onChange(product.sku, product);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Display selected product OR search input */}
      {value && selectedProduct ? (
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex-1">
            <div className="font-medium">{selectedProduct.sku}</div>
            <div className="text-sm text-gray-600">{selectedProduct.name}</div>
            {selectedProduct.ean && (
              <div className="text-xs text-gray-500">EAN: {selectedProduct.ean}</div>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}

      {/* Dropdown with filtered products */}
      {showDropdown && !value && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
            {filteredProducts.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {searchTerm ? 'No products found' : 'Type to search...'}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {product.sku}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {product.name}
                  </div>
                  {product.ean && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      EAN: {product.ean}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
