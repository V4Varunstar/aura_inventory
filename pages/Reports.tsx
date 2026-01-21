import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { Download, FileText, AlertCircle, Loader } from 'lucide-react';
import {
  getProducts,
  getWarehouses,
  getInwardRecords,
  getOutwardRecords,
} from '../services/firebaseService';
import { getParties } from '../services/partyService';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, Warehouse, Inward, Outward, Party } from '../types';

type ReportType =
  | 'inward'
  | 'outward'
  | 'stock'
  | 'lowStock'
  | 'partyWise'
  | 'dateWise'
  | 'valueAnalysis';

interface ReportFilters {
  startDate: string;
  endDate: string;
  warehouseId?: string;
  productId?: string;
  partyId?: string;
}

interface StockData {
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  inwardQty: number;
  outwardQty: number;
  currentStock: number;
  minStockThreshold?: number;
  costPrice?: number;
  totalValue?: number;
}

interface PartyReportData {
  partyId: string;
  partyName: string;
  totalInward: number;
  totalOutward: number;
  inwardValue: number;
  outwardValue: number;
  netQuantity: number;
  netValue: number;
}

interface DateWiseData {
  date: string;
  inwardQty: number;
  outwardQty: number;
  netMovement: number;
  transactions: number;
}

interface ValueAnalysisData {
  totalInwardQty: number;
  totalInwardValue: number;
  totalOutwardQty: number;
  totalOutwardValue: number;
  avgInwardPrice: number;
  avgOutwardPrice: number;
  currentStockQty: number;
  currentStockValue: number;
}

