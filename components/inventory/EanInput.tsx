import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import Input from '../ui/Input';
import { getEanMappingByEan } from '../../services/eanMappingService';
import { useCompany } from '../../context/CompanyContext';

interface EanInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductFound?: (productId: string, sku: string, productName: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * EAN Input Component with auto-lookup
 * When user enters EAN, automatically looks up product and triggers callback
 */
export default function EanInput({
  value,
  onChange,
  onProductFound,
  label = 'EAN / Barcode',
  placeholder = 'Scan or enter EAN',
  required = false,
  disabled = false,
}: EanInputProps) {
  const { company } = useCompany();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [foundProduct, setFoundProduct] = useState<string>('');
  const lastNotifiedProductId = useRef<string | null>(null);

  useEffect(() => {
    // Debounce EAN lookup
    if (!value || value.length < 3 || !company) {
      setLookupStatus('idle');
      setFoundProduct('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsLookingUp(true);
      try {
        const mapping = await getEanMappingByEan(company.id, value);
        
        if (mapping) {
          setLookupStatus('found');
          setFoundProduct(`${mapping.productSku} - ${mapping.productName}`);
          
          // Only notify if this is a different product than last time
          if (onProductFound && lastNotifiedProductId.current !== mapping.productId) {
            lastNotifiedProductId.current = mapping.productId;
            onProductFound(
              mapping.productId,
              mapping.productSku,
              mapping.productName
            );
          }
        } else {
          setLookupStatus('not-found');
          setFoundProduct('');
          lastNotifiedProductId.current = null;
        }
      } catch (error) {
        console.error('EAN lookup error:', error);
        setLookupStatus('not-found');
      } finally {
        setIsLookingUp(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, company]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        <div className="absolute right-3 top-9">
          {isLookingUp && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          )}
          {!isLookingUp && lookupStatus === 'found' && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          {!isLookingUp && lookupStatus === 'not-found' && value.length >= 3 && (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
      </div>

      {/* Status messages */}
      {lookupStatus === 'found' && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          <strong>Product Found:</strong> {foundProduct}
        </div>
      )}
      
      {lookupStatus === 'not-found' && value.length >= 3 && (
        <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
          EAN not mapped.{' '}
          <a href="/#/product-mapping" className="underline font-medium">
            Add mapping?
          </a>
        </div>
      )}
    </div>
  );
}
