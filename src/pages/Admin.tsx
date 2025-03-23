import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ShieldAlert, Coffee, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import PageTransition from '@/components/PageTransition';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema with stronger password requirements
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Rate limiting settings
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 10 * 60 * 1000; // 10 minutes

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  
  // Define form with validation
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Check if redirected from a protected route or load stored lockout state
  useEffect(() => {
    // Extract redirected state if it exists
    const fromProtected = location.state?.fromProtected;
    
    if (fromProtected) {
      setRedirectMessage('Authentication required to access the admin dashboard');
      
      // Clear admin status to force re-authentication
      localStorage.removeItem('isAdmin');
    }
    
    // Load stored login attempts and lockout time
    const storedAttempts = sessionStorage.getItem('loginAttempts');
    const storedLockout = sessionStorage.getItem('lockoutUntil');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout);
      if (lockoutTime > Date.now()) {
        setLockoutUntil(lockoutTime);
      } else {
        // Clear expired lockout
        sessionStorage.removeItem('lockoutUntil');
        sessionStorage.removeItem('loginAttempts');
      }
    }
  }, [location]);
  
  // Handle login attempts and rate limiting
  const updateLoginAttempts = (success: boolean) => {
    if (success) {
      // Reset on successful login
      setLoginAttempts(0);
      sessionStorage.removeItem('loginAttempts');
      sessionStorage.removeItem('lockoutUntil');
      return true;
    } else {
      // Increment attempts on failure
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      sessionStorage.setItem('loginAttempts', newAttempts.toString());
      
      // Check if max attempts reached
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_TIME;
        setLockoutUntil(lockoutTime);
        sessionStorage.setItem('lockoutUntil', lockoutTime.toString());
        toast.error(`Too many login attempts. Please try again in 10 minutes.`);
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
        toast.error(`Invalid admin credentials. ${remaining} attempts remaining.`);
      }
      return false;
    }
  };
  
  // Calculate remaining lockout time
  const getRemainingLockoutTime = (): string => {
    if (!lockoutUntil) return '';
    
    const remainingMs = lockoutUntil - Date.now();
    if (remainingMs <= 0) return '';
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };
  
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    // Check for lockout
    if (lockoutUntil && lockoutUntil > Date.now()) {
      toast.error(`Account locked. Try again in ${getRemainingLockoutTime()}`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check for admin credentials with new secure password
      if (values.username !== 'admin' || values.password !== 'barista@4444') {
        setIsLoading(false);
        updateLoginAttempts(false);
        return;
      }
      
      // Update login attempts counter
      updateLoginAttempts(true);
      
      // Simply store admin status without session timeout info
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminSecurityKey', 'barista-secured-dashboard-key');

      toast.success('Login successful');
      navigate('/admin/dashboard1');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      updateLoginAttempts(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-cafe-bg">
      <div className="container grid min-h-screen max-w-md place-items-center p-4">
        <motion.div 
          className="cafe-card w-full max-w-sm p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6 flex justify-center">
            <Logo size="md" />
          </div>
          
          <h1 className="mb-2 text-center text-2xl font-bold text-cafe-dark">Admin Login</h1>
          <p className="mb-6 text-center text-sm text-cafe-text/60">
            Enter credentials to access the admin panel
          </p>
          
          {redirectMessage && (
            <motion.div 
              className="mb-4 rounded-md bg-yellow-50 p-3 text-center text-sm text-yellow-800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertTriangle className="mx-auto mb-1 h-5 w-5" />
              {redirectMessage}
            </motion.div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-cafe-text/40" />
                      <FormControl>
                        <Input 
                          placeholder="Username" 
                          className="pl-10" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-cafe-text/40" />
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Password" 
                          className="pl-10" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-cafe hover:bg-cafe-dark"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
                <ShieldAlert className="ml-2" size={16} />
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 flex justify-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-cafe-text/70 hover:text-cafe"
            >
              <Coffee className="mr-2" size={16} />
              Back to Cafe
            </Button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Admin;
