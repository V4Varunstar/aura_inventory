import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import { useToast } from '../context/ToastContext';
import { Party } from '../types';
import { getParties, addParty, updateParty, deleteParty } from '../services/partyService';
import { PlusCircle, Edit, Trash2, Users } from 'lucide-react';

const PartyForm: React.FC<{
  party: Partial<Party> | null;
  onSave: (party: Partial<Party>) => void;
  onCancel: () => void;
}> = ({ party, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Party>>(party || { type: 'Customer' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input 
        name="name" 
        label="Party Name" 
        value={formData.name || ''} 
        onChange={handleChange} 
        required 
        placeholder="Enter party/customer name"
      />
      
      <Select
        name="type"
        label="Party Type"
        value={formData.type || 'Customer'}
        onChange={handleChange}
        required
      >
        <option value="Customer">Customer</option>
        <option value="Supplier">Supplier</option>
        <option value="Both">Both</option>
      </Select>

      <Input 
        name="contactPerson" 
        label="Contact Person" 
        value={formData.contactPerson || ''} 
        onChange={handleChange} 
        placeholder="Contact person name"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input 
          name="email" 
          label="Email" 
          type="email"
          value={formData.email || ''} 
          onChange={handleChange} 
          placeholder="email@example.com"
        />
        
        <Input 
          name="phone" 
          label="Phone" 
          value={formData.phone || ''} 
          onChange={handleChange} 
          placeholder="+91 1234567890"
        />
      </div>

      <Input 
        name="address" 
        label="Address" 
        value={formData.address || ''} 
        onChange={handleChange} 
        placeholder="Full address"
      />

      <Input 
        name="gstNumber" 
        label="GST Number" 
        value={formData.gstNumber || ''} 
        onChange={handleChange} 
        placeholder="GSTIN (optional)"
      />

      <Input 
        name="notes" 
        label="Notes" 
        value={formData.notes || ''} 
        onChange={handleChange} 
        placeholder="Additional notes"
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{party?.id ? 'Update' : 'Create'} Party</Button>
      </div>
    </form>
  );
};

const Parties: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Partial<Party> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const fetchedParties = await getParties();
      setParties(fetchedParties);
    } catch (error) {
      addToast('Failed to fetch parties', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (party?: Party) => {
    setEditingParty(party || { type: 'Customer' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingParty(null);
    setIsModalOpen(false);
  };

  const handleSaveParty = async (data: Partial<Party>) => {
    try {
      if (data.id) {
        await updateParty(data.id, data);
        addToast('Party updated successfully', 'success');
      } else {
        await addParty(data);
        addToast('Party created successfully', 'success');
      }
      fetchParties();
      handleCloseModal();
    } catch (error) {
      addToast('Failed to save party', 'error');
    }
  };

  const handleDeleteParty = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteParty(id);
      addToast('Party deleted successfully', 'success');
      fetchParties();
    } catch (error) {
      addToast('Failed to delete party', 'error');
    }
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.phone?.includes(searchTerm)
  );

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Party },
    { 
      header: 'Type', 
      accessor: 'type' as keyof Party,
      render: (item: Party) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          item.type === 'Customer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          item.type === 'Supplier' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        }`}>
          {item.type}
        </span>
      )
    },
    { header: 'Contact Person', accessor: 'contactPerson' as keyof Party },
    { header: 'Phone', accessor: 'phone' as keyof Party },
    { header: 'Email', accessor: 'email' as keyof Party },
    {
      header: 'Actions',
      accessor: 'id' as keyof Party,
      render: (item: Party) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(item)}>
            <Edit size={16} />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-red-500 hover:bg-red-50" 
            onClick={() => handleDeleteParty(item.id, item.name)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="text-primary-600 dark:text-primary-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Parties</h1>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle />}>
          Add Party
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="max-w-md"
          />
        </div>
        
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading parties...</p>
        ) : filteredParties.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No parties found</p>
            {searchTerm && (
              <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')} className="mt-2">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <Table columns={columns} data={filteredParties} />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingParty?.id ? 'Edit Party' : 'Add New Party'}
      >
        <PartyForm party={editingParty} onSave={handleSaveParty} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Parties;
