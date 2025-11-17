
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { getDashboardData } from '../services/firebaseService';
import { DollarSign, Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Users } from 'lucide-react';
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
        lowStockItems: number;
        activeSKUs: number;
    };
    inwardOutwardTrend: { name: string; inward: number; outward: number }[];
    channelWiseOutward: { name: string; value: number }[];
    stockByWarehouse: { name: string; value: number }[];
    topSKUsByStock: Product[];
    recentActivities: ActivityLog[];
}

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; color: string }> = ({ title, value, icon, color }) => (
    <Card>
        <div className="flex items-center">
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
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await getDashboardData();
                setData(dashboardData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return <div className="text-center p-8">Loading Dashboard...</div>;
    }
    
    const { summary, inwardOutwardTrend, channelWiseOutward, stockByWarehouse, topSKUsByStock, recentActivities } = data;

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
        { header: 'Total Stock', accessor: 'lowStockThreshold' as keyof Product, render: () => Math.floor(Math.random() * 500) + 100 }, // Mock total stock for demo
    ];

    const formatCurrency = (value: number) => `₹ ${value.toLocaleString('en-IN')}`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome, {user?.name}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <SummaryCard title="Total Stock Value" value={formatCurrency(summary.totalStockValue)} icon={<DollarSign className="text-white"/>} color="bg-green-500" />
                <SummaryCard title="Total Units" value={summary.totalUnits.toLocaleString()} icon={<Package className="text-white"/>} color="bg-blue-500" />
                <SummaryCard title="Today's Inward" value={summary.todaysInward} icon={<ArrowUpCircle className="text-white"/>} color="bg-teal-500" />
                <SummaryCard title="Today's Outward" value={summary.todaysOutward} icon={<ArrowDownCircle className="text-white"/>} color="bg-orange-500" />
                <SummaryCard title="Low Stock Items" value={summary.lowStockItems} icon={<AlertTriangle className="text-white"/>} color="bg-red-500" />
                <SummaryCard title="Active SKUs" value={summary.activeSKUs} icon={<Users className="text-white"/>} color="bg-purple-500" />
            </div>

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
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={channelWiseOutward} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {channelWiseOutward.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Top 10 SKUs by Stock">
                     <Table columns={productColumns} data={topSKUsByStock.slice(0, 10)} />
                </Card>
                {user?.role === Role.Admin && <Card title="Recent Activities">
                     <Table columns={activityColumns} data={recentActivities.slice(0, 10)} />
                </Card>}
            </div>

        </div>
    );
};

export default Dashboard;
