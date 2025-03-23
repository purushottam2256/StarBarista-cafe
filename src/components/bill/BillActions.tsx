
import React from 'react';
import { Home, Download, Share2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BillActionsProps {
  onDownload: () => void;
  onShare: () => void;
  onSendEmail: () => void;
  onFinish: () => void;
  isDownloading: boolean;
  isSending: boolean;
}

const BillActions: React.FC<BillActionsProps> = ({
  onDownload,
  onShare,
  onSendEmail,
  onFinish,
  isDownloading,
  isSending
}) => {
  return (
    <>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-1 py-5"
          onClick={onDownload}
          disabled={isDownloading}
        >
          <Download size={20} />
          <span className="text-xs">{isDownloading ? 'Downloading...' : 'Download'}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-1 py-5"
          onClick={onShare}
        >
          <Share2 size={20} />
          <span className="text-xs">Share</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-1 py-5"
          onClick={onSendEmail}
          disabled={isSending}
        >
          <Mail size={20} />
          <span className="text-xs">{isSending ? 'Sending...' : 'Email'}</span>
        </Button>
      </div>
      
      <Button 
        className="w-full bg-cafe hover:bg-cafe-dark py-6"
        onClick={onFinish}
      >
        <Home className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </>
  );
};

export default BillActions;
