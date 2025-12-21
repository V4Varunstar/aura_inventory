import React, { useState, useEffect } from 'react';
import { Attachment, InwardStockFormData } from '../types';

export const InwardStockForm: React.FC = () => {
  const [formData, setFormData] = useState<InwardStockFormData>({
    sourceType: 'Factory Direct',
    reference: '',
    productSearch: '',
    batchId: 'BATCH-00X',
    quantity: 0,
    costPrice: 0.00,
    mfgDate: '',
    expiryDate: '',
    notes: ''
  });

  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: '1', name: 'Invoice_INV2023.pdf', size: '2.4 MB', type: 'pdf' }
  ]);

  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const qty = Number(formData.quantity) || 0;
    const price = Number(formData.costPrice) || 0;
    setTotalValue(qty * price);
  }, [formData.quantity, formData.costPrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex mb-6">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white" href="#">
                Dashboard
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">Inventory</span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                <span className="ml-1 text-sm font-medium text-primary dark:text-indigo-400 md:ml-2">Record Inward</span>
              </div>
            </li>
          </ol>
        </nav>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* Source Information Card */}
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-border-dark overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-surface-highlight/20">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Source Information</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Where is this stock coming from?</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">local_shipping</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="sourceType">Source Type</label>
                <div className="relative">
                  <select 
                    id="sourceType" 
                    name="sourceType"
                    value={formData.sourceType}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                  >
                    <option>Factory Direct</option>
                    <option>Amazon Return</option>
                    <option>Vendor Supply</option>
                    <option>Inter-Warehouse Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="reference">Reference / Invoice #</label>
                <input 
                  id="reference" 
                  name="reference" 
                  value={formData.reference}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="e.g. INV-2023-001"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Product Details Card */}
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-border-dark overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-surface-highlight/20">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Product Details</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Identify the product and quantity.</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">inventory</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="productSearch">Product</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                  </div>
                  <input 
                    id="productSearch"
                    name="productSearch"
                    value={formData.productSearch}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Search by SKU or Product Name..."
                    className="block w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="batchId">Batch ID</label>
                <div className="relative">
                  <input 
                    id="batchId"
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="BATCH-00X"
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="quantity">Quantity</label>
                <input 
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="0"
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="costPrice">Cost Price (Per Unit)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input 
                    id="costPrice"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 pl-7 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Total Value</label>
                <div className="py-2.5 px-3 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-semibold">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Validity Dates Card */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-border-dark overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-surface-highlight/20">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Validity Dates</h3>
                <span className="material-symbols-outlined text-gray-400">calendar_month</span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="mfgDate">Manufacturing Date</label>
                  <input 
                    id="mfgDate" 
                    name="mfgDate"
                    value={formData.mfgDate}
                    onChange={handleInputChange}
                    type="date" 
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2" htmlFor="expiryDate">
                    Expiry Date
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30">Auto</span>
                  </label>
                  <input 
                    id="expiryDate" 
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    type="date" 
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="notes">Notes / Remarks</label>
                  <textarea 
                    id="notes" 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any additional information about the condition..."
                    className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-highlight text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm py-2"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-border-dark overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark flex items-center justify-between bg-gray-50/50 dark:bg-surface-highlight/20">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Attachments</h3>
                <span className="material-symbols-outlined text-gray-400">attach_file</span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-6 py-10 hover:bg-gray-50 dark:hover:bg-surface-highlight/50 transition-colors cursor-pointer group">
                  <div className="text-center">
                    <span className="material-symbols-outlined mx-auto h-12 w-12 text-gray-300 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors text-[48px]">cloud_upload</span>
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary dark:text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-hover">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-500 dark:text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {attachments.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-highlight/30 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-400">picture_as_pdf</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(file.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-4 pb-12">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-surface-highlight hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium shadow-md shadow-primary/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Confirm Inward
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};