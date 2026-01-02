import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, AlertCircle } from 'lucide-react';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { createPreference } from '../api/mercadoPago';

// ⚠️ PUBLIC KEY (somente a public key, nunca access token)
initMercadoPago(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY);

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();

  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cria preferência no backend
  useEffect(() => {
    if (items.length === 0) return;

    async function startPayment() {
      try {
        setLoading(true);
        setError(null);

        const { id } = await createPreference(total);
        setPreferenceId(id);
      } catch (err) {
        console.error(err);
        setError('Erro ao iniciar pagamento. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    startPayment();
  }, [items.length, total]);

  if (items.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <h2 className="text-xl font-bold mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-600">Adicione apostas para continuar</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Carrinho de Apostas</h2>

      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-4 flex justify-between"
          >
            <div>
              <p className="font-medium">
                Bilhete — R$ {item.ticket.price},00
              </p>
              <p className="text-sm text-gray-600">
                Números: {item.ticket.numbers.sort((a, b) => a - b).join(', ')}
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-4">
          <span className="font-bold">Total</span>
          <span className="font-bold">R$ {total},00</span>
        </div>

        {loading && (
          <p className="text-center text-gray-600">
            Preparando pagamento...
          </p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded flex items-center gap-2">
            <AlertCircle />
            {error}
          </div>
        )}

        {!loading && preferenceId && (
          <Wallet
            initialization={{ preferenceId }}
            onReady={() => console.log('Mercado Pago pronto')}
            onError={(err) => {
              console.error(err);
              setError('Erro ao carregar pagamento');
            }}
          />
        )}
      </div>
    </div>
  );
}
