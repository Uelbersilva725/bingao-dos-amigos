import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2 } from 'lucide-react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { mercadoPagoConfig } from '../config/mercadoPago';
import { createPreference } from '../api/mercadoPago';

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 🔹 Inicializa o Mercado Pago corretamente
   */
  useEffect(() => {
    if (!mercadoPagoConfig.publicKey) {
      console.error('❌ Mercado Pago PUBLIC KEY não configurada');
      return;
    }

    initMercadoPago(mercadoPagoConfig.publicKey, {
      locale: 'pt-BR',
    });

    console.log('✅ Mercado Pago inicializado com sucesso');
  }, []);

  /**
   * 🔹 Cria preferência de pagamento
   */
  const handleCheckout = async () => {
    try {
      setLoading(true);
      const response = await createPreference(total);
      setPreferenceId(response.id);
    } catch (error) {
      console.error('Erro ao iniciar pagamento:', error);
      alert('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <h2 className="text-xl font-bold mb-4">Seu carrinho está vazio</h2>
        <p className="text-gray-600">Adicione apostas para continuar</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Carrinho de Apostas</h2>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  Aposta – R$ {item.ticket.price},00
                </p>
                <p className="text-sm text-gray-600">
                  Números:{' '}
                  {item.ticket.numbers.sort((a, b) => a - b).join(', ')}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between mb-4">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg">R$ {total},00</span>
        </div>

        {!preferenceId ? (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Finalizar Pagamento'}
          </button>
        ) : (
          <Wallet
            initialization={{ preferenceId }}
            onSubmit={() => {
              clearCart();
            }}
          />
        )}
      </div>
    </div>
  );
}
