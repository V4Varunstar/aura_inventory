import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Upload, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { addOutward } from '../../services/firebaseService';
import { useToast } from '../../context/ToastContext';
import { useCompany } from '../../context/CompanyContext';

interface BulkOutwardUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OutwardRow {
  'SKU': string;
  'EAN': string;
  'Quantity': number;
  'Warehouse': string;
  'Destination': string;
  'Courier Partner': string;
  'Shipment Ref/AWB': string;
  'Transaction Date': string;
  'Notes': string;
  'Batch No.': string;
  'Manufacturing Date': string;
  'Expiry Date': string;
}

const BulkOutwardUpload: React.FC<BulkOutwardUploadProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { addToast } = useToast();
  const { company } = useCompany();

  const downloadTemplate = () => {
    const template = [
      {
        'SKU': 'AS-HS-50ML',
        'EAN': '8906158841001',
        'Quantity': 50,
        'Warehouse': 'Delhi WH',
        'Destination': 'Amazon',
        'Courier Partner': 'Delhivery',
        'Shipment Ref/AWB': 'AWB123456',
        'Transaction Date': '2025-11-26',
        'Notes': 'Sample outward',
        'Batch No.': 'B240826001',
        'Manufacturing Date': '2024-08-26',
        'Expiry Date': '2026-08-26'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Outward Template');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.writeFile(wb, 'Bulk_Outward_Template.xlsx');
    addToast('Template downloaded successfully!', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
    }
  };

  const parseDate = (dateStr: string): Date => {
    // Handle Excel date serial numbers and string dates
    if (!isNaN(Number(dateStr))) {
      // Excel serial date
      const date = new Date((Number(dateStr) - 25569) * 86400 * 1000);
      return date;
    }
    return new Date(dateStr);
  };

  const handleUpload = async () => {
    if (!file || !company) return;

    setIsUploading(true);
    setErrors([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: OutwardRow[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }

      const validationErrors: string[] = [];
      const validRecords: any[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2; // +2 because Excel is 1-indexed and has header

        // Validate required fields
        if (!row['SKU']) validationErrors.push(`Row ${rowNum}: SKU is required`);
        if (!row['Quantity'] || row['Quantity'] <= 0) validationErrors.push(`Row ${rowNum}: Valid quantity is required`);
        if (!row['Warehouse']) validationErrors.push(`Row ${rowNum}: Warehouse is required`);
        if (!row['Destination']) validationErrors.push(`Row ${rowNum}: Destination is required`);

        if (validationErrors.length === 0 || validationErrors.filter(e => e.startsWith(`Row ${rowNum}:`)).length === 0) {
          validRecords.push({
            sku: row['SKU'],
            ean: row['EAN'] || '',
            quantity: Number(row['Quantity']),
            warehouse: row['Warehouse'],
            destination: row['Destination'],
            courierPartner: row['Courier Partner'] || '',
            shipmentRef: row['Shipment Ref/AWB'] || '',
            transactionDate: row['Transaction Date'] ? parseDate(row['Transaction Date']) : new Date(),
            notes: row['Notes'] || '',
            batchNo: row['Batch No.'] || '',
            manufacturingDate: row['Manufacturing Date'] ? parseDate(row['Manufacturing Date']) : undefined,
            expiryDate: row['Expiry Date'] ? parseDate(row['Expiry Date']) : undefined
          });
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        addToast(`Found ${validationErrors.length} validation errors. Please fix and try again.`, 'error');
        setIsUploading(false);
        return;
      }

      // Process all records
      let successCount = 0;
      const processErrors: string[] = [];

      for (const record of validRecords) {
        try {
          await addOutward({
            companyId: company.id,
            productId: record.sku, // Will be resolved in service
            sku: record.sku,
            ean: record.ean,
            quantity: record.quantity,
            warehouseId: record.warehouse, // Will be resolved in service
            destination: record.destination,
            courierPartner: record.courierPartner,
            shipmentRef: record.shipmentRef,
            notes: record.notes,
            transactionDate: record.transactionDate,
            batchNo: record.batchNo,
            manufacturingDate: record.manufacturingDate,
            expiryDate: record.expiryDate,
          } as any);
          successCount++;
        } catch (error) {
          processErrors.push(`SKU ${record.sku}: ${error instanceof Error ? error.message : 'Failed to process'}`);
        }
      }

      if (successCount > 0) {
        addToast(`Successfully uploaded ${successCount} outward records!`, 'success');
        onSuccess();
        onClose();
      }

      if (processErrors.length > 0) {
        setErrors(processErrors);
        addToast(`${processErrors.length} records failed to upload`, 'error');
      }

    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to process file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Outward Upload">
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Instructions:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Download the Excel template</li>
                <li>Fill in your outward stock data</li>
                <li>Upload the completed file</li>
                <li>All dates should be in YYYY-MM-DD format</li>
                <li>SKU and Warehouse names must match existing records</li>
                <li>System will check stock availability before processing</li>
              </ol>
            </div>
          </div>
        </div>

        <Button
          onClick={downloadTemplate}
          leftIcon={<Download />}
          variant="secondary"
          className="w-full"
        >
          Download Excel Template
        </Button>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {file.name}
            </p>
          )}
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg max-h-60 overflow-y-auto">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Errors Found:
            </p>
            <ul className="list-disc ml-4 text-sm text-red-700 dark:text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            isLoading={isUploading}
            leftIcon={<Upload />}
          >
            Upload Outward Stock
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkOutwardUpload;
