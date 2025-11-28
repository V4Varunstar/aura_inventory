import React, { useState, useEffect } from 'react';
import { Plus, Search, Upload, Edit2, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import { getProducts } from '../services/firebaseService';
import {
  getEanMappings,
  createEanMapping,
  updateEanMapping,
  deleteEanMapping,
  searchEanMappings
} from '../services/eanMappingService';
import BulkEanImport from '../components/ean/BulkEanImport';

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface EanMapping {
  id: string;
  ean: string;
  productId: string;
  productName: string;
  productSku: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductMapping() {
  const { company } = useCompany();
  const { addToast } = useToast();
  const [mappings, setMappings] = useState<EanMapping[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<EanMapping | null>(null);
  const [deletingMapping, setDeleteingMapping] = useState<EanMapping | null>(null);
  const [formData, setFormData] = useState({
    ean: '',
    productId: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (company) {
      loadData();
    }
  }, [company]);

  const loadData = async () => {
    if (!company) return;
    
    setLoading(true);
    try {
      const [mappingsData, productsData] = await Promise.all([
        getEanMappings(company.id),
        getProducts()
      ]);
      
      setMappings(mappingsData);
      setProducts(productsData);
    } catch (error) {
      addToast('Failed to load data', 'error');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!company) return;
    
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const results = await searchEanMappings(company.id, searchQuery);
      setMappings(results);
    } catch (error) {
      addToast('Search failed', 'error');
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMapping = () => {
    setEditingMapping(null);
    setFormData({ ean: '', productId: '' });
    setShowModal(true);
  };

  const handleEditMapping = (mapping: EanMapping) => {
    setEditingMapping(mapping);
    setFormData({
      ean: mapping.ean,
      productId: mapping.productId
    });
    setShowModal(true);
  };

  const handleDeleteMapping = (mapping: EanMapping) => {
    setDeleteingMapping(mapping);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    // Validation
    if (!formData.ean.trim()) {
      addToast('EAN is required', 'error');
      return;
    }
    if (!formData.productId) {
      addToast('Product is required', 'error');
      return;
    }

    const product = products.find(p => p.id === formData.productId);
    if (!product) {
      addToast('Product not found', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingMapping) {
        await updateEanMapping(
          editingMapping.id,
          formData,
          product.name,
          product.sku
        );
        addToast('EAN mapping updated successfully', 'success');
      } else {
        await createEanMapping(
          company.id,
          formData,
          product.name,
          product.sku
        );
        addToast('EAN mapping created successfully', 'success');
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to save EAN mapping',
        'error'
      );
      console.error('Error saving mapping:', error);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMapping) return;

    setSaving(true);
    try {
      await deleteEanMapping(deletingMapping.id);
      addToast('EAN mapping deleted successfully', 'success');
      setShowDeleteModal(false);
      loadData();
    } catch (error) {
      addToast('Failed to delete EAN mapping', 'error');
      console.error('Error deleting mapping:', error);
    } finally {
      setSaving(false);
    }
  };

  const columns: any[] = [
    { accessor: 'ean', header: 'EAN' },
    { accessor: 'productSku', header: 'Product SKU' },
    { accessor: 'productName', header: 'Product Name' },
    { 
      accessor: 'createdAt', 
      header: 'Created', 
      render: (mapping: EanMapping) => new Date(mapping.createdAt).toLocaleDateString()
    },
    {
      accessor: 'id',
      header: 'Actions',
      render: (mapping: EanMapping) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditMapping(mapping)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteMapping(mapping)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Product Mapping (EAN)</h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowBulkImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={handleAddMapping}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by EAN, SKU, or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {searchQuery && (
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              loadData();
            }}>
              Clear
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : mappings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No EAN mappings found</p>
            <Button onClick={handleAddMapping}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Mapping
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={mappings} />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMapping ? 'Edit EAN Mapping' : 'Add EAN Mapping'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="EAN *"
            value={formData.ean}
            onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
            placeholder="Enter EAN code"
            required
          />

          <Select
            label="Product *"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            required
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.sku} - {product.name}
              </option>
            ))}
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
              {saving ? 'Saving...' : editingMapping ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete EAN Mapping"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the mapping for EAN{' '}
          <strong>{deletingMapping?.ean}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={saving}
          >
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <BulkEanImport
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
