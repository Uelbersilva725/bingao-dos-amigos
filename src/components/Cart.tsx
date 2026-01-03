import React, { useState, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, AlertCircle } from 'lucide-react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { createPreference } from '../api/mercadoPago';
import { mercadoPagoConfig } from '../config/mercadoPago';

// Inicializa Mercado Pago
const isValidConfig =
  mercadoPagoConfig.publicKey &&
  mercadoPagoConfig.publicKey.startsWith('APP_USR-');

if (isValidConfig) {
  initMercadoPago(mercadoPagoConfig.publicKey);
}

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();

  const [preferenceId, setPreferenceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initPayment = useCallback(async () => {
    if (!user || items.length === 0 || preferenceId || !isValidConfig) return;

    try {
      setLoading(true);
      setError(null);

      const bets = items.map(item => item.ticket.numbers);

      const { id } = await createPreference({
        total,
        user_id: user.id,
        bets,
      });

      setPreferenceId(id);
    } catch (err) {
      console.error(err);
      setError('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [items, total, user, preferenceId]);

  React.useEffect(() => {
    initPayment();
  }, [initPayment]);

  if (!isValidConfig) {
    return (
      <div className="text-center text-red-600">
        Sistema de pagamento não configurado corretamente.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Carrinho de Apostas</h2>

      {items.map(item => (
        <div key={item.id} className="bg-white p-4 mb-3 rounded shadow">
          <div className="flex justify-between">
            <span>
              Aposta – R$ {item.ticket.price},00
            </span>
            <button onClick={() => removeFromCart(item.id)}>
              <Trash2 className="text-red-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Números: {item.ticket.numbers.join(', ')}
          </p>
        </div>
      ))}

      <div className="bg-white p-4 rounded shadow mt-4">
        <div className="flex justify-between mb-4">
          <strong>Total</strong>
          <strong>R$ {total},00</strong>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-3">
            <AlertCircle className="inline mr-2" />
            {error}
          </div>
        )}

        {loading && <p>Preparando pagamento…</p>}

        {preferenceId && (
          <Wallet initialization={{ preferenceId }} />
        )}
      </div>
    </div>
  );
}
