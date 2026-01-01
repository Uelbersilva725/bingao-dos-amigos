import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, LogOut, User, Shield, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  // Não mostrar a navbar na página de dashboard ou admin
  if (location.pathname === '/dashboard' || location.pathname === '/admin') {
    return null;
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to={user ? "/dashboard" : "/"} className="text-xl md:text-2xl font-bold text-green-600">
            BINGÃO DOS AMIGOS
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-green-600"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-6">
              {user ? (
                <>
                  <li>
                    <Link to="/game" className="text-gray-600 hover:text-green-600 transition-colors">
                      Jogar
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                      Minha Conta
                    </Link>
                  </li>
                  {user.isAdmin && (
                    <li>
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/cart" className="relative text-gray-600 hover:text-green-600 transition-colors">
                      <ShoppingCart className="h-6 w-6" />
                      {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {items.length}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <div className="flex items-center mr-4">
                      <User className="h-5 w-5 text-gray-600 mr-1" />
                      <span className="text-sm text-gray-600">{user.name.split(' ')[0]}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-gray-600 hover:text-green-600 transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Cadastrar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4">
            <ul className="space-y-4">
              {user ? (
                <>
                  <li>
                    <Link 
                      to="/game" 
                      className="block text-gray-600 hover:text-green-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Jogar
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/dashboard" 
                      className="block text-gray-600 hover:text-green-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Minha Conta
                    </Link>
                  </li>
                  {user.isAdmin && (
                    <li>
                      <Link 
                        to="/admin" 
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link 
                      to="/cart" 
                      className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Carrinho</span>
                      {items.length > 0 && (
                        <span className="bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {items.length}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="text-sm text-gray-600">{user.name.split(' ')[0]}</span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className="block text-gray-600 hover:text-green-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cadastrar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}