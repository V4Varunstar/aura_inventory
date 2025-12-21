import React from 'react';

interface ProductHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-700 bg-[#111118]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-6">
        {/* Warehouse Selector */}
        <div className="relative group">
          <button className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-600 transition-colors">
            <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-600">warehouse</span>
            Main Warehouse (NY)
            <span className="material-symbols-outlined text-[18px] text-gray-400">expand_more</span>
          </button>
        </div>
        <div className="h-6 w-px bg-gray-700"></div>
        
        {/* Global Search */}
        <div className="relative w-64 md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input 
            className="w-full bg-gray-700/50 hover:bg-gray-700 focus:bg-gray-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 border-transparent focus:border-blue-600 focus:ring-0 transition-all placeholder:text-gray-400/70" 
            placeholder="Search orders, products, SKU..." 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-[#111118]"></span>
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </header>
  );
};

export default ProductHeader;