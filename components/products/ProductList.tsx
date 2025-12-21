import React from 'react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  currentStock: number;
  maxStock: number;
  status: string;
  variations: number;
  selected?: boolean;
}

interface ProductListProps {
  products: Product[];
  selectedProduct: Product;
  onProductSelect: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  selectedProduct, 
  onProductSelect, 
  searchQuery, 
  onSearchChange 
}) => {
  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getStockColor = (current: number, max: number) => {
    const percentage = getStockPercentage(current, max);
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electronics':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'furniture':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const isLowStock = (current: number, max: number) => {
    return getStockPercentage(current, max) < 30;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#16161e] border border-gray-700 rounded-xl overflow-hidden shadow-xl">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#16161e]">
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input 
            className="w-full bg-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 border-transparent focus:border-blue-600 focus:ring-0 placeholder:text-gray-400/70" 
            placeholder="Filter products..." 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm border border-white/5 transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Category
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm border border-white/5 transition-colors">
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Sort
          </button>
        </div>
      </div>
      
      {/* Data Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1c1c26] sticky top-0 z-10 text-xs uppercase text-gray-400 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-gray-700">Product</th>
              <th className="px-6 py-4 border-b border-gray-700">SKU</th>
              <th className="px-6 py-4 border-b border-gray-700">Category</th>
              <th className="px-6 py-4 border-b border-gray-700">Stock</th>
              <th className="px-6 py-4 border-b border-gray-700">Status</th>
              <th className="px-6 py-4 border-b border-gray-700 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {products.map((product) => {
              const isSelected = selectedProduct?.id === product.id;
              const lowStock = isLowStock(product.currentStock, product.maxStock);
              
              return (
                <tr 
                  key={product.id}
                  className={`transition-colors cursor-pointer group border-l-4 ${
                    isSelected 
                      ? 'bg-blue-600/10 hover:bg-blue-600/20 border-l-blue-600' 
                      : 'hover:bg-gray-700/30 border-l-transparent'
                  }`}
                  onClick={() => onProductSelect(product)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-10 rounded-lg bg-white/5 border border-white/10 flex-shrink-0 bg-center bg-cover" 
                        style={{backgroundImage: `url(${product.image})`}}
                      ></div>
                      <div>
                        <p className="text-white text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-400">Variations: {product.variations}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 w-24">
                      <div className="flex justify-between text-xs">
                        <span className="text-white">{product.currentStock}</span>
                        <span className="text-gray-400">/ {product.maxStock}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStockColor(product.currentStock, product.maxStock)} rounded-full`} 
                          style={{width: `${getStockPercentage(product.currentStock, product.maxStock)}%`}}
                        ></div>
                      </div>
                      {lowStock && (
                        <span className="text-[10px] text-red-400">Low Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                      product.status === 'Active' 
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-gray-400 bg-gray-700'
                    }`}>
                      <span className={`size-1.5 rounded-full ${
                        product.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'
                      }`}></span>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`material-symbols-outlined ${
                      isSelected ? 'text-blue-600' : 'text-gray-400'
                    }`}>chevron_right</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="p-4 border-t border-gray-700 bg-[#16161e] flex items-center justify-between">
        <span className="text-sm text-gray-400">Showing 1-{products.length} of 1,240</span>
        <div className="flex gap-2">
          <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-50" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;