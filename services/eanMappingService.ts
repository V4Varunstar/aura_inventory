interface EanMapping {
  id: string;
  ean: string;
  productId: string;
  productName: string;
  productSku: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEanMappingData {
  ean: string;
  productId: string;
}

interface BulkImportRow {
  ean: string;
  productName: string;
  productId?: string;
  status?: 'success' | 'error';
  error?: string;
}

// Mock storage
let eanMappings: EanMapping[] = [];

/**
 * Get all EAN mappings for a company
 */
export async function getEanMappings(companyId: string): Promise<EanMapping[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return eanMappings.filter(m => m.companyId === companyId);
}

/**
 * Get EAN mapping by EAN code
 */
export async function getEanMappingByEan(companyId: string, ean: string): Promise<EanMapping | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return eanMappings.find(m => m.companyId === companyId && m.ean === ean) || null;
}

/**
 * Get EAN mapping by product ID
 */
export async function getEanMappingsByProductId(companyId: string, productId: string): Promise<EanMapping[]> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return eanMappings.filter(m => m.companyId === companyId && m.productId === productId);
}

/**
 * Create new EAN mapping
 */
export async function createEanMapping(
  companyId: string,
  data: CreateEanMappingData,
  productName: string,
  productSku: string
): Promise<EanMapping> {
  await new Promise(resolve => setTimeout(resolve, 100));

  // Check if EAN already exists
  const existing = eanMappings.find(m => m.companyId === companyId && m.ean === data.ean);
  if (existing) {
    throw new Error(`EAN ${data.ean} already exists`);
  }

  const newMapping: EanMapping = {
    id: `ean-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ean: data.ean,
    productId: data.productId,
    productName,
    productSku,
    companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  eanMappings.push(newMapping);
  return newMapping;
}

/**
 * Update EAN mapping
 */
export async function updateEanMapping(
  mappingId: string,
  data: Partial<CreateEanMappingData>,
  productName?: string,
  productSku?: string
): Promise<EanMapping> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const index = eanMappings.findIndex(m => m.id === mappingId);
  if (index === -1) {
    throw new Error('EAN mapping not found');
  }

  // Check if updating to an EAN that already exists
  if (data.ean && data.ean !== eanMappings[index].ean) {
    const existing = eanMappings.find(m => 
      m.companyId === eanMappings[index].companyId && 
      m.ean === data.ean
    );
    if (existing) {
      throw new Error(`EAN ${data.ean} already exists`);
    }
  }

  eanMappings[index] = {
    ...eanMappings[index],
    ...data,
    ...(productName && { productName }),
    ...(productSku && { productSku }),
    updatedAt: new Date().toISOString()
  };

  return eanMappings[index];
}

/**
 * Delete EAN mapping
 */
export async function deleteEanMapping(mappingId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  eanMappings = eanMappings.filter(m => m.id !== mappingId);
}

/**
 * Bulk import EAN mappings
 */
export async function bulkImportEanMappings(
  companyId: string,
  rows: BulkImportRow[],
  products: Array<{ id: string; name: string; sku: string }>
): Promise<{ success: number; errors: BulkImportRow[] }> {
  await new Promise(resolve => setTimeout(resolve, 200));

  let successCount = 0;
  const errors: BulkImportRow[] = [];

  for (const row of rows) {
    try {
      // Validate EAN
      if (!row.ean || row.ean.trim() === '') {
        errors.push({ ...row, status: 'error', error: 'EAN is required' });
        continue;
      }

      // Check if EAN already exists
      const existing = eanMappings.find(m => m.companyId === companyId && m.ean === row.ean);
      if (existing) {
        errors.push({ ...row, status: 'error', error: 'EAN already exists' });
        continue;
      }

      // Find product by name or ID
      let product;
      if (row.productId) {
        product = products.find(p => p.id === row.productId);
      } else if (row.productName) {
        product = products.find(p => 
          p.name.toLowerCase() === row.productName.toLowerCase()
        );
      }

      if (!product) {
        errors.push({ ...row, status: 'error', error: 'Product not found' });
        continue;
      }

      // Create mapping
      const newMapping: EanMapping = {
        id: `ean-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ean: row.ean,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      eanMappings.push(newMapping);
      successCount++;
    } catch (error) {
      errors.push({ 
        ...row, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return { success: successCount, errors };
}

/**
 * Search EAN mappings by EAN or product name
 */
export async function searchEanMappings(
  companyId: string,
  query: string
): Promise<EanMapping[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const lowerQuery = query.toLowerCase();
  
  return eanMappings.filter(m => 
    m.companyId === companyId && (
      m.ean.toLowerCase().includes(lowerQuery) ||
      m.productName.toLowerCase().includes(lowerQuery) ||
      m.productSku.toLowerCase().includes(lowerQuery)
    )
  );
}
