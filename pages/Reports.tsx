import React from 'react';
import * as XLSX from 'xlsx';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Download, Package } from 'lucide-react';
import {
    getFullStockReport,
    getInwardReport,
    getOutwardReport,
    getBatchExpiryReport,
    getSkuMovementReport,
    getWarehouseStockReport
} from '../services/firebaseService';
import { getAllPlatformShipments, getPlatformDisplayName } from '../services/platformShipmentService';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';

interface ReportCardProps {
    title: string;
    description: string;
    onDownload: (format: 'csv' | 'xlsx') => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, onDownload }) => (
    <Card title={title}>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        <div className="flex space-x-2">
            <Button size="sm" variant="secondary" onClick={() => onDownload('csv')} leftIcon={<Download size={16} />}>CSV</Button>
            <Button size="sm" variant="secondary" onClick={() => onDownload('xlsx')} leftIcon={<Download size={16} />}>Excel</Button>
        </div>
    </Card>
);

const Reports: React.FC = () => {
    const { company } = useCompany();
    const { addToast } = useToast();

    const handleDownloadShipmentReport = async () => {
        if (!company) {
            addToast('Company not found', 'error');
            return;
        }

        try {
            addToast('Generating report...', 'info');

            // Get all shipments across all platforms
            const allShipments = await getAllPlatformShipments(company.id, {});

            // Group by platform
            const platforms = ['amazon-fba', 'flipkart-fbf', 'myntra-sjit', 'zepto-po', 'nykaa-po'] as const;
            const workbook = XLSX.utils.book_new();

            platforms.forEach(platform => {
                const platformShipments = allShipments.filter(s => s.platform === platform);
                
                // Transform data for Excel
                const excelData = platformShipments.map(shipment => ({
                    'Shipment Name': shipment.shipmentName,
                    'Tracking ID': shipment.trackingId || '-',
                    'AWB Number': shipment.awb || '-',
                    'Carrier': shipment.carrier || '-',
                    'Items Count': shipment.items?.length || 0,
                    'Total Quantity': shipment.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
                    'Status': shipment.status,
                    'Created Date': new Date(shipment.createdAt).toLocaleDateString('en-IN'),
                    'Notes': shipment.notes || '-'
                }));

                // Create worksheet for this platform
                const worksheet = XLSX.utils.json_to_sheet(excelData);
                
                // Set column widths
                worksheet['!cols'] = [
                    { wch: 20 }, // Shipment Name
                    { wch: 15 }, // Tracking ID
                    { wch: 15 }, // AWB
                    { wch: 12 }, // Carrier
                    { wch: 10 }, // Items Count
                    { wch: 12 }, // Total Qty
                    { wch: 12 }, // Status
                    { wch: 15 }, // Date
                    { wch: 30 }  // Notes
                ];

                // Add sheet to workbook
                const sheetName = getPlatformDisplayName(platform).replace(/\s+/g, '_');
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            });

            // Generate and download file
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Platform_Shipments_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            addToast('Report downloaded successfully', 'success');
        } catch (error) {
            console.error('Error generating shipment report:', error);
            addToast('Failed to generate report', 'error');
        }
    };

    const handleDownload = async (report: string, format: 'csv' | 'xlsx') => {
        let data;
        switch (report) {
            case 'Full Stock Report':
                data = await getFullStockReport(format);
                break;
            case 'Inward Report':
                data = await getInwardReport(format);
                break;
            case 'Outward Report':
                data = await getOutwardReport(format);
                break;
            case 'Batch Expiry Report':
                data = await getBatchExpiryReport(format);
                break;
            case 'SKU Movement Report':
                data = await getSkuMovementReport(format);
                break;
            case 'Warehouse Stock Report':
                data = await getWarehouseStockReport(format);
                break;
            default:
                alert('Unknown report type');
                return;
        }

        let blob, url;
        if (format === 'csv') {
            const fileData = jsonToCsv(data);
            blob = new Blob([fileData], { type: 'text/csv' });
        } else if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        }
        url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${report}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    };

    // Simple JSON to CSV converter
    function jsonToCsv(items: any[]): string {
        if (!items.length) return '';
        const header = Object.keys(items[0]).join(',');
        const rows = items.map(obj => Object.values(obj).join(','));
        return [header, ...rows].join('\n');
    }

    const reports = [
        { title: 'Full Stock Report', description: 'Complete list of all SKUs with current stock levels across all warehouses.' },
        { title: 'Inward Report', description: 'Detailed log of all incoming stock for a selected period.' },
        { title: 'Outward Report', description: 'Detailed log of all outgoing stock for a selected period.' },
        { title: 'Batch Expiry Report', description: 'Lists all batches with their expiry dates, sorted by soonest to expire.' },
        { title: 'SKU Movement Report', description: 'Tracks the historical movement of a specific SKU.' },
        { title: 'Warehouse Stock Report', description: 'Shows stock levels and valuation for a specific warehouse.' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Reports</h1>
            
            {/* Platform Shipment Report - Featured */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Platform Shipments Report</h3>
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">NEW</span>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Comprehensive report of all platform shipments (Amazon FBA, Flipkart FBF, Myntra SJIT, Zepto PO, Nykaa PO) 
                            in a single Excel file with separate sheets for each platform.
                        </p>
                        <Button 
                            onClick={handleDownloadShipmentReport}
                            leftIcon={<Download size={16} />}
                        >
                            Download Multi-Platform Report
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Other Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <ReportCard 
                        key={report.title}
                        title={report.title}
                        description={report.description}
                        onDownload={(format) => handleDownload(report.title, format)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Reports;
