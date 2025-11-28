import React, { useState } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, Warehouse, Users, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'shipments'>('dashboard');

  // Demo data
  const stats = [
    { label: 'Total Products', value: '248', icon: Package, color: 'bg-blue-500', change: '+12%' },
    { label: 'Total Stock', value: '45,234', icon: ShoppingCart, color: 'bg-green-500', change: '+8%' },
    { label: 'Warehouses', value: '5', icon: Warehouse, color: 'bg-purple-500', change: '0%' },
    { label: 'Low Stock Items', value: '23', icon: AlertTriangle, color: 'bg-red-500', change: '-5%' },
  ];

  const recentShipments = [
    { id: 'FBA-001', platform: 'Amazon FBA', items: 45, status: 'Deducted', date: '2024-12-15' },
    { id: 'FBF-002', platform: 'Flipkart FBF', items: 32, status: 'Created', date: '2024-12-14' },
    { id: 'SJIT-003', platform: 'Myntra SJIT', items: 28, status: 'Deducted', date: '2024-12-13' },
    { id: 'PO-004', platform: 'Zepto PO', items: 56, status: 'Deducted', date: '2024-12-12' },
  ];

  const products = [
    { sku: 'SKU001', name: 'Face Cream Premium', category: 'Skincare', stock: 450, ean: '1234567890123' },
    { sku: 'SKU002', name: 'Hair Serum Organic', category: 'Haircare', stock: 320, ean: '1234567890124' },
    { sku: 'SKU003', name: 'Body Lotion Natural', category: 'Body Care', stock: 280, ean: '1234567890125' },
    { sku: 'SKU004', name: 'Shampoo Herbal', category: 'Haircare', stock: 510, ean: '1234567890126' },
    { sku: 'SKU005', name: 'Face Wash Gentle', category: 'Skincare', stock: 390, ean: '1234567890127' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Aura Inventory - Demo</h1>
              <p className="text-sm text-gray-500 mt-1">Interactive demo of the inventory management system</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/#/pricing'}>
                View Pricing
              </Button>
              <Button onClick={() => window.location.href = '/#/login'}>
                Login / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'shipments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Platform Shipments
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : stat.change === '0%' ? 'text-gray-500' : 'text-red-600'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                      <stat.icon className={`h-8 w-8 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Recent Inward Stock
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Face Cream Premium</p>
                      <p className="text-sm text-gray-500">Warehouse A</p>
                    </div>
                    <span className="text-green-600 font-semibold">+120 units</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Hair Serum Organic</p>
                      <p className="text-sm text-gray-500">Warehouse B</p>
                    </div>
                    <span className="text-green-600 font-semibold">+85 units</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">Body Lotion Natural</p>
                      <p className="text-sm text-gray-500">Warehouse A</p>
                    </div>
                    <span className="text-green-600 font-semibold">+95 units</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Recent Outward Stock
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Shampoo Herbal</p>
                      <p className="text-sm text-gray-500">Amazon FBA Shipment</p>
                    </div>
                    <span className="text-red-600 font-semibold">-65 units</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">Face Wash Gentle</p>
                      <p className="text-sm text-gray-500">Flipkart FBF Shipment</p>
                    </div>
                    <span className="text-red-600 font-semibold">-42 units</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">Body Lotion Natural</p>
                      <p className="text-sm text-gray-500">Myntra SJIT Shipment</p>
                    </div>
                    <span className="text-red-600 font-semibold">-38 units</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Catalog</h3>
              <div className="text-sm text-gray-500">Total: {products.length} products</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EAN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.ean}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-green-600 font-semibold">{product.stock}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Multi-Platform Shipment Management</h4>
              <p className="text-sm text-blue-800">
                Manage shipments across Amazon FBA, Flipkart FBF, Myntra SJIT, Zepto PO, and Nykaa PO - all from one unified interface.
              </p>
            </div>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Platform Shipments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentShipments.map((shipment, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.platform}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.items} items</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            shipment.status === 'Deducted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="h-8 w-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Amazon FBA</h4>
                    <p className="text-sm text-gray-500">45 shipments</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Flipkart FBF</h4>
                    <p className="text-sm text-gray-500">32 shipments</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="h-8 w-8 text-pink-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Myntra SJIT</h4>
                    <p className="text-sm text-gray-500">28 shipments</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white mt-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Sign up now to access the full inventory management system with real-time tracking, 
              multi-platform shipments, EAN mapping, and comprehensive reporting.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => window.location.href = '/#/login'}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/#/pricing'}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemoPage;