const Reports: React.FC = () => {
  const { company } = useCompany();
  const { addToast } = useToast();
  const { selectedWarehouse } = useWarehouse();

  const [reportType, setReportType] = useState<ReportType>('inward');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [inwardRecords, setInwardRecords] = useState<Inward[]>([]);
  const [outwardRecords, setOutwardRecords] = useState<Outward[]>([]);

  const [reportData, setReportData] = useState<any[]>([]);
  const [valueAnalysisData, setValueAnalysisData] = useState<ValueAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const effectiveWarehouseId = selectedWarehouse?.id || filters.warehouseId;

  // Keep report scoped to the globally selected warehouse
  useEffect(() => {
    if (!selectedWarehouse) return;
    setFilters((prev) => ({ ...prev, warehouseId: selectedWarehouse.id }));
    setReportData([]);
    setValueAnalysisData(null);
  }, [selectedWarehouse?.id]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [company]);

  const loadInitialData = async () => {
    if (!company) return;

    try {
      setDataLoading(true);
      const [productsData, warehousesData, partiesData, inwardData, outwardData] =
        await Promise.all([
          getProducts(),
          getWarehouses(),
          getParties(),
          getInwardRecords(),
          getOutwardRecords(),
        ]);

      setProducts(productsData.filter((p: Product) => !p.isDeleted));
      setWarehouses(warehousesData.filter((w: Warehouse) => !w.isDeleted));
      setParties(partiesData.filter((p: Party) => !p.isDeleted));
      setInwardRecords(inwardData.filter((i: Inward) => !i.isDeleted));
      setOutwardRecords(outwardData.filter((o: Outward) => !o.isDeleted));
    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate stock for a product in a warehouse
  const calculateStock = (productId: string, warehouseId: string): StockData => {
    const product = products.find((p) => p.id === productId);
    const warehouse = warehouses.find((w) => w.id === warehouseId);

    const inwardQty = inwardRecords
      .filter((i) => i.productId === productId && i.warehouseId === warehouseId)
      .reduce((sum, i) => sum + i.quantity, 0);

    const outwardQty = outwardRecords
      .filter((o) => o.productId === productId && o.warehouseId === warehouseId)
      .reduce((sum, o) => sum + o.quantity, 0);

    const currentStock = inwardQty - outwardQty;
    const avgCostPrice = product?.costPrice || 0;
    const totalValue = currentStock * avgCostPrice;

    return {
      productId,
      productName: product?.name || 'Unknown',
      sku: product?.sku || '',
      warehouseId,
      warehouseName: warehouse?.name || 'Unknown',
      inwardQty,
      outwardQty,
      currentStock,
      minStockThreshold: product?.minStockThreshold || product?.lowStockThreshold,
      costPrice: avgCostPrice,
      totalValue,
    };
  };

  // Generate report based on type and filters
  const generateReport = async () => {
    if (!company) {
      addToast('Company not found', 'error');
      return;
    }

    try {
      setLoading(true);
      setReportData([]);
      setValueAnalysisData(null);

      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day

      let data: any[] = [];

      switch (reportType) {
        case 'inward':
          data = await generateInwardReport(startDate, endDate);
          break;

        case 'outward':
          data = await generateOutwardReport(startDate, endDate);
          break;

        case 'stock':
          data = await generateStockReport();
          break;

        case 'lowStock':
          data = await generateLowStockReport();
          break;

        case 'partyWise':
          data = await generatePartyWiseReport(startDate, endDate);
          break;

        case 'dateWise':
          data = await generateDateWiseReport(startDate, endDate);
          break;

        case 'valueAnalysis':
          const valueData = await generateValueAnalysisReport(startDate, endDate);
          setValueAnalysisData(valueData);
          data = []; // Value analysis shows summary, not table
          break;

        default:
          addToast('Invalid report type', 'error');
          return;
      }

      setReportData(data);
      addToast(`Report generated successfully with ${data.length} records`, 'success');
    } catch (error) {
      console.error('Error generating report:', error);
      addToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Inward Report
  const generateInwardReport = async (
    startDate: Date,
    endDate: Date
  ): Promise<any[]> => {
    let records = inwardRecords.filter((i) => {
      const recordDate = i.transactionDate
        ? new Date(i.transactionDate)
        : new Date(i.createdAt);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Apply filters
    if (effectiveWarehouseId) {
      records = records.filter((r) => r.warehouseId === effectiveWarehouseId);
    }
    if (filters.productId) {
      records = records.filter((r) => r.productId === filters.productId);
    }
    if (filters.partyId) {
      records = records.filter((r) => r.partyId === filters.partyId);
    }

    return records.map((record) => {
      const product = products.find((p) => p.id === record.productId);
      const warehouse = warehouses.find((w) => w.id === record.warehouseId);
      const party = record.partyId
        ? parties.find((p) => p.id === record.partyId)
        : null;

      return {
        Date: new Date(record.transactionDate || record.createdAt).toLocaleDateString(),
        Product: product?.name || record.productName || 'Unknown',
        SKU: record.sku,
        EAN: record.ean || '-',
        Quantity: record.quantity,
        'Cost Price': record.costPrice.toFixed(2),
        'Total Value': (record.quantity * record.costPrice).toFixed(2),
        Source: record.source,
        Party: party?.name || record.partyName || '-',
        Warehouse: warehouse?.name || record.warehouseName || 'Unknown',
        'Batch No': record.batchNo || '-',
        'Document No': record.documentNo || '-',
        'AWB Number': record.awbNumber || '-',
        Notes: record.notes || '-',
      };
    });
  };

  // Outward Report
  const generateOutwardReport = async (
    startDate: Date,
    endDate: Date
  ): Promise<any[]> => {
    let records = outwardRecords.filter((o) => {
      const recordDate = o.transactionDate
        ? new Date(o.transactionDate)
        : new Date(o.createdAt);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Apply filters
    if (effectiveWarehouseId) {
      records = records.filter((r) => r.warehouseId === effectiveWarehouseId);
    }
    if (filters.productId) {
      records = records.filter((r) => r.productId === filters.productId);
    }
    if (filters.partyId) {
      records = records.filter((r) => r.partyId === filters.partyId);
    }

    return records.map((record) => {
      const product = products.find((p) => p.id === record.productId);
      const warehouse = warehouses.find((w) => w.id === record.warehouseId);
      const party = record.partyId
        ? parties.find((p) => p.id === record.partyId)
        : null;
      const costPrice = record.costPrice || product?.costPrice || 0;

      return {
        Date: new Date(record.transactionDate || record.createdAt).toLocaleDateString(),
        Product: product?.name || record.productName || 'Unknown',
        SKU: record.sku,
        EAN: record.ean || '-',
        Quantity: record.quantity,
        'Cost Price': costPrice.toFixed(2),
        'Total Value': (record.quantity * costPrice).toFixed(2),
        Destination: record.destination,
        Party: party?.name || record.partyName || '-',
        Warehouse: warehouse?.name || record.warehouseName || 'Unknown',
        'Order Number': record.orderNumber || record.awbNumber || '-',
        'Shipment Ref': record.shipmentRef || '-',
        'Courier Partner': record.courierPartner || '-',
        Notes: record.notes || '-',
      };
    });
  };

  // Stock Summary Report
  const generateStockReport = async (): Promise<any[]> => {
    const stockMap = new Map<string, StockData>();

    // Get unique product-warehouse combinations
    const combinations = new Set<string>();
    inwardRecords.forEach((i) => {
      combinations.add(`${i.productId}_${i.warehouseId}`);
    });
    outwardRecords.forEach((o) => {
      combinations.add(`${o.productId}_${o.warehouseId}`);
    });

    // Calculate stock for each combination
    combinations.forEach((combo) => {
      const [productId, warehouseId] = combo.split('_');
      const stock = calculateStock(productId, warehouseId);
      
      // Apply filters
      if (effectiveWarehouseId && stock.warehouseId !== effectiveWarehouseId) return;
      if (filters.productId && stock.productId !== filters.productId) return;
      
      stockMap.set(combo, stock);
    });

    return Array.from(stockMap.values()).map((stock) => ({
      Product: stock.productName,
      SKU: stock.sku,
      Warehouse: stock.warehouseName,
      'Inward Qty': stock.inwardQty,
      'Outward Qty': stock.outwardQty,
      'Current Stock': stock.currentStock,
      'Min Threshold': stock.minStockThreshold || 0,
      'Cost Price': stock.costPrice?.toFixed(2) || '0.00',
      'Stock Value': stock.totalValue?.toFixed(2) || '0.00',
    }));
  };

  // Low Stock Alert Report
  const generateLowStockReport = async (): Promise<any[]> => {
    const stockMap = new Map<string, StockData>();

    // Get unique product-warehouse combinations
    const combinations = new Set<string>();
    inwardRecords.forEach((i) => {
      combinations.add(`${i.productId}_${i.warehouseId}`);
    });
    outwardRecords.forEach((o) => {
      combinations.add(`${o.productId}_${o.warehouseId}`);
    });

    // Calculate stock for each combination
    combinations.forEach((combo) => {
      const [productId, warehouseId] = combo.split('_');
      const stock = calculateStock(productId, warehouseId);
      
      // Apply filters
      if (effectiveWarehouseId && stock.warehouseId !== effectiveWarehouseId) return;
      if (filters.productId && stock.productId !== filters.productId) return;
      
      // Only include if stock is below or equal to threshold
      const threshold = stock.minStockThreshold || 0;
      if (stock.currentStock <= threshold) {
        stockMap.set(combo, stock);
      }
    });

    return Array.from(stockMap.values())
      .sort((a, b) => a.currentStock - b.currentStock) // Sort by lowest stock first
      .map((stock) => ({
        Product: stock.productName,
        SKU: stock.sku,
        Warehouse: stock.warehouseName,
        'Current Stock': stock.currentStock,
        'Min Threshold': stock.minStockThreshold || 0,
        'Shortage': Math.abs(stock.currentStock - (stock.minStockThreshold || 0)),
        Status: stock.currentStock === 0 ? 'Out of Stock' : 'Low Stock',
        'Stock Value': stock.totalValue?.toFixed(2) || '0.00',
      }));
  };

  // Party-wise Report
  const generatePartyWiseReport = async (
    startDate: Date,
    endDate: Date
  ): Promise<any[]> => {
    const partyMap = new Map<string, PartyReportData>();

    // Filter records by date
    const filteredInward = inwardRecords.filter((i) => {
      const recordDate = i.transactionDate
        ? new Date(i.transactionDate)
        : new Date(i.createdAt);
      return recordDate >= startDate && recordDate <= endDate && i.partyId;
    });

    const filteredOutward = outwardRecords.filter((o) => {
      const recordDate = o.transactionDate
        ? new Date(o.transactionDate)
        : new Date(o.createdAt);
      return recordDate >= startDate && recordDate <= endDate && o.partyId;
    });

    // Apply party filter
    let relevantParties = parties;
    if (filters.partyId) {
      relevantParties = parties.filter((p) => p.id === filters.partyId);
    }

    relevantParties.forEach((party) => {
      const inwardForParty = filteredInward.filter((i) => i.partyId === party.id);
      const outwardForParty = filteredOutward.filter((o) => o.partyId === party.id);

      const totalInward = inwardForParty.reduce((sum, i) => sum + i.quantity, 0);
      const totalOutward = outwardForParty.reduce((sum, o) => sum + o.quantity, 0);
      const inwardValue = inwardForParty.reduce(
        (sum, i) => sum + i.quantity * i.costPrice,
        0
      );
      const outwardValue = outwardForParty.reduce((sum, o) => {
        const product = products.find((p) => p.id === o.productId);
        const costPrice = o.costPrice || product?.costPrice || 0;
        return sum + o.quantity * costPrice;
      }, 0);

      if (totalInward > 0 || totalOutward > 0) {
        partyMap.set(party.id, {
          partyId: party.id,
          partyName: party.name,
          totalInward,
          totalOutward,
          inwardValue,
          outwardValue,
          netQuantity: totalInward - totalOutward,
          netValue: inwardValue - outwardValue,
        });
      }
    });

    return Array.from(partyMap.values()).map((data) => ({
      Party: data.partyName,
      Type: parties.find((p) => p.id === data.partyId)?.type || '-',
      'Inward Qty': data.totalInward,
      'Inward Value': data.inwardValue.toFixed(2),
      'Outward Qty': data.totalOutward,
      'Outward Value': data.outwardValue.toFixed(2),
      'Net Qty': data.netQuantity,
      'Net Value': data.netValue.toFixed(2),
    }));
  };

  // Date-wise Movement Report
  const generateDateWiseReport = async (
    startDate: Date,
    endDate: Date
  ): Promise<any[]> => {
    const dateMap = new Map<string, DateWiseData>();

    // Filter records by date
    const filteredInward = inwardRecords.filter((i) => {
      const recordDate = i.transactionDate
        ? new Date(i.transactionDate)
        : new Date(i.createdAt);
      return recordDate >= startDate && recordDate <= endDate;
    });

    const filteredOutward = outwardRecords.filter((o) => {
      const recordDate = o.transactionDate
        ? new Date(o.transactionDate)
        : new Date(o.createdAt);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Apply filters
    const inwardFiltered = effectiveWarehouseId
      ? filteredInward.filter((i) => i.warehouseId === effectiveWarehouseId)
      : filteredInward;
    const outwardFiltered = effectiveWarehouseId
      ? filteredOutward.filter((o) => o.warehouseId === effectiveWarehouseId)
      : filteredOutward;

    // Group by date
    inwardFiltered.forEach((record) => {
      const date = new Date(record.transactionDate || record.createdAt)
        .toISOString()
        .split('T')[0];
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          inwardQty: 0,
          outwardQty: 0,
          netMovement: 0,
          transactions: 0,
        });
      }
      
      const data = dateMap.get(date)!;
      data.inwardQty += record.quantity;
      data.transactions += 1;
      data.netMovement = data.inwardQty - data.outwardQty;
    });

    outwardFiltered.forEach((record) => {
      const date = new Date(record.transactionDate || record.createdAt)
        .toISOString()
        .split('T')[0];
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          inwardQty: 0,
          outwardQty: 0,
          netMovement: 0,
          transactions: 0,
        });
      }
      
      const data = dateMap.get(date)!;
      data.outwardQty += record.quantity;
      data.transactions += 1;
      data.netMovement = data.inwardQty - data.outwardQty;
    });

    return Array.from(dateMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((data) => ({
        Date: new Date(data.date).toLocaleDateString(),
        'Inward Qty': data.inwardQty,
        'Outward Qty': data.outwardQty,
        'Net Movement': data.netMovement,
        'Total Transactions': data.transactions,
      }));
  };

  // Value Analysis Report
  const generateValueAnalysisReport = async (
    startDate: Date,
    endDate: Date
  ): Promise<ValueAnalysisData> => {
    // Filter records by date
    const filteredInward = inwardRecords.filter((i) => {
      const recordDate = i.transactionDate
        ? new Date(i.transactionDate)
        : new Date(i.createdAt);
      return recordDate >= startDate && recordDate <= endDate;
    });

    const filteredOutward = outwardRecords.filter((o) => {
      const recordDate = o.transactionDate
        ? new Date(o.transactionDate)
        : new Date(o.createdAt);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Apply filters
    const inwardFiltered = effectiveWarehouseId
      ? filteredInward.filter((i) => i.warehouseId === effectiveWarehouseId)
      : filteredInward;
    const outwardFiltered = effectiveWarehouseId
      ? filteredOutward.filter((o) => o.warehouseId === effectiveWarehouseId)
      : filteredOutward;

    const totalInwardQty = inwardFiltered.reduce((sum, i) => sum + i.quantity, 0);
    const totalInwardValue = inwardFiltered.reduce(
      (sum, i) => sum + i.quantity * i.costPrice,
      0
    );

    const totalOutwardQty = outwardFiltered.reduce((sum, o) => sum + o.quantity, 0);
    const totalOutwardValue = outwardFiltered.reduce((sum, o) => {
      const product = products.find((p) => p.id === o.productId);
      const costPrice = o.costPrice || product?.costPrice || 0;
      return sum + o.quantity * costPrice;
    }, 0);

    // Calculate current stock across all products
    const stockMap = new Map<string, StockData>();
    const combinations = new Set<string>();
    inwardRecords.forEach((i) => {
      combinations.add(`${i.productId}_${i.warehouseId}`);
    });
    outwardRecords.forEach((o) => {
      combinations.add(`${o.productId}_${o.warehouseId}`);
    });

    combinations.forEach((combo) => {
      const [productId, warehouseId] = combo.split('_');
      if (effectiveWarehouseId && warehouseId !== effectiveWarehouseId) return;
      const stock = calculateStock(productId, warehouseId);
      stockMap.set(combo, stock);
    });

    const currentStockQty = Array.from(stockMap.values()).reduce(
      (sum, s) => sum + s.currentStock,
      0
    );
    const currentStockValue = Array.from(stockMap.values()).reduce(
      (sum, s) => sum + (s.totalValue || 0),
      0
    );

    return {
      totalInwardQty,
      totalInwardValue,
      totalOutwardQty,
      totalOutwardValue,
      avgInwardPrice: totalInwardQty > 0 ? totalInwardValue / totalInwardQty : 0,
      avgOutwardPrice: totalOutwardQty > 0 ? totalOutwardValue / totalOutwardQty : 0,
      currentStockQty,
      currentStockValue,
    };
  };

  // Export to Excel
  const exportToExcel = () => {
    if (reportType === 'valueAnalysis' && valueAnalysisData) {
      // Export value analysis summary
      const summaryData = [
        { Metric: 'Total Inward Quantity', Value: valueAnalysisData.totalInwardQty },
        {
          Metric: 'Total Inward Value',
          Value: valueAnalysisData.totalInwardValue.toFixed(2),
        },
        { Metric: 'Total Outward Quantity', Value: valueAnalysisData.totalOutwardQty },
        {
          Metric: 'Total Outward Value',
          Value: valueAnalysisData.totalOutwardValue.toFixed(2),
        },
        {
          Metric: 'Average Inward Price',
          Value: valueAnalysisData.avgInwardPrice.toFixed(2),
        },
        {
          Metric: 'Average Outward Price',
          Value: valueAnalysisData.avgOutwardPrice.toFixed(2),
        },
        { Metric: 'Current Stock Quantity', Value: valueAnalysisData.currentStockQty },
        {
          Metric: 'Current Stock Value',
          Value: valueAnalysisData.currentStockValue.toFixed(2),
        },
      ];

      const ws = XLSX.utils.json_to_sheet(summaryData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Value Analysis');
      XLSX.writeFile(wb, `Value_Analysis_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      addToast('Report exported successfully', 'success');
      return;
    }

    if (reportData.length === 0) {
      addToast('No data to export', 'warning');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      
      const reportNames: Record<ReportType, string> = {
        inward: 'Inward Report',
        outward: 'Outward Report',
        stock: 'Stock Summary',
        lowStock: 'Low Stock Alert',
        partyWise: 'Party-wise Report',
        dateWise: 'Date-wise Movement',
        valueAnalysis: 'Value Analysis',
      };
      
      const sheetName = reportNames[reportType];
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      const fileName = `${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      addToast('Report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      addToast('Failed to export report', 'error');
    }
  };

  const reportTypeOptions = [
    { value: 'inward', label: 'Inward Report' },
    { value: 'outward', label: 'Outward Report' },
    { value: 'stock', label: 'Stock Summary' },
    { value: 'lowStock', label: 'Low Stock Alert' },
    { value: 'partyWise', label: 'Party-wise Report' },
    { value: 'dateWise', label: 'Date-wise Movement' },
    { value: 'valueAnalysis', label: 'Value Analysis' },
  ];

  const showDateFilters = [
    'inward',
    'outward',
    'partyWise',
    'dateWise',
    'valueAnalysis',
  ].includes(reportType);

  // If a global warehouse is selected, hide the per-page filter to avoid confusion.
  const showWarehouseFilter = !selectedWarehouse;
  const showProductFilter = ['inward', 'outward', 'stock', 'lowStock'].includes(
    reportType
  );
  const showPartyFilter = ['inward', 'outward', 'partyWise'].includes(reportType);

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
          Loading data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="text-primary-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate comprehensive reports for your inventory
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <Card title="Report Configuration">
        <div className="space-y-4">
          {/* Report Type */}
          <div>
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as ReportType);
                setReportData([]);
                setValueAnalysisData(null);
              }}
            >
              {reportTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Date Filters */}
          {showDateFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Warehouse Filter */}
            {showWarehouseFilter && (
              <div>
                <Select
                  label={selectedWarehouse ? 'Warehouse (Selected)' : 'Warehouse (Optional)'}
                  value={effectiveWarehouseId || ''}
                  onChange={(e) => {
                    // If no global selection exists (edge-case), allow fallback to local filter.
                    if (selectedWarehouse) return;
                    setFilters({
                      ...filters,
                      warehouseId: e.target.value || undefined,
                    });
                  }}
                  disabled={!!selectedWarehouse}
                >
                  {selectedWarehouse ? (
                    <option value={selectedWarehouse.id}>{selectedWarehouse.name}</option>
                  ) : (
                    <>
                      <option value="">All Warehouses</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </>
                  )}
                </Select>
                {selectedWarehouse && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Change warehouse from the top-right selector.
                  </p>
                )}
              </div>
            )}

            {/* Product Filter */}
            {showProductFilter && (
              <div>
                <Select
                  label="Product (Optional)"
                  value={filters.productId || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      productId: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">All Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Party Filter */}
            {showPartyFilter && (
              <div>
                <Select
                  label="Party (Optional)"
                  value={filters.partyId || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      partyId: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">All Parties</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={generateReport}
              isLoading={loading}
              leftIcon={<FileText size={18} />}
            >
              Generate Report
            </Button>
            {(reportData.length > 0 || valueAnalysisData) && (
              <Button
                onClick={exportToExcel}
                variant="secondary"
                leftIcon={<Download size={18} />}
              >
                Export to Excel
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Value Analysis Summary */}
      {reportType === 'valueAnalysis' && valueAnalysisData && (
        <Card title="Value Analysis Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Inward</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {valueAnalysisData.totalInwardQty.toLocaleString()} units
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                ₹{valueAnalysisData.totalInwardValue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Outward</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {valueAnalysisData.totalOutwardQty.toLocaleString()} units
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                ₹{valueAnalysisData.totalOutwardValue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Prices</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                In: ₹{valueAnalysisData.avgInwardPrice.toFixed(2)}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Out: ₹{valueAnalysisData.avgOutwardPrice.toFixed(2)}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {valueAnalysisData.currentStockQty.toLocaleString()} units
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                ₹{valueAnalysisData.currentStockValue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Report Data Table */}
      {reportData.length > 0 && (
        <Card title={`Report Results (${reportData.length} records)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {Object.values(row).map((value: any, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && reportData.length === 0 && !valueAnalysisData && (
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Select filters and click "Generate Report" to view data
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
