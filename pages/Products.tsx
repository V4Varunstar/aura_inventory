
import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, ProductUnit } from '../types';
import { getProducts, addProduct, updateProduct } from '../services/firebaseService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import { useToast } from '../context/ToastContext';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const ProductForm: React.FC<{
  product: Partial<Product> | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number';

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (isNumber ? Number(value) : value),
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would upload to Firebase Storage and get a URL
    if (e.target.files && e.target.files[0]) {
       setFormData(prev => ({...prev, imageUrl: 'https://picsum.photos/200' }));
       console.log("File selected:", e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input name="sku" label="SKU" value={formData.sku || ''} onChange={handleChange} required />
      <Input name="name" label="Product Name" value={formData.name || ''} onChange={handleChange} required />
      <Select name="category" label="Category" value={formData.category || ''} onChange={handleChange} required>
        {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </Select>
      <Select name="unit" label="Unit" value={formData.unit || ''} onChange={handleChange} required>
        {Object.values(ProductUnit).map(unit => <option key={unit} value={unit}>{unit}</option>)}
      </Select>
      <Input name="mrp" label="MRP (₹)" type="number" value={formData.mrp || ''} onChange={handleChange} required />
      <Input name="costPrice" label="Cost Price (₹)" type="number" value={formData.costPrice || ''} onChange={handleChange} required />
      <Input name="lowStockThreshold" label="Low Stock Threshold" type="number" value={formData.lowStockThreshold || ''} onChange={handleChange} required />
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
      </div>
      <div className="flex items-center md:col-span-2">
          <input type="checkbox" id="batchTracking" name="batchTracking" checked={!!formData.batchTracking} onChange={handleChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"/>
          <label htmlFor="batchTracking" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Enable Batch Tracking</label>
      </div>
      <div className="md:col-span-2 flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{product?.id ? 'Update' : 'Create'} Product</Button>
      </div>
    </form>
  );
};


const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const canEdit = user && [Role.Admin, Role.Manager].includes(user.role);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        addToast('Failed to fetch products.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [addToast]);
  
  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productData.id) {
        const updatedProduct = await updateProduct(productData.id, productData);
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        addToast('Product updated successfully!', 'success');
      } else {
        const newProduct = await addProduct(productData);
        setProducts([...products, newProduct]);
        addToast('Product created successfully!', 'success');
      }
      handleCloseModal();
    } catch(error) {
      addToast('Failed to save product.', 'error');
    }
  };

  const columns: any[] = [
    { header: 'Image', accessor: 'imageUrl', render: (item: Product) => <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-full object-cover" /> },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'MRP (₹)', accessor: 'mrp', render: (item: Product) => item.mrp.toFixed(2) },
    { header: 'Cost (₹)', accessor: 'costPrice', render: (item: Product) => item.costPrice.toFixed(2) },
    { header: 'Low Stock', accessor: 'lowStockThreshold' },
  ];

  if(canEdit) {
    columns.push({
      header: 'Actions',
      accessor: 'id',
      render: (item: Product) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleOpenModal(item)}><Edit size={16} /></Button>
          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><Trash2 size={16} /></Button>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Products</h1>
        {canEdit && <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle />}>Add Product</Button>}
      </div>
      <Card>
        {loading ? <p>Loading products...</p> : <Table columns={columns} data={products} />}
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct?.id ? 'Edit Product' : 'Add New Product'}>
        <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Products;
