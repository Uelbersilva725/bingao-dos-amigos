import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import LotteryGame from './components/LotteryGame';
import Cart from './components/Cart';
import PaymentStatus from './pages/PaymentStatus';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ForgotPassword from './components/ForgotPassword';

/**
 * Componente principal da aplicação
 * Configura as rotas e os provedores de contexto (autenticação e carrinho)
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Redireciona a rota raiz para o dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Rotas públicas */}
                <Route path="/game" element={<LotteryGame />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/payment/:status" element={<PaymentStatus />} />
                
                {/* Rotas protegidas - requerem autenticação */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rota administrativa - requer privilégios de admin */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;