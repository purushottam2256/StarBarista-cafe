
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { Scan, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const qrConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1,
};

type QrScannerProps = {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
};

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    
    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('qr-reader');
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id;
          await html5QrCode.start(
            cameraId,
            qrConfig,
            (decodedText) => {
              onScanSuccess(decodedText);
              html5QrCode.stop();
              onClose();
            },
            (errorMessage) => {
              console.log(errorMessage);
            }
          );
          setIsScanning(true);
          setScannerInitialized(true);
        } else {
          setError('No camera found');
        }
      } catch (err) {
        setError('Failed to access camera: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    
    startScanner();
    
    return () => {
      if (html5QrCode && scannerInitialized) {
        html5QrCode.stop().catch(error => console.error('Error stopping scanner:', error));
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
        
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-cafe/10">
            <Scan className="text-cafe" size={24} />
          </div>
          <h3 className="text-xl font-semibold">Scan QR Code</h3>
          <p className="text-sm text-gray-500">Position the QR code within the frame</p>
        </div>
        
        {error ? (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        ) : (
          <div className="relative">
            <div id="qr-reader" className="overflow-hidden rounded-lg" style={{ width: '100%', height: '300px' }}></div>
            <motion.div 
              className="absolute inset-0 pointer-events-none border-2 border-cafe"
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mr-2"
          >
            Cancel
          </Button>
          {error && (
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QrScanner;
