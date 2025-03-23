import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Bill from './pages/Bill';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import Waiting from './pages/Waiting';
import AuthGuard from './components/AuthGuard';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/bill" element={<Bill />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/waiting" element={<Waiting />} /> 
          <Route path="/admin/dashboard1" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </Router>
    </CartProvider>
  );
}

export default App;
