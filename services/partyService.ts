import { Party } from '../types';

// Storage keys
const PARTIES_KEY = 'aura_inventory_parties';

// Get current company/org ID from session
const getCurrentCompanyId = (): string => {
  const userStr = localStorage.getItem('aura_inventory_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.companyId || user.orgId || 'default';
  }
  return 'default';
};

// Get all parties
export const getParties = async (): Promise<Party[]> => {
  const companyId = getCurrentCompanyId();
  const partiesStr = localStorage.getItem(PARTIES_KEY);
  
  if (!partiesStr) return [];
  
  const allParties: Party[] = JSON.parse(partiesStr);
  return allParties.filter(p => p.companyId === companyId && !p.isDeleted);
};

// Get party by ID
export const getPartyById = async (id: string): Promise<Party | null> => {
  const parties = await getParties();
  return parties.find(p => p.id === id) || null;
};

// Add new party
export const addParty = async (partyData: Partial<Party>): Promise<Party> => {
  const companyId = getCurrentCompanyId();
  const partiesStr = localStorage.getItem(PARTIES_KEY);
  const allParties: Party[] = partiesStr ? JSON.parse(partiesStr) : [];
  
  const newParty: Party = {
    id: `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: partyData.name || '',
    type: partyData.type || 'Customer',
    contactPerson: partyData.contactPerson,
    email: partyData.email,
    phone: partyData.phone,
    address: partyData.address,
    gstNumber: partyData.gstNumber,
    notes: partyData.notes,
    companyId,
    orgId: companyId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };
  
  allParties.push(newParty);
  localStorage.setItem(PARTIES_KEY, JSON.stringify(allParties));
  
  return newParty;
};

// Update party
export const updateParty = async (id: string, partyData: Partial<Party>): Promise<Party> => {
  const partiesStr = localStorage.getItem(PARTIES_KEY);
  const allParties: Party[] = partiesStr ? JSON.parse(partiesStr) : [];
  
  const index = allParties.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Party not found');
  }
  
  allParties[index] = {
    ...allParties[index],
    ...partyData,
    updatedAt: new Date(),
  };
  
  localStorage.setItem(PARTIES_KEY, JSON.stringify(allParties));
  return allParties[index];
};

// Delete party (soft delete)
export const deleteParty = async (id: string): Promise<void> => {
  const partiesStr = localStorage.getItem(PARTIES_KEY);
  const allParties: Party[] = partiesStr ? JSON.parse(partiesStr) : [];
  
  const index = allParties.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Party not found');
  }
  
  allParties[index].isDeleted = true;
  allParties[index].updatedAt = new Date();
  
  localStorage.setItem(PARTIES_KEY, JSON.stringify(allParties));
};

// Search parties by name
export const searchParties = async (searchTerm: string): Promise<Party[]> => {
  const parties = await getParties();
  if (!searchTerm) return parties;
  
  const term = searchTerm.toLowerCase();
  return parties.filter(p => 
    p.name.toLowerCase().includes(term) ||
    p.email?.toLowerCase().includes(term) ||
    p.phone?.includes(term) ||
    p.gstNumber?.toLowerCase().includes(term)
  );
};
