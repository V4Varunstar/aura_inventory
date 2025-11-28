import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Source, createSource } from '../../services/sourceService';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SourceSelectorProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  type: 'inward' | 'outward';
  sources: Source[];
  onSourceCreated?: () => void;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Source Selector with inline create functionality
 * Allows users to select from existing sources or create new ones on the fly
 */
export default function SourceSelector({
  label,
  value,
  onChange,
  type,
  sources,
  onSourceCreated,
  required = false,
  disabled = false,
}: SourceSelectorProps) {
  const { company } = useCompany();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateSource = async () => {
    if (!company || !user) return;

    if (!newSourceName.trim()) {
      addToast('Please enter a source name', 'error');
      return;
    }

    setCreating(true);
    try {
      const newSource = await createSource(company.id, {
        name: newSourceName.trim(),
        type: type === 'inward' ? 'inward' : 'outward',
        createdBy: user.id,
      });

      addToast(`Source "${newSource.name}" created successfully`, 'success');
      setShowCreateModal(false);
      setNewSourceName('');

      // Force refresh of sources list with enhanced callback
      if (onSourceCreated) {
        console.log('SourceSelector - Calling onSourceCreated callback for:', newSource.name);
        await onSourceCreated();
        
        // Additional delay to ensure UI updates  
        setTimeout(() => {
          onSourceCreated();
        }, 200);
      }
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to create source',
        'error'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select
            label={label}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
          >
            <option value="">Select {type === 'inward' ? 'Source' : 'Destination'}</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Source Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewSourceName('');
        }}
        title={`Create New ${type === 'inward' ? 'Source' : 'Destination'}`}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            placeholder={`Enter ${type === 'inward' ? 'source' : 'destination'} name`}
            required
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewSourceName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSource} disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
