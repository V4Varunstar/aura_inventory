
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Product, ProductCategory, ProductUnit } from '../types';
import { getProducts, addProduct, updateProduct, getAllProductStocks, getWarehouses, getCategories, addCategory, clearAllProducts } from '../services/firebaseService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import { useToast } from '../context/ToastContext';
import { PlusCircle, Edit, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import BulkUpload from '../components/products/BulkUpload';

const ProductForm: React.FC<{
  product: Partial<Product> | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  categories: string[];
  onCategoryAdded: () => void;
}> = ({ product, onSave, onCancel, categories, onCategoryAdded }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const { addToast } = useToast();

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
    // Handle image file upload with preview
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast('Please select a valid image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image file size should be less than 5MB', 'error');
        return;
      }
      
      // Create preview URL and store file data
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev, 
          imageUrl: imageDataUrl,
          imageFile: file
        }));
        addToast('Image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
      console.log("File selected:", file.name, "Size:", (file.size / 1024).toFixed(1) + "KB");
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
      <Input 
        name="ean" 
        label="EAN / Barcode *" 
        value={formData.ean || ''} 
        onChange={handleChange} 
        placeholder="Enter EAN barcode (mandatory)" 
        required 
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
        <div className="flex gap-2">
          <select 
            name="category" 
            value={formData.category || ''} 
            onChange={handleChange} 
            required
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <Button 
            type="button" 
            onClick={() => setShowAddCategory(!showAddCategory)}
            variant="secondary"
            size="sm"
          >
            +
          </Button>
        </div>
        {showAddCategory && (
          <div className="mt-2 flex gap-2">
            <Input 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                if (newCategory.trim()) {
                  try {
                    await addCategory(newCategory.trim());
                    addToast('Category added successfully!', 'success');
                    setNewCategory('');
                    setShowAddCategory(false);
                    setFormData(prev => ({ ...prev, category: newCategory.trim() as any }));
                    onCategoryAdded();
                  } catch (error) {
                    addToast('Failed to add category', 'error');
                  }
                }
              }}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAddCategory(false);
                setNewCategory('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      <Select name="unit" label="Unit" value={formData.unit || ''} onChange={handleChange} required>
        {Object.values(ProductUnit).map(unit => <option key={unit} value={unit}>{unit}</option>)}
      </Select>
      <Input name="mrp" label="MRP (₹)" type="number" step="0.01" value={formData.mrp || ''} onChange={handleChange} required />
      <Input name="costPrice" label="Cost Price (₹)" type="number" step="0.01" value={formData.costPrice || ''} onChange={handleChange} required />
      <Input 
        name="sellingPrice" 
        label="Selling Price (₹)" 
        type="number" 
        step="0.01" 
        value={formData.sellingPrice || ''} 
        onChange={handleChange} 
        placeholder="Selling price (optional)"
      />
      <Input 
        name="gstPercentage" 
        label="GST %" 
        type="number" 
        step="0.01" 
        min="0" 
        max="100"
        value={formData.gstPercentage || ''} 
        onChange={handleChange} 
        placeholder="GST percentage (optional)"
      />
      <Input 
        name="lowStockThreshold" 
        label="Minimum Stock Threshold *" 
        type="number" 
        value={formData.lowStockThreshold || ''} 
        onChange={handleChange} 
        required 
        placeholder="Alert when stock reaches this level"
      />
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
        <div className="space-y-3">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {formData.imageUrl && (
            <div className="flex items-center space-x-4">
              <img 
                src={formData.imageUrl} 
                alt="Product preview" 
                className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>✓ Image uploaded successfully</p>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imageFile: undefined }))}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Remove image
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
        </div>
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
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [productStocks, setProductStocks] = useState<any>({});
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const canEdit = user && [Role.Admin, Role.Manager].includes(user.role);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    // Check if navigated from low stock dashboard
    const params = new URLSearchParams(location.search);
    if (params.get('filter') === 'lowStock') {
      setShowLowStock(true);
    }
  }, [location]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [productsData, stocksData, warehousesData] = await Promise.all([
          getProducts(),
          getAllProductStocks(),
          getWarehouses()
        ]);
        setProducts(productsData);
        setProductStocks(stocksData);
        setWarehouses(warehousesData);
      } catch (error) {
        addToast('Failed to fetch products.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    fetchCategories();
  }, [addToast]);

  const refreshStocks = async () => {
    const stocksData = await getAllProductStocks();
    setProductStocks(stocksData);
  };
  
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

      if (showLowStock) {
        addToast('Low Stock Only is enabled — you may be seeing a filtered list.', 'info');
      }
      handleCloseModal();
    } catch(error) {
      addToast('Failed to save product.', 'error');
    }
  };

  const handleBulkUploadSuccess = (importedProducts: Product[]) => {
    setProducts([...products, ...importedProducts]);
    refreshStocks();
  };

  const handleClearAllProducts = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL products permanently!\n\nAre you sure you want to continue?')) {
      return;
    }
    
    setIsClearing(true);
    try {
      await clearAllProducts();
      setProducts([]);
      setProductStocks({});
      addToast('All products cleared successfully! You can now import fresh data.', 'success');
    } catch (error) {
      addToast('Failed to clear products.', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  // Filter products based on low stock
  const filteredProducts = showLowStock
    ? products.filter(p => {
        const stock = productStocks[p.id]?.total || 0;
        const threshold = p.lowStockThreshold ?? p.minStockThreshold ?? 0;
        // Include out-of-stock items (0) as low stock too.
        return stock <= threshold;
      })
    : products;

  const columns: any[] = [
    { header: 'Image', accessor: 'imageUrl', render: (item: Product) => <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-full object-cover" /> },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Name', accessor: 'name' },
    { header: 'EAN', accessor: 'ean', render: (item: Product) => item.ean || '-' },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Stock', 
      accessor: 'id', 
      render: (item: Product) => {
        const stock = productStocks[item.id]?.total || 0;
        const threshold = item.lowStockThreshold ?? item.minStockThreshold ?? 0;
        const isLowStock = stock <= threshold;
        return (
          <span className={isLowStock ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
            {stock}
            {isLowStock && ' ⚠️'}
          </span>
        );
      }
    },
    { 
      header: 'Warehouse Stock', 
      accessor: 'id', 
      render: (item: Product) => {
        const byWarehouse = productStocks[item.id]?.byWarehouse || {};
        return (
          <div className="text-xs">
            {Object.keys(byWarehouse).length > 0 ? (
              Object.entries(byWarehouse).map(([whId, qty]: any) => {
                const wh = warehouses.find(w => w.id === whId);
                return <div key={whId}>{wh?.name}: {qty}</div>;
              })
            ) : (
              <span className="text-gray-400">No stock</span>
            )}
          </div>
        );
      }
    },
    { header: 'MRP (₹)', accessor: 'mrp', render: (item: Product) => item.mrp.toFixed(2) },
    { header: 'Cost (₹)', accessor: 'costPrice', render: (item: Product) => item.costPrice.toFixed(2) },
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Products</h1>
          {showLowStock && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Showing low stock items only</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowLowStock(!showLowStock)}
            variant={showLowStock ? "primary" : "secondary"}
            size="sm"
          >
            {showLowStock ? 'Show All' : 'Low Stock Only'}
          </Button>
          {canEdit && (
            <>
              <Button 
                onClick={handleClearAllProducts}
                variant="danger"
                size="sm"
                disabled={isClearing || products.length === 0}
              >
                {isClearing ? 'Clearing...' : 'Clear All Products'}
              </Button>
              <Button 
                onClick={() => setIsBulkUploadOpen(true)} 
                leftIcon={<Upload />}
                variant="secondary"
              >
                Upload Excel
              </Button>
              <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle />}>
                Add Product
              </Button>
            </>
          )}
        </div>
      </div>
      <Card>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <>
            {showLowStock && filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No low stock items found
              </div>
            )}
            {(!showLowStock || filteredProducts.length > 0) && (
              <Table columns={columns} data={filteredProducts} />
            )}
          </>
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct?.id ? 'Edit Product' : 'Add New Product'}>
        <ProductForm 
          product={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={handleCloseModal}
          categories={categories}
          onCategoryAdded={fetchCategories}
        />
      </Modal>
      <BulkUpload
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </div>
  );
};

export default Products;
