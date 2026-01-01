import React, { createContext, useContext, useState } from 'react';
import { CartItem, Ticket } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (ticket: Ticket) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
}

// Cria o contexto do carrinho
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Provedor do carrinho de compras
 * Gerencia o estado do carrinho e fornece métodos para manipulação dos itens
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * Adiciona um novo bilhete ao carrinho
   * Gera um ID aleatório para o item
   */
  const addToCart = (ticket: Ticket) => {
    setItems([...items, { id: Math.random().toString(), ticket }]);
  };

  /**
   * Remove um bilhete do carrinho pelo ID
   */
  const removeFromCart = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  /**
   * Limpa todos os itens do carrinho
   */
  const clearCart = () => {
    setItems([]);
  };

  // Calcula o valor total dos itens no carrinho
  const total = items.reduce((sum, item) => sum + item.ticket.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto do carrinho
 * Facilita o acesso aos dados e métodos do carrinho em qualquer componente
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}