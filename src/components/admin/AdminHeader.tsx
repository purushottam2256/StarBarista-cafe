import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  // Updated logout handler to remove both authentication items
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSecurityKey');
    toast.info('Logged out successfully');
    navigate('/admin');
  };

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
            <div className="rounded-full bg-cafe/10 px-3 py-1">
              <span className="flex items-center text-xs font-medium text-cafe">
                <ShieldCheck size={14} className="mr-1" />
                Admin Panel
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/menu')}
              className="text-cafe-text/70 hover:text-cafe"
            >
              <Coffee size={16} className="mr-1" />
              View Menu
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-cafe-text/70 hover:text-cafe"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;