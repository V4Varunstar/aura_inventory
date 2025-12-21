
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { getDashboardData, getTodaysSalesData } from '../services/firebaseService';
import { DollarSign, Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Users, ShoppingCart, Clock } from 'lucide-react';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import TodaysSalesChart from '../components/analytics/TodaysSalesChart';
import InHandInventoryPieChart from '../components/analytics/InHandInventoryPieChart';
import CategoryWiseSalesPieChart from '../components/analytics/CategoryWiseSalesPieChart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ActivityLog, Product, Role } from '../types';
import Table from '../components/ui/Table';
import { useAuth } from '../context/AuthContext';

interface DashboardData {
    summary: {
        totalStockValue: number;
        totalUnits: number;
        todaysInward: number;
        todaysOutward: number;
        todaysSales: number;
        lowStockItems: number;
        activeSKUs: number;
        expiringItems: number;
    };
    inwardOutwardTrend: { name: string; inward: number; outward: number }[];
    channelWiseOutward: { name: string; value: number }[];
    stockByWarehouse: { name: string; value: number }[];
    topSKUsByStock: Product[];
    productInventory: { name: string; inHandQty: number }[];
    recentActivities: ActivityLog[];
}

interface TodaysSalesData {
    totalSoldToday: number;
    hourlySalesData: { hour: string; quantity: number }[];
    topSKUs: { sku: string; name: string; quantity: number }[];
    channelBreakdown: { name: string; value: number }[];
    todaysOrders: any[];
}

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; color: string; onClick?: () => void; clickable?: boolean }> = ({ title, value, icon, color, onClick, clickable }) => (
    <Card>
        <div 
            className={`flex items-center ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={onClick}
        >
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            </div>
        </div>
    </Card>
);

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6'];


const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [todaysSalesData, setTodaysSalesData] = useState<TodaysSalesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyticsView, setAnalyticsView] = useState<'overview' | 'todaysSales'>('overview');
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching dashboard data...');
                const [dashboardData, salesData] = await Promise.all([
                    getDashboardData(),
                    getTodaysSalesData(),
                ]);
                console.log('Dashboard data:', dashboardData);
                console.log('Today\'s sales data:', salesData);
                setData(dashboardData);
                setTodaysSalesData(salesData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                alert('Error loading dashboard: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return <div className="text-center p-8">Loading Dashboard...</div>;
    }
    
    const { summary, inwardOutwardTrend, channelWiseOutward, stockByWarehouse, topSKUsByStock, recentActivities, productInventory } = data;
    
    console.log('Dashboard - productInventory:', productInventory);

    // Calculate real stock for each product
    const calculateProductStock = (sku: string) => {
        // This will be calculated from inward/outward data in the service
        // For now, we'll fetch it from the topSKUsByStock which already has the calculation
        return 0; // Placeholder, actual value comes from backend
    };

    const activityColumns = [
        { header: 'User', accessor: 'userName' as keyof ActivityLog },
        { header: 'Activity', accessor: 'type' as keyof ActivityLog },
        { header: 'Details', accessor: 'details' as keyof ActivityLog },
        { header: 'Date', accessor: 'createdAt' as keyof ActivityLog, render: (item: ActivityLog) => new Date(item.createdAt).toLocaleString() },
    ];
    
    const productColumns = [
        { header: 'SKU', accessor: 'sku' as keyof Product },
        { header: 'Product Name', accessor: 'name' as keyof Product },
        { header: 'Category', accessor: 'category' as keyof Product },
        { header: 'Available Stock', accessor: 'id' as keyof Product, render: (item: Product) => {
            // Find stock from the data passed to topSKUsByStock
            // The stock calculation is done in the service layer
            return (item as any).stockQuantity || 0;
        }},
    ];

    const formatCurrency = (value: number) => `₹ ${value.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome, {user?.name}!</h1>
                
                <div className="flex items-center space-x-3">
                    <Select 
                        value={analyticsView} 
                        onChange={(e) => setAnalyticsView(e.target.value as 'overview' | 'todaysSales')}
                        className="w-48"
                    >
                        <option value="overview">Dashboard Overview</option>
                        <option value="todaysSales">Today's Sales Analytics</option>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
                <SummaryCard title="Total Stock Value" value={formatCurrency(summary.totalStockValue)} icon={<DollarSign className="text-white"/>} color="bg-green-500" />
                <SummaryCard title="Total Units" value={summary.totalUnits.toLocaleString()} icon={<Package className="text-white"/>} color="bg-blue-500" />
                <SummaryCard title="Today's Inward" value={summary.todaysInward} icon={<ArrowUpCircle className="text-white"/>} color="bg-teal-500" />
                <SummaryCard title="Today's Outward" value={summary.todaysOutward} icon={<ArrowDownCircle className="text-white"/>} color="bg-orange-500" />
                <SummaryCard title="Today's Sales" value={summary.todaysSales} icon={<ShoppingCart className="text-white"/>} color="bg-indigo-500" />
                <SummaryCard 
                    title="Low Stock Items" 
                    value={summary.lowStockItems} 
                    icon={<AlertTriangle className="text-white"/>} 
                    color="bg-red-500" 
                    clickable={true}
                    onClick={() => navigate('/products?filter=lowStock')}
                />
                <SummaryCard 
                    title="Expiring Items" 
                    value={summary.expiringItems} 
                    icon={<Clock className="text-white"/>} 
                    color="bg-amber-600" 
                    clickable={true}
                    onClick={() => navigate('/expiring-products')}
                />
            </div>

            {analyticsView === 'overview' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card title="Inward vs Outward Trend" className="lg:col-span-2">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={inwardOutwardTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="inward" stroke="#10b981" strokeWidth={2} name="Inward" />
                                    <Line type="monotone" dataKey="outward" stroke="#ef4444" strokeWidth={2} name="Outward" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card title="Channel-wise Outward">
                            {channelWiseOutward && channelWiseOutward.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={channelWiseOutward} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                            {channelWiseOutward.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px]">
                                    <div className="text-center text-gray-500">
                                        <div className="text-lg mb-2">No outward data available</div>
                                        <div className="text-sm">Create outward entries to see channel distribution</div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <InHandInventoryPieChart />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <CategoryWiseSalesPieChart />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Top 10 SKUs by Stock">
                            <Table columns={productColumns} data={topSKUsByStock.slice(0, 10)} />
                        </Card>
                        {user?.role === Role.Admin && <Card title="Recent Activities">
                            <Table columns={activityColumns} data={recentActivities.slice(0, 10)} />
                        </Card>}
                    </div>
                </>
            ) : (
                todaysSalesData && (
                    <TodaysSalesChart 
                        hourlySalesData={todaysSalesData.hourlySalesData}
                        topSKUs={todaysSalesData.topSKUs}
                        channelBreakdown={todaysSalesData.channelBreakdown}
                    />
                )
            )}

        </div>
    );
};

export default Dashboard;
