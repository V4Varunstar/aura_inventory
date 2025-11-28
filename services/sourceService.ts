/**
 * Source Management Service
 * Handles custom inward/outward source/channel management
 */

export interface Source {
  id: string;
  companyId: string;
  name: string;
  type: 'inward' | 'outward' | 'both';
  isActive: boolean;
  isDefault: boolean; // Default sources cannot be deleted
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// localStorage key for sources
const SOURCES_STORAGE_KEY = 'aura_inventory_sources';

// Load sources from localStorage or use defaults
const loadSources = (): Source[] => {
  const stored = localStorage.getItem(SOURCES_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }));
    } catch (e) {
      console.error('Failed to parse sources from localStorage:', e);
    }
  }
  return getDefaultSources();
};

// Save sources to localStorage
const saveSources = () => {
  localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(sources));
};

// Default sources
const getDefaultSources = (): Source[] => [
  // Default Inward Sources
  {
    id: 'src_factory',
    companyId: 'default',
    name: 'Factory',
    type: 'inward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'src_amazon_return',
    companyId: 'default',
    name: 'Amazon Return',
    type: 'inward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'src_flipkart_return',
    companyId: 'default',
    name: 'Flipkart Return',
    type: 'inward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'src_meesho_return',
    companyId: 'default',
    name: 'Meesho Return',
    type: 'inward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Default Outward Destinations
  {
    id: 'src_amazon_fba',
    companyId: 'default',
    name: 'Amazon FBA',
    type: 'outward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'src_flipkart',
    companyId: 'default',
    name: 'Flipkart',
    type: 'outward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'src_myntra',
    companyId: 'default',
    name: 'Myntra',
    type: 'outward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'src_meesho',
    companyId: 'default',
    name: 'Meesho',
    type: 'outward',
    isActive: true,
    isDefault: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Initialize sources from localStorage or defaults
let sources: Source[] = loadSources();
console.log('sourceService initialized. Total sources:', sources.length);
console.log('Inward sources:', sources.filter(s => s.type === 'inward' || s.type === 'both').map(s => s.name));
console.log('Outward sources:', sources.filter(s => s.type === 'outward' || s.type === 'both').map(s => s.name));
console.log('Checking for Meesho...');
console.log('Meesho in outward:', sources.some(s => (s.type === 'outward' || s.type === 'both') && s.name === 'Meesho'));
console.log('Meesho Return in inward:', sources.some(s => (s.type === 'inward' || s.type === 'both') && s.name === 'Meesho Return'));

/**
 * Get all sources for a company
 * @param companyId Company ID
 * @param type Optional filter by type ('inward', 'outward', or 'both')
 */
export async function getSources(
  companyId: string,
  type?: 'inward' | 'outward' | 'both'
): Promise<Source[]> {
  await new Promise(resolve => setTimeout(resolve, 100));

  let filtered = sources.filter(
    s => s.companyId === companyId || s.companyId === 'default'
  );

  // When type filter is specified, filter by type
  if (type && type !== 'both') {
    filtered = filtered.filter(s => s.type === type || s.type === 'both');
  }
  // When type is 'both' or not specified, return all sources

  return filtered.filter(s => s.isActive);
}

/**
 * Get source by ID
 */
export async function getSourceById(sourceId: string): Promise<Source | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return sources.find(s => s.id === sourceId) || null;
}

/**
 * Create new source
 */
export async function createSource(
  companyId: string,
  data: {
    name: string;
    type: 'inward' | 'outward' | 'both';
    createdBy: string;
  }
): Promise<Source> {
  await new Promise(resolve => setTimeout(resolve, 100));

  // Check for duplicate name
  const exists = sources.some(
    s =>
      (s.companyId === companyId || s.companyId === 'default') &&
      s.name.toLowerCase() === data.name.toLowerCase()
  );

  if (exists) {
    throw new Error('Source with this name already exists');
  }

  const newSource: Source = {
    id: `src_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    companyId,
    name: data.name,
    type: data.type,
    isActive: true,
    isDefault: false,
    createdBy: data.createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  sources.push(newSource);
  console.log('Creating new source:', newSource);
  saveSources();
  console.log('Saved sources to localStorage. Total sources:', sources.length);
  console.log('localStorage value:', localStorage.getItem(SOURCES_STORAGE_KEY));
  return newSource;
}

/**
 * Update source
 */
export async function updateSource(
  sourceId: string,
  data: {
    name?: string;
    type?: 'inward' | 'outward' | 'both';
    isActive?: boolean;
  }
): Promise<Source> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const index = sources.findIndex(s => s.id === sourceId);
  if (index === -1) {
    throw new Error('Source not found');
  }

  const source = sources[index];

  if (source.isDefault && data.name) {
    throw new Error('Cannot rename default sources');
  }

  if (data.name) {
    // Check for duplicate
    const exists = sources.some(
      s =>
        s.id !== sourceId &&
        s.companyId === source.companyId &&
        s.name.toLowerCase() === data.name!.toLowerCase()
    );
    if (exists) {
      throw new Error('Source with this name already exists');
    }
  }

  sources[index] = {
    ...source,
    ...data,
    updatedAt: new Date(),
  };

  saveSources();
  return sources[index];
}

/**
 * Delete source
 * Cannot delete if source is used in transactions or if it's a default source
 */
export async function deleteSource(
  sourceId: string,
  checkUsage: boolean = true
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const source = sources.find(s => s.id === sourceId);
  if (!source) {
    throw new Error('Source not found');
  }

  if (source.isDefault) {
    throw new Error('Cannot delete default sources');
  }

  if (checkUsage) {
    // In real implementation, check if source is used in inward/outward transactions
    // For now, just simulate
    const isUsed = false; // Simulate check
    if (isUsed) {
      throw new Error(
        'Cannot delete source that is used in transactions. Deactivate it instead.'
      );
    }
  }

  sources = sources.filter(s => s.id !== sourceId);
  saveSources();
}

/**
 * Check if source name is available
 */
export async function isSourceNameAvailable(
  companyId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 50));

  return !sources.some(
    s =>
      s.id !== excludeId &&
      (s.companyId === companyId || s.companyId === 'default') &&
      s.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get inward sources (backwards compatibility)
 */
export async function getInwardSources(companyId: string): Promise<string[]> {
  const inwardSources = await getSources(companyId, 'inward');
  return inwardSources.map(s => s.name);
}

/**
 * Get outward destinations (backwards compatibility)
 */
export async function getOutwardDestinations(companyId: string): Promise<string[]> {
  const outwardSources = await getSources(companyId, 'outward');
  return outwardSources.map(s => s.name);
}

/**
 * Reset sources to default (for development/testing)
 * This will clear localStorage and reinitialize with default sources
 */
export function resetToDefaultSources(): void {
  localStorage.removeItem(SOURCES_STORAGE_KEY);
  sources = getDefaultSources();
  saveSources();
  console.log('Sources reset to defaults. Total sources:', sources.length);
  console.log('Inward sources:', sources.filter(s => s.type === 'inward' || s.type === 'both').map(s => s.name));
  console.log('Outward sources:', sources.filter(s => s.type === 'outward' || s.type === 'both').map(s => s.name));
}

// Make reset function available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).resetSources = resetToDefaultSources;
  console.log('Reset function available as window.resetSources()');
}
