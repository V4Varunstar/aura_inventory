import React, { useState } from 'react';

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
}

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState('batches');

  if (!product) {
    return (
      <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col bg-[#16161e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Select a product to view details</p>
        </div>
      </div>
    );
  }

  const batches = [
    {
      id: 'BATCH-001',
      location: 'Warehouse A',
      quantity: 80,
      expiry: 'Dec 2025',
      expiryColor: 'text-green-400',
      progress: 100
    },
    {
      id: 'BATCH-002',
      location: 'Warehouse A',
      quantity: 44,
      expiry: 'Nov 2024',
      expiryColor: 'text-yellow-400',
      progress: 75
    }
  ];

  const movements = [
    {
      id: 1,
      type: 'Outward Stock',
      reference: 'Order #ORD-9921 • Sales',
      amount: -12,
      time: '2h ago',
      color: 'bg-red-500'
    },
    {
      id: 2,
      type: 'Inward Stock',
      reference: 'PO #PO-8812 • Supplier Inc.',
      amount: +100,
      time: 'Yesterday',
      color: 'bg-green-500'
    },
    {
      id: 3,
      type: 'Stock Adjustment',
      reference: 'Audit Check • Alex M.',
      amount: -2,
      time: 'Oct 24',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col bg-[#16161e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-500">
      {/* Panel Header */}
      <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-[#16161e] to-gray-700/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <div 
              className="size-16 rounded-lg bg-white/5 border border-white/10 bg-center bg-cover" 
              style={{backgroundImage: `url(${product.image})`}}
            ></div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3>
              <p className="text-sm text-gray-400 font-mono mt-1">SKU: {product.sku}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-white border border-white/10">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span> Edit
          </button>
          <button className="flex items-center justify-center gap-2 py-2 bg-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 transition-colors border border-white/5">
            <span className="material-symbols-outlined text-[18px]">more_horiz</span> Actions
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-[#16161e]">
        <button 
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'batches' 
              ? 'text-white border-blue-600' 
              : 'text-gray-400 hover:text-white border-transparent hover:border-gray-700'
          }`}
          onClick={() => setActiveTab('batches')}
        >
          Batches
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history' 
              ? 'text-white border-blue-600' 
              : 'text-gray-400 hover:text-white border-transparent hover:border-gray-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'suppliers' 
              ? 'text-white border-blue-600' 
              : 'text-gray-400 hover:text-white border-transparent hover:border-gray-700'
          }`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
      </div>
      
      {/* Panel Content Scroll */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'batches' && (
          <>
            {/* Batch Section */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white">Active Batches ({batches.length})</h4>
              <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Add Batch</span>
            </div>
            <div className="space-y-3 mb-8">
              {batches.map((batch) => (
                <div key={batch.id} className="p-3 bg-gray-700/40 rounded-lg border border-gray-700 hover:border-blue-600/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">#{batch.id}</p>
                      <p className="text-xs text-gray-400">In: {batch.location}</p>
                    </div>
                    <span className="text-sm font-bold text-white">{batch.quantity} Qty</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs">
                      <p className="text-gray-400">Exp: <span className={`${batch.expiryColor} font-medium`}>{batch.expiry}</span></p>
                    </div>
                    <div className="h-1 w-16 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {activeTab === 'history' && (
          <>
            {/* Movement History Section */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white">Recent Movements</h4>
              <button className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
              </button>
            </div>
            <div className="relative pl-4 border-l border-gray-700 space-y-6">
              {movements.map((movement) => (
                <div key={movement.id} className="relative group">
                  <div className="absolute -left-[21px] bg-[#16161e] p-1">
                    <div className={`size-2 rounded-full ${movement.color.replace('bg-', 'bg-')} ring-4 ring-[#16161e]`}></div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-white">{movement.type}</p>
                      <p className="text-xs text-gray-400">{movement.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        movement.amount > 0 ? 'text-green-400' : movement.amount < 0 ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {movement.amount > 0 ? '+' : ''}{movement.amount}
                      </p>
                      <p className="text-[10px] text-gray-400">{movement.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {activeTab === 'suppliers' && (
          <div className="text-center py-8">
            <div className="bg-gray-700/50 p-4 rounded-full mb-4 inline-block">
              <span className="material-symbols-outlined text-2xl text-gray-400">business</span>
            </div>
            <p className="text-white font-medium">No suppliers configured</p>
            <p className="text-gray-400 text-sm mt-1">Add suppliers to track purchase orders</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Add Supplier
            </button>
          </div>
        )}
      </div>
      
      {/* Panel Footer */}
      <div className="p-4 border-t border-gray-700 bg-[#16161e] flex justify-between items-center text-xs text-gray-400">
        <span>Last updated: 5 mins ago</span>
        <a className="hover:text-blue-600 transition-colors" href="#">View full audit log →</a>
      </div>
    </div>
  );
};

export default ProductDetail;