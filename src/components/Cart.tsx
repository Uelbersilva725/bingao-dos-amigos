import React, { useState, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, AlertCircle } from 'lucide-react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { createPreference } from '../api/mercadoPago';
import { mercadoPagoConfig } from '../config/mercadoPago';

// Initialize Mercado Pago
const isValidConfig = mercadoPagoConfig.publicKey && mercadoPagoConfig.publicKey.startsWith('APP_USR-');
if (!isValidConfig) {
  console.error('Mercado Pago public key is not configured correctly');
} else {
  initMercadoPago(mercadoPagoConfig.publicKey);
}

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const [preferenceId, setPreferenceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initPayment = useCallback(async () => {
    if (items.length === 0 || preferenceId || !isValidConfig) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { id } = await createPreference(total);
      setPreferenceId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar o pagamento';
      setError(`${errorMessage}. Por favor, tente novamente.`);
      console.error('Error initializing payment:', err);
    } finally {
      setLoading(false);
    }
  }, [items.length, total, preferenceId]);

  React.useEffect(() => {
    initPayment();
  }, [initPayment]);

  const handleRetry = useCallback(() => {
    setPreferenceId('');
    setError(null);
    initPayment();
  }, [initPayment]);

  if (items.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
        <p className="text-gray-600">Adicione algumas apostas para continuar</p>
      </div>
    );
  }

  if (!isValidConfig) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 text-center">
          <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-red-500 mx-auto mb-3 md:mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Erro de Configuração</h2>
          <p className="text-red-600 mb-2">O sistema de pagamento não está configurado corretamente.</p>
          <p className="text-sm text-gray-600">Por favor, entre em contato com o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Carrinho de Apostas</h2>
      
      <div className="space-y-3 md:space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm md:text-base">Aposta - R$ {item.ticket.price},00</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Números: {item.ticket.numbers.sort((a, b) => a - b).join(', ')}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 md:mt-6 bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-base md:text-lg">Total:</span>
          <span className="font-bold text-base md:text-lg">R$ {total},00</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 md:p-4 rounded-lg mb-4 text-sm md:text-base">
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 text-sm underline block"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-sm md:text-base text-gray-600">Preparando pagamento...</p>
          </div>
        ) : preferenceId ? (
          <div className="w-full">
            <Wallet 
              initialization={{ preferenceId }}
              onReady={() => {
                console.log('Wallet ready');
                setError(null);
              }}
              onError={(error) => {
                console.error('Wallet error:', error);
                setError('Erro ao carregar opções de pagamento. Tente novamente.');
                setPreferenceId('');
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}