import React, { useState, useEffect, useRef } from 'react';
import { Camera, Keyboard, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

interface EANScannerProps {
  onScan: (ean: string) => void;
  onClose?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

const EANScanner: React.FC<EANScannerProps> = ({ 
  onScan, 
  onClose, 
  autoFocus = true, 
  placeholder = 'Scan or enter EAN/Barcode' 
}) => {
  const [eanInput, setEanInput] = useState('');
  const [scanMode, setScanMode] = useState<'keyboard' | 'camera'>('keyboard');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current && scanMode === 'keyboard') {
      inputRef.current.focus();
    }
  }, [autoFocus, scanMode]);

  // Handle barcode scanner input (keyboard wedge)
  useEffect(() => {
    let buffer = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Barcode scanners typically send data very quickly and end with Enter
      if (e.key === 'Enter' && buffer.length > 0) {
        e.preventDefault();
        const scannedCode = buffer.trim();
        if (scannedCode.length >= 8) { // Minimum EAN length
          setEanInput(scannedCode);
          handleScan(scannedCode);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          buffer = ''; // Clear buffer after 100ms of inactivity
        }, 100);
      }
    };

    if (scanMode === 'keyboard') {
      window.addEventListener('keypress', handleKeyPress);
      return () => {
        window.removeEventListener('keypress', handleKeyPress);
        clearTimeout(timeout);
      };
    }
  }, [scanMode]);

  const handleScan = (code: string) => {
    if (code && code.trim().length > 0) {
      onScan(code.trim());
      setEanInput('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eanInput.trim()) {
      handleScan(eanInput);
    }
  };

  const handleCameraToggle = () => {
    if (isCameraOpen) {
      setIsCameraOpen(false);
    } else {
      setIsCameraOpen(true);
      // Note: Actual camera implementation would use a library like
      // react-webcam or @zxing/browser for QR/barcode scanning
      alert('Camera scanning requires additional library integration.\nFor now, please use keyboard input or manual entry.');
      setIsCameraOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={scanMode === 'keyboard' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setScanMode('keyboard')}
          leftIcon={<Keyboard size={16} />}
        >
          Keyboard
        </Button>
        <Button
          type="button"
          variant={scanMode === 'camera' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setScanMode('camera');
            handleCameraToggle();
          }}
          leftIcon={<Camera size={16} />}
        >
          Camera
        </Button>
      </div>

      {scanMode === 'keyboard' && (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={eanInput}
            onChange={(e) => setEanInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            autoFocus={autoFocus}
          />
          <Button type="submit" disabled={!eanInput.trim()}>
            Scan
          </Button>
        </form>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {scanMode === 'keyboard' ? (
          <p>✓ Use barcode scanner (auto-detects) or type EAN manually</p>
        ) : (
          <p>✓ Camera mode (requires browser permission)</p>
        )}
      </div>

      {/* Camera Modal - placeholder for future implementation */}
      <Modal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        title="Camera Scanner"
      >
        <div className="text-center py-8">
          <Camera size={64} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Camera scanning feature coming soon!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            For now, please use a barcode scanner or manual entry.
          </p>
          <Button onClick={() => setIsCameraOpen(false)} className="mt-4">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EANScanner;
