import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ItemDetail from './pages/ItemDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './state/store';

const App = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/menu" 
          element={user?.role === 'admin' ? <Navigate to="/admin" /> : <Menu />} 
        />
        <Route 
          path="/menu/:id" 
          element={user?.role === 'admin' ? <Navigate to="/admin" /> : <ItemDetail />} 
        />
        <Route 
          path="/cart" 
          element={user?.role === 'admin' ? <Navigate to="/admin" /> : <Cart />} 
        />
        <Route 
          path="/checkout" 
          element={user?.role === 'admin' ? <Navigate to="/admin" /> : <Checkout />} 
        />
        <Route path="/orders" element={<Orders />} />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;

