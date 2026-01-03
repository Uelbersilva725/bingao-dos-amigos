import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Wallet } from '@mercadopago/sdk-react';
import { createPreference } from '../api/mercadoPago';

export default function Cart() {
  const { items, total, removeFromCart } = useCart();
  const { user } = useAuth();

  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initPayment() {
      if (!user || items.length === 0) return;

      try {
        setLoading(true);
        setError(null);

        const response = await createPreference({
          total,
          userId: user.id, // ✅ UUID REAL
          bets: items.map(item => item.ticket.numbers),
        });

        setPreferenceId(response.id);
      } catch (err: any) {
        setError(err.message || 'Erro ao iniciar pagamento');
      } finally {
        setLoading(false);
      }
    }

    initPayment();
  }, [items, total, user]);

  if (!user) {
    return <p className="text-center">Faça login para continuar</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Carrinho de Apostas</h2>

      {items.map(item => (
        <div key={item.id} className="border p-3 rounded mb-2">
          <p>Números: {item.ticket.numbers.join(', ')}</p>
          <button
            className="text-red-500 text-sm"
            onClick={() => removeFromCart(item.id)}
          >
            Remover
          </button>
        </div>
      ))}

      <p className="font-bold mt-4">Total: R$ {total},00</p>

      {loading && <p>Preparando pagamento...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {preferenceId && (
        <Wallet initialization={{ preferenceId }} />
      )}
    </div>
  );
}
