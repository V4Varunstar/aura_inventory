import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { ShipmentStatus } from '../types';
import { 
  getPlatformShipments, 
  deductPlatformShipment, 
  getPlatformDisplayName,
  Platform,
  PlatformShipment 
} from '../services/platformShipmentService';
import { useToast } from '../context/ToastContext';
import { useCompany } from '../context/CompanyContext';
import { PlusCircle, Package, CheckCircle, AlertCircle } from 'lucide-react';

interface PlatformShipmentsPageProps {
  platform: Platform;
  createRoute: string;
}

const PlatformShipmentsPage: React.FC<PlatformShipmentsPageProps> = ({ platform, createRoute }) => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { addToast } = useToast();
  
  const [shipments, setShipments] = useState<PlatformShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    trackingId: '',
    carrier: '',
  });
  const [deductingId, setDeductingId] = useState<string | null>(null);

  useEffect(() => {
    fetchShipments();
  }, [company, platform]);

  const fetchShipments = async () => {
    if (!company?.id) return;
    
    setLoading(true);
    try {
      const data = await getPlatformShipments(company.id, platform, {
        status: filters.status as ShipmentStatus || undefined,
        trackingId: filters.trackingId || undefined,
        carrier: filters.carrier || undefined,
      });
      setShipments(data);
    } catch (error) {
      addToast('Failed to fetch shipments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeductShipment = async (shipmentId: string) => {
    if (!company) {
      addToast('Company not found', 'error');
      return;
    }
    
    if (!confirm('Are you sure you want to deduct this shipment? This will create outward entries and reduce stock.')) {
      return;
    }
    
    setDeductingId(shipmentId);
    try {
      await deductPlatformShipment(platform, shipmentId);
      addToast('Shipment deducted successfully', 'success');
      fetchShipments();
    } catch (error: any) {
      addToast(error.message || 'Failed to deduct shipment', 'error');
    } finally {
      setDeductingId(null);
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    const styles = {
      [ShipmentStatus.Created]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      [ShipmentStatus.Deducted]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      [ShipmentStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const columns = [
    {
      header: 'Shipment Name',
      accessor: 'shipmentName' as keyof PlatformShipment,
    },
    {
      header: 'Tracking / AWB',
      accessor: 'trackingId' as keyof PlatformShipment,
      render: (item: PlatformShipment) => item.trackingId || item.awb || '-',
    },
    {
      header: 'Carrier',
      accessor: 'carrier' as keyof PlatformShipment,
      render: (item: PlatformShipment) => item.carrier || '-',
    },
    {
      header: 'Items',
      accessor: 'items' as keyof PlatformShipment,
      render: (item: PlatformShipment) => `${item.items.length} SKUs`,
    },
    {
      header: 'Total Qty',
      accessor: 'items' as keyof PlatformShipment,
      render: (item: PlatformShipment) => item.items.reduce((sum, i) => sum + i.quantity, 0),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof PlatformShipment,
      render: (item: PlatformShipment) => getStatusBadge(item.status),
    },
    {
      header: 'Created',
      accessor: 'createdAt' as keyof PlatformShipment,
      render: (item: PlatformShipment) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof PlatformShipment,
      render: (item: PlatformShipment) => (
        <div className="flex space-x-2">
          {item.status === ShipmentStatus.Created && (
            <Button
              size="sm"
              onClick={() => handleDeductShipment(item.id)}
              disabled={deductingId === item.id}
              leftIcon={<CheckCircle size={14} />}
            >
              {deductingId === item.id ? 'Deducting...' : 'Deduct'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const platformName = getPlatformDisplayName(platform);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{platformName} Shipments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your {platformName} shipments and stock deductions
          </p>
        </div>
        <Button onClick={() => navigate(createRoute)} leftIcon={<PlusCircle />}>
          Create Shipment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value={ShipmentStatus.Created}>Created</option>
            <option value={ShipmentStatus.Deducted}>Deducted</option>
            <option value={ShipmentStatus.Cancelled}>Cancelled</option>
          </Select>
          
          <Input
            label="Tracking ID"
            placeholder="Search by tracking ID"
            value={filters.trackingId}
            onChange={(e) => setFilters({ ...filters, trackingId: e.target.value })}
          />
          
          <Input
            label="Carrier"
            placeholder="Search by carrier"
            value={filters.carrier}
            onChange={(e) => setFilters({ ...filters, carrier: e.target.value })}
          />
          
          <div className="flex items-end">
            <Button onClick={fetchShipments} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Shipments Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No shipments found</p>
            <Button onClick={() => navigate(createRoute)} className="mt-4">
              Create First Shipment
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={shipments} />
        )}
      </Card>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>How it works:</strong> Creating a shipment does NOT deduct stock. 
            Click "Deduct" button to validate stock and create outward entries. 
            Deduction is atomic and cannot be undone.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformShipmentsPage;
