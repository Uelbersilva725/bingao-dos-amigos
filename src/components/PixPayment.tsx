import React, { useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { createPaymentPreference } from '../services/mercadoPago';
import { mercadoPagoConfig } from '../config/mercadoPago';

// Initialize Mercado Pago
initMercadoPago(mercadoPagoConfig.publicKey);

interface PixPaymentProps {
  amount: number;
  onPaymentComplete: () => void;
}

export default function PixPayment({ amount, onPaymentComplete }: PixPaymentProps) {
  const [preferenceId, setPreferenceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const initPayment = async () => {
      try {
        setLoading(true);
        const { id } = await createPaymentPreference(amount);
        setPreferenceId(id);
      } catch (err) {
        setError('Erro ao iniciar o pagamento. Por favor, tente novamente.');
        console.error('Error initializing payment:', err);
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [amount]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Preparando pagamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Pagamento via Mercado Pago</h3>
        <p className="text-gray-600">Valor total: R$ {amount.toFixed(2)}</p>
      </div>

      {preferenceId && (
        <div className="w-full">
          <Wallet 
            initialization={{ preferenceId }}
            onReady={() => console.log('Wallet ready')}
            onError={(error) => {
              console.error('Wallet error:', error);
              setError('Erro ao carregar opções de pagamento');
            }}
            onSubmit={() => console.log('Payment submitted')}
          />
        </div>
      )}
    </div>
  );
}