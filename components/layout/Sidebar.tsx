
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, APP_NAME } from '../../constants';
import { Role } from '../../types';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const userHasAccess = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform z-30 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{APP_NAME}</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4">
          <ul>
            {NAV_ITEMS.filter(item => userHasAccess(item.roles)).map((item, index) =>
              item.isHeader ? (
                <li key={index} className="mt-6 mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">{item.label}</span>
                </li>
              ) : (
                <li key={item.href}>
                  <NavLink
                    to={item.href!}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center p-2 my-1 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon size={20} className="mr-3" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
