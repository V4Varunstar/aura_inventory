import React, { useState } from 'react';
import { Product } from '../../types';
import { 
  parseExcelFile, 
  validateAndParseExcelData, 
  generateSampleTemplate,
  findDuplicateSKUs,
  ValidationError 
} from '../../utils/excelHelper';
import { addProductsBatch, checkExistingSKUs, BulkUploadResult } from '../../services/firebaseService';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface BulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (products: Product[]) => void;
}

enum UploadStep {
  SELECT_FILE = 'SELECT_FILE',
  PREVIEW = 'PREVIEW',
  CONFIRM = 'CONFIRM',
  RESULT = 'RESULT',
}

const BulkUpload: React.FC<BulkUploadProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<UploadStep>(UploadStep.SELECT_FILE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validProducts, setValidProducts] = useState<Partial<Product>[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicateSKUs, setDuplicateSKUs] = useState<string[]>([]);
  const [existingSKUs, setExistingSKUs] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      addToast('Please upload a valid Excel file (.xlsx or .xls)', 'error');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      // Parse the Excel file
      const rawData = await parseExcelFile(file);
      
      if (rawData.length === 0) {
        addToast('The Excel file is empty. Please add products and try again.', 'error');
        setIsProcessing(false);
        return;
      }

      // Validate and parse data
      const { validProducts: parsed, errors } = validateAndParseExcelData(rawData);
      
      setValidProducts(parsed);
      setValidationErrors(errors);

      // Check for duplicate SKUs within the file
      if (parsed.length > 0) {
        const duplicates = findDuplicateSKUs(parsed);
        setDuplicateSKUs(duplicates);

        // Check for existing SKUs in database
        const skus = parsed.map(p => p.sku!);
        const existing = await checkExistingSKUs(skus);
        setExistingSKUs(existing);
      }

      setStep(UploadStep.PREVIEW);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to parse Excel file', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    generateSampleTemplate();
    addToast('Template downloaded successfully!', 'success');
  };

  const handleConfirm = () => {
    if (validProducts.length === 0) {
      addToast('No valid products to import', 'error');
      return;
    }
    setStep(UploadStep.CONFIRM);
  };

  const handleFinalImport = async () => {
    setIsProcessing(true);
    try {
      // Filter out products with duplicate SKUs in the file or existing in DB
      const productsToImport = validProducts.filter(p => 
        !duplicateSKUs.includes(p.sku!.toLowerCase()) && 
        !existingSKUs.includes(p.sku!)
      );

      if (productsToImport.length === 0) {
        addToast('No products to import after removing duplicates', 'error');
        setIsProcessing(false);
        return;
      }

      const result = await addProductsBatch(productsToImport);
      setUploadResult(result);
      setStep(UploadStep.RESULT);

      if (result.summary.successful > 0) {
        onSuccess(result.imported);
        addToast(`Successfully imported ${result.summary.successful} products!`, 'success');
      }
    } catch (error) {
      addToast('Failed to import products', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(UploadStep.SELECT_FILE);
    setSelectedFile(null);
    setValidProducts([]);
    setValidationErrors([]);
    setDuplicateSKUs([]);
    setExistingSKUs([]);
    setUploadResult(null);
    onClose();
  };

  const renderSelectFile = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          Upload Excel File
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload an Excel file (.xlsx) with product data
        </p>
      </div>

      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Excel files only (.xlsx, .xls)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </label>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="secondary"
          onClick={handleDownloadTemplate}
          leftIcon={<Download />}
          size="sm"
        >
          Download Template
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Need help? Download our template
        </p>
      </div>
    </div>
  );

  const renderPreview = () => {
    const hasErrors = validationErrors.length > 0;
    const hasDuplicates = duplicateSKUs.length > 0;
    const hasExisting = existingSKUs.length > 0;

    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Valid Products</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {validProducts.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Errors</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {validationErrors.length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Duplicates</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {duplicateSKUs.length + existingSKUs.length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {hasErrors && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              Validation Errors ({validationErrors.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {validationErrors.slice(0, 10).map((error, idx) => (
                <p key={idx} className="text-xs text-red-700 dark:text-red-400">
                  Row {error.row}: {error.field} - {error.message}
                </p>
              ))}
              {validationErrors.length > 10 && (
                <p className="text-xs text-red-600 dark:text-red-400 italic">
                  ... and {validationErrors.length - 10} more errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Duplicate SKUs in File */}
        {hasDuplicates && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Duplicate SKUs in File ({duplicateSKUs.length})
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              {duplicateSKUs.join(', ')}
            </p>
          </div>
        )}

        {/* Existing SKUs in Database */}
        {hasExisting && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              SKUs Already in Database ({existingSKUs.length})
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              {existingSKUs.join(', ')}
            </p>
          </div>
        )}

        {/* Valid Products Preview Table */}
        {validProducts.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Valid Products Preview
              </h4>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      SKU
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      MRP
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {validProducts.map((product, idx) => {
                    const isDuplicateInFile = duplicateSKUs.includes(product.sku!.toLowerCase());
                    const isExisting = existingSKUs.includes(product.sku!);
                    const statusBadge = isDuplicateInFile || isExisting;

                    return (
                      <tr key={idx} className={statusBadge ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                          {product.sku}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                          {product.name}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                          {product.category}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                          ₹{product.mrp}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {statusBadge ? (
                            <span className="text-xs text-yellow-700 dark:text-yellow-400">
                              {isDuplicateInFile ? 'Duplicate in file' : 'Already exists'}
                            </span>
                          ) : (
                            <span className="text-xs text-green-700 dark:text-green-400">
                              Ready to import
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setStep(UploadStep.SELECT_FILE);
                setSelectedFile(null);
              }}
            >
              Upload Different File
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={validProducts.length === 0 || isProcessing}
            >
              Continue to Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirm = () => {
    const importableCount = validProducts.filter(p => 
      !duplicateSKUs.includes(p.sku!.toLowerCase()) && 
      !existingSKUs.includes(p.sku!)
    ).length;

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
            Confirm Import
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <p>
              <strong>{importableCount}</strong> products will be imported to the database.
            </p>
            {(duplicateSKUs.length + existingSKUs.length) > 0 && (
              <p className="text-yellow-700 dark:text-yellow-400">
                <strong>{duplicateSKUs.length + existingSKUs.length}</strong> products will be 
                skipped (duplicates or already existing).
              </p>
            )}
            {validationErrors.length > 0 && (
              <p className="text-red-700 dark:text-red-400">
                <strong>{validationErrors.length}</strong> rows had validation errors and were not processed.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setStep(UploadStep.PREVIEW)}>
            Go Back
          </Button>
          <Button
            onClick={handleFinalImport}
            disabled={isProcessing || importableCount === 0}
          >
            {isProcessing ? 'Importing...' : 'Confirm & Import'}
          </Button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!uploadResult) return null;

    const { summary } = uploadResult;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Import Complete!
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600 dark:text-green-400">Successfully Imported</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">
              {summary.successful}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Processed</p>
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
              {summary.total}
            </p>
          </div>
        </div>

        {uploadResult.duplicates.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Skipped - Duplicates ({uploadResult.duplicates.length})
            </h4>
            <div className="max-h-32 overflow-y-auto">
              {uploadResult.duplicates.map((dup, idx) => (
                <p key={idx} className="text-xs text-yellow-700 dark:text-yellow-400">
                  {dup.product.sku} - {dup.product.name}
                </p>
              ))}
            </div>
          </div>
        )}

        {uploadResult.failed.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
              Failed ({uploadResult.failed.length})
            </h4>
            <div className="max-h-32 overflow-y-auto">
              {uploadResult.failed.map((fail, idx) => (
                <p key={idx} className="text-xs text-red-700 dark:text-red-400">
                  {fail.product.sku}: {fail.error}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    );
  };

  const getModalTitle = () => {
    switch (step) {
      case UploadStep.SELECT_FILE:
        return 'Bulk Product Upload';
      case UploadStep.PREVIEW:
        return 'Review Products';
      case UploadStep.CONFIRM:
        return 'Confirm Import';
      case UploadStep.RESULT:
        return 'Import Results';
      default:
        return 'Bulk Product Upload';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()} size="large">
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Processing...</p>
          </div>
        </div>
      )}
      
      {step === UploadStep.SELECT_FILE && renderSelectFile()}
      {step === UploadStep.PREVIEW && renderPreview()}
      {step === UploadStep.CONFIRM && renderConfirm()}
      {step === UploadStep.RESULT && renderResult()}
    </Modal>
  );
};

export default BulkUpload;
