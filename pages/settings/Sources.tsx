import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Source,
  getSources,
  createSource,
  updateSource,
  deleteSource,
} from '../../services/sourceService';

export default function Sources() {
  const { company } = useCompany();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use user.companyId for consistency with dashboard
  const companyId = user?.companyId || company?.id || 'default';
  
  console.log('Sources page - user:', user);
  console.log('Sources page - company:', company);
  console.log('Sources page - using companyId:', companyId);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [deletingSource, setDeletingSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'both' as 'inward' | 'outward' | 'both',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && companyId) {
      loadSources();
    }
  }, [user, companyId]);

  const loadSources = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      // Load all sources (both inward and outward) including defaults
      const allSources = await getSources(companyId);
      console.log('Sources page - loaded sources:', allSources);
      console.log('Sources page - Meesho sources:', allSources.filter(s => s.name.toLowerCase().includes('meesho')));
      setSources(allSources);
    } catch (error) {
      addToast('Failed to load sources', 'error');
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = () => {
    setEditingSource(null);
    setFormData({ name: '', type: 'both' });
    setShowModal(true);
  };

  const handleEditSource = (source: Source) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
    });
    setShowModal(true);
  };

  const handleDeleteSource = (source: Source) => {
    setDeletingSource(source);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !user) return;

    if (!formData.name.trim()) {
      addToast('Please enter a source name', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingSource) {
        await updateSource(editingSource.id, formData);
        addToast('Source updated successfully', 'success');
      } else {
        console.log('Creating source with user:', user);
        console.log('Creating source with companyId:', companyId);
        await createSource(companyId, {
          ...formData,
          createdBy: user.id,
        });
        addToast('Source created successfully', 'success');
      }
      
      setShowModal(false);
      loadSources();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to save source',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingSource) return;

    setSaving(true);
    try {
      await deleteSource(deletingSource.id);
      addToast('Source deleted successfully', 'success');
      setShowDeleteModal(false);
      loadSources();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to delete source',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const columns: any[] = [
    { accessor: 'name', header: 'Name' },
    {
      accessor: 'type',
      header: 'Type',
      render: (source: Source) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {source.type === 'inward'
            ? 'Inward'
            : source.type === 'outward'
            ? 'Outward'
            : 'Both'}
        </span>
      ),
    },
    {
      accessor: 'isDefault',
      header: 'Status',
      render: (source: Source) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            source.isDefault
              ? 'bg-gray-100 text-gray-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {source.isDefault ? 'Default' : 'Custom'}
        </span>
      ),
    },
    {
      accessor: 'createdAt',
      header: 'Created',
      render: (source: Source) => new Date(source.createdAt).toLocaleDateString(),
    },
    {
      accessor: 'id',
      header: 'Actions',
      render: (source: Source) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSource(source)}
            disabled={source.isDefault}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSource(source)}
            disabled={source.isDefault}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Sources & Destinations
        </h1>
        <Button onClick={handleAddSource}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6 space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📦 What is this?</h3>
            <p className="text-sm text-blue-800">
              Create custom <strong>Inward Sources</strong> (Factory, Amazon Returns, Suppliers) and{' '}
              <strong>Outward Destinations</strong> (Amazon FBA, Flipkart, Myntra, Retailers) to track where inventory comes from and goes to.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-xs font-semibold text-green-900 mb-1">✅ Inward Sources</h4>
              <p className="text-xs text-green-700">Factory, Suppliers, Returns from marketplaces</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-xs font-semibold text-purple-900 mb-1">📤 Outward Destinations</h4>
              <p className="text-xs text-purple-700">Amazon FBA, Flipkart, Myntra, Offline Stores</p>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Default sources (Factory, Amazon FBA, etc.) cannot be edited or deleted. You can create unlimited custom sources.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : sources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No sources found</p>
            <Button onClick={handleAddSource}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Source
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={sources} />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSource ? 'Edit Source' : 'Add Source'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Local Supplier, Amazon Return"
            required
          />

          <Select
            label="Type *"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            required
          >
            <option value="both">Both (Inward & Outward)</option>
            <option value="inward">Inward Only</option>
            <option value="outward">Outward Only</option>
          </Select>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingSource ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Source"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{' '}
          <strong>{deletingSource?.name}</strong>?
          {deletingSource && !deletingSource.isDefault && (
            <span className="block mt-2 text-sm text-yellow-600">
              This action cannot be undone. Make sure this source is not used in any
              transactions.
            </span>
          )}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={saving}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
