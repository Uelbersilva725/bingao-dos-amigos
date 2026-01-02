import { useCart } from '../contexts/CartContext';

/**
 * Retorna os itens do carrinho no formato esperado
 * para o Mercado Pago / backend
 */
export function getCartItems() {
  const { items, total } = useCart();

  return {
    items,
    total
  };
}
