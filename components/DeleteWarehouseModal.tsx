import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { AlertTriangle } from 'lucide-react';

interface DeleteWarehouseModalProps {
  isOpen: boolean;
  warehouseName: string;
  warehouseId: string;
  hasStock: boolean;
  stockDetails?: { sku: string; quantity: number }[];
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const DeleteWarehouseModal: React.FC<DeleteWarehouseModalProps> = ({
  isOpen,
  warehouseName,
  warehouseId,
  hasStock,
  stockDetails = [],
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (hasStock) {
      setError('Cannot delete warehouse with stock. Please transfer or adjust stock first.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for deletion');
      return;
    }

    setIsDeleting(true);
    setError('');
    
    try {
      await onConfirm(reason);
      setReason('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete warehouse');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Warehouse">
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className={`p-4 rounded-lg ${hasStock ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className={`${hasStock ? 'text-red-600' : 'text-yellow-600'} flex-shrink-0 mt-0.5`} size={20} />
            <div className="flex-1">
              <h3 className={`font-semibold ${hasStock ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                {hasStock ? 'Cannot Delete Warehouse' : 'Warning: Permanent Action'}
              </h3>
              <p className={`text-sm mt-1 ${hasStock ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {hasStock
                  ? 'This warehouse currently has stock. You must transfer or adjust all stock before deletion.'
                  : `You are about to permanently delete warehouse "${warehouseName}". This action cannot be undone.`}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Details */}
        {hasStock && stockDetails.length > 0 && (
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Current Stock ({stockDetails.length} SKUs):
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {stockDetails.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300">{item.sku}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{item.quantity} units</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-300">
              <strong>Action Required:</strong> Transfer this stock to another warehouse or create adjustment entries to zero out the stock.
            </div>
          </div>
        )}

        {/* Reason Input */}
        {!hasStock && (
          <div>
            <Input
              label="Reason for Deletion"
              placeholder="e.g., Warehouse closed, location no longer in use"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              disabled={isDeleting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will be logged in the audit trail for compliance.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {!hasStock && (
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isDeleting || !reason.trim()}
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Warehouse
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeleteWarehouseModal;
