import React from 'react';

const ProductSidebar: React.FC = () => {
  return (
    <aside className="w-72 flex-shrink-0 bg-[#111118] border-r border-gray-700 flex flex-col z-20 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-gray-700 gap-3">
        <div className="bg-center bg-no-repeat bg-cover rounded-lg size-8" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBKUoexB_NG3wUoEIwcmaP1mwxpx1v-f6a1KG05AQsoY3MWE6GDRuLnXjMCw7-eV_vuiYeMvOq61v73BrBesPv5xS-z9gd1FGrW_9k0wFKHp5H1T2y5VUVBVfIkOrxQosp0kfyRXFg9uWXhRPKBXxqfA2AE8CIsEqrHHzxALjy3EosEMTKkBq5x2ORuMDhxWYjhR5cMablr_kl6ZFhn-WcQap-U1EPZPW4AOEhf-Uqpgp55NVN8SwulqaUOBhgozk_M-cgDRvasd1c")'}}>    </div>
        <div className="flex flex-col">
          <h1 className="text-white text-base font-bold leading-none tracking-tight">TechCorp Inc.</h1>
          <p className="text-gray-400 text-xs font-normal mt-1">Enterprise Portal</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:text-white transition-colors">dashboard</span>
          <span className="text-sm font-medium">Dashboard</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20" href="#">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-sm font-medium">Products</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:text-white transition-colors">shopping_cart</span>
          <span className="text-sm font-medium">Orders</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:text-white transition-colors">description</span>
          <span className="text-sm font-medium">Reports</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:text-white transition-colors">local_shipping</span>
          <span className="text-sm font-medium">Shipments</span>
        </a>
        
        <div className="my-2 border-t border-gray-700/50"></div>
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">System</p>
        
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:text-white transition-colors">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:text-white transition-colors">group</span>
          <span className="text-sm font-medium">Users</span>
        </a>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-colors">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-white/10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB_fz_YEm4mF8t2A4Dbb4FBUOzgJsSaT4-HRvoPgU5ftW3OhFD_HLScXtRMt54iDJl26SgEvoFS8zalsHKsO0xFw49j2GEyZRXF3-2dLBd3xFcMjW8coF6HjSZfK9nrRlCJA6mGebtT31SYF_2dthkLq0N67CZSEhJs35Lv2GTv3ktsciinp2V0NgbBgl6NiGvKJrznX9BY0oMTn64Fb6n7ZLMW3XHNb6wbmVCsMcqyWNu04eY7hsKTMnzH3MeuUY1pJw4md-jg9NY")'}}>    </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Alex Morgan</p>
            <p className="text-xs text-gray-400 truncate">Warehouse Mgr.</p>
          </div>
          <span className="material-symbols-outlined ml-auto text-gray-400 text-[20px]">expand_more</span>
        </div>
      </div>
    </aside>
  );
};

export default ProductSidebar;