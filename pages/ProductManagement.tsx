import React, { useState } from 'react';
import ProductSidebar from '../components/products/ProductSidebar';
import ProductHeader from '../components/products/ProductHeader';
import ProductList from '../components/products/ProductList';
import ProductDetail from '../components/products/ProductDetail';

// Sample product data
const sampleProducts = [
  {
    id: '1',
    name: 'Wireless Pro Mouse',
    sku: 'MSE-2023-WL',
    category: 'Electronics',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk9RxGaXPsCRBrfKKSCkW07HVWw-MdimcBahtfyYVY9j0UXb3MIHONwFjK3HZjbQqlgwONu8zGsbW_VblJRke1u059X5wOVpX7aH7la5FCjBDDWqCQoRi_hJvBKhJvG4TT0Opi-mIa7twK6v4_1BSbn5wJlQTKGiCwLLKx1fzeUMapH2uWaCW3JYku1NuxaCcl8yMXxdu83U9bXJoM4LJzlhY7LvMH2vSez2bLa5yOBFX3gCOwhyTM8gz36ancdfHoo7KSCP2xt5U',
    currentStock: 124,
    maxStock: 200,
    status: 'Active',
    variations: 2,
    selected: true
  },
  {
    id: '2',
    name: 'Mech Keyboard X1',
    sku: 'KEY-2024-MX',
    category: 'Electronics',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrChydS3EgQ0HDCxWVznBjjewdogsk7EhDoftdAhCqBRKZAqv4uUGap6rcN45v4NjGMwfz1nXIDs1C5x9RMFwBKOVEA-uDU7fDrAHkwg8nw1MRmZvS-cQWYDlV32dC05G73_rPJMfD-u8fw7xE6ekDFu80xRqU2_Yu0AlHTDz3gcIVpN1KbvYwtFEyotkvYCNDj8VduaD3Rqp3W_2sODtbmPzg32NgcjctNtM0Wx2TqyAILDievp-9X4QxxUG-iMmPs4tE_-R81JA',
    currentStock: 12,
    maxStock: 50,
    status: 'Active',
    variations: 1,
    selected: false
  },
  {
    id: '3',
    name: 'ErgoChair Plus',
    sku: 'CHR-2023-EP',
    category: 'Furniture',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY83kTh87th-xU8T6iohAsgUM1rQvJRtMwvV-naHBsWiSAEA7FDmjJwyAAYJtisJisCESqKsO8o-Exl9B7c2wD8JGsqVSIlxmxSt3683uqNwAAnt-sDdHI3Kc_gppnMPgBK6teAgpngCzQglOZbf-MtunkGoDOJ4fAaqhync2RrI0-oNPAoeS-YYu8F6RgO8RONax-EdjUVJ8XF3mtfAW0suKzqR7o7r5B2TIY9Uk_mPVKQB_SrNNVSUxI7jHO65tqaSx_VZuObOY',
    currentStock: 45,
    maxStock: 100,
    status: 'Inactive',
    variations: 4,
    selected: false
  },
  {
    id: '4',
    name: 'USB-C Hub Pro',
    sku: 'USB-2024-C7',
    category: 'Electronics',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOmQMMTQGBBOG0i6rM92cI2U1X5G8V2YIhEFggoKBcLM8f-zPabn1rSxHBMmva4FyUxDLtUU7IiqTPai5FlepZDaYlpsPl40rNdDOiegIfGSNoXt9T_xL6HO4gjtW1r-f1Hd9e9_wbvIAUMDF_Kb3Kwdf4pT7xMprxq1SqkocxtJ_yeoNkxJoSz3oKr0JwKfpoErezO3x2Thbd1fTaBwEJDzJcS-5nRNJOPg7KoNsHbX_JCScqIoWGVMOKMeIF1Z4fnLDQjQySYMM',
    currentStock: 890,
    maxStock: 1000,
    status: 'Active',
    variations: 1,
    selected: false
  }
];

const ProductManagement: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState(sampleProducts[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <ProductSidebar />
      
      <main className="flex-1 flex flex-col min-w-0 bg-gray-900 overflow-hidden relative">
        <ProductHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm">
              <a className="text-gray-400 hover:text-white transition-colors" href="#">Home</a>
              <span className="text-gray-400">/</span>
              <span className="text-white font-medium">Product Management</span>
            </nav>

            {/* Page Heading & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Product Management</h2>
                <p className="text-gray-400 mt-1">Track inventory, manage stock batches, and view movement history.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors border border-gray-600">
                  <span className="material-symbols-outlined text-[20px]">file_download</span>
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add Product
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 border border-gray-700 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Products</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white">1,240</h3>
                    <span className="text-green-500 text-xs font-medium bg-green-500/10 px-1.5 py-0.5 rounded">+5%</span>
                  </div>
                </div>
                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Low Stock Items</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white">15</h3>
                    <span className="text-red-500 text-xs font-medium bg-red-500/10 px-1.5 py-0.5 rounded">+2 new</span>
                  </div>
                </div>
                <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <span className="material-symbols-outlined">warning</span>
                </div>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Inventory Value</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white">$45,200</h3>
                    <span className="text-green-500 text-xs font-medium bg-green-500/10 px-1.5 py-0.5 rounded">+12%</span>
                  </div>
                </div>
                <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <span className="material-symbols-outlined">attach_money</span>
                </div>
              </div>
            </div>

            {/* Split Layout: Product List & Detail View */}
            <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
              <ProductList 
                products={sampleProducts}
                selectedProduct={selectedProduct}
                onProductSelect={handleProductSelect}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              
              <ProductDetail product={selectedProduct} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductManagement;