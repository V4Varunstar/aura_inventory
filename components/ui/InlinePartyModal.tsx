import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Party } from '../../types';
import { addParty } from '../../services/partyService';
import { useToast } from '../../context/ToastContext';

interface InlinePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartyCreated: (party: Party) => void;
  defaultType?: 'Customer' | 'Supplier' | 'Both';
}

const InlinePartyModal: React.FC<InlinePartyModalProps> = ({
  isOpen,
  onClose,
  onPartyCreated,
  defaultType = 'Customer',
}) => {
  const [formData, setFormData] = useState<Partial<Party>>({
    type: defaultType,
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      addToast('Party name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const newParty = await addParty(formData);
      addToast('Party created successfully!', 'success');
      onPartyCreated(newParty);
      
      // Reset form
      setFormData({
        type: defaultType,
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
      });
      onClose();
    } catch (error) {
      addToast('Failed to create party', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: defaultType,
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstNumber: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Quick Create Party">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          label="Party Name"
          value={formData.name || ''}
          onChange={handleChange}
          required
          placeholder="Enter party/customer name"
          autoFocus
        />

        <Select
          name="type"
          label="Party Type"
          value={formData.type || defaultType}
          onChange={handleChange}
          required
        >
          <option value="Customer">Customer</option>
          <option value="Supplier">Supplier</option>
          <option value="Both">Both</option>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="phone"
            label="Phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="+91 1234567890"
          />
          
          <Input
            name="email"
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>

        <Input
          name="contactPerson"
          label="Contact Person"
          value={formData.contactPerson || ''}
          onChange={handleChange}
          placeholder="Contact person name (optional)"
        />

        <Input
          name="address"
          label="Address"
          value={formData.address || ''}
          onChange={handleChange}
          placeholder="Full address (optional)"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Party'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InlinePartyModal;
