import React, { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useCompany } from '../../context/CompanyContext';
import { useToast } from '../../context/ToastContext';
import { getProducts } from '../../services/firebaseService';
import { bulkImportEanMappings } from '../../services/eanMappingService';
import * as XLSX from 'xlsx';

interface BulkEanImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportRow {
  ean: string;
  productName: string;
  productId?: string;
  status?: 'success' | 'error';
  error?: string;
}

export default function BulkEanImport({ isOpen, onClose, onSuccess }: BulkEanImportProps) {
  const { company } = useCompany();
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; errors: ImportRow[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      addToast('Please upload a valid Excel or CSV file', 'error');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Map to our format (expecting columns: EAN, Product Name)
        const rows: ImportRow[] = jsonData.map((row: any) => ({
          ean: String(row['EAN'] || row['ean'] || '').trim(),
          productName: String(row['Product Name'] || row['product name'] || row['ProductName'] || '').trim()
        }));

        setPreviewData(rows);
        setImportResult(null);
      } catch (error) {
        addToast('Failed to parse file', 'error');
        console.error('Parse error:', error);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!company || previewData.length === 0) return;

    setImporting(true);
    try {
      // Get all products
      const products = await getProducts();

      // Import mappings
      const result = await bulkImportEanMappings(company.id, previewData, products);
      
      setImportResult(result);
      
      if (result.success > 0) {
        addToast(`Successfully imported ${result.success} EAN mapping(s)`, 'success');
        if (result.errors.length === 0) {
          // All successful - close and refresh
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        }
      } else {
        addToast('No EAN mappings were imported', 'error');
      }
    } catch (error) {
      addToast('Import failed', 'error');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    // Create template with headers
    const template = [
      { 'EAN': '1234567890123', 'Product Name': 'Example Product' }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EAN Template');
    XLSX.writeFile(wb, 'ean_import_template.xlsx');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import EAN Mappings">
      <div className="space-y-6">
        {/* Instructions */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Import Instructions:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Upload Excel (.xlsx, .xls) or CSV file</li>
                <li>Required columns: <strong>EAN</strong> and <strong>Product Name</strong></li>
                <li>Product Name must match exactly with existing products</li>
                <li>EAN must be unique (duplicates will be skipped)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Download Template */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* File Upload */}
        {!importResult && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="ean-file-upload"
            />
            <label htmlFor="ean-file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                Excel or CSV files only
              </p>
            </label>
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && !importResult && (
          <div>
            <h3 className="font-semibold mb-2">Preview ({previewData.length} rows)</h3>
            <div className="max-h-64 overflow-auto border rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">EAN</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">{row.ean}</td>
                      <td className="px-4 py-2 text-sm">{row.productName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 10 && (
              <p className="text-xs text-gray-500 mt-2">
                Showing first 10 of {previewData.length} rows
              </p>
            )}
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  Successfully imported {importResult.success} mapping(s)
                </span>
              </div>
            </Card>

            {importResult.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {importResult.errors.length} Error(s)
                </h3>
                <div className="max-h-48 overflow-auto border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">EAN</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importResult.errors.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{row.ean}</td>
                          <td className="px-4 py-2 text-sm">{row.productName}</td>
                          <td className="px-4 py-2 text-sm text-red-600">{row.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {previewData.length > 0 && !importResult && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : `Import ${previewData.length} Mapping(s)`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
