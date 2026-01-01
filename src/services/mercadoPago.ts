import { mercadoPagoConfig } from '../config/mercadoPago';

interface PreferenceRequest {
  items: {
    title: string;
    quantity: number;
    unit_price: number;
  }[];
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
}

export async function createPaymentPreference(amount: number): Promise<{ id: string }> {
  const accessToken = mercadoPagoConfig.accessToken?.trim();
  
  if (!accessToken) {
    throw new Error('Mercado Pago access token is not configured');
  }

  try {
    const preference: PreferenceRequest = {
      items: [
        {
          title: 'Bingão dos Amigos - Apostas',
          quantity: 1,
          unit_price: amount
        }
      ],
      back_urls: {
        success: `${window.location.origin}/payment/success`,
        failure: `${window.location.origin}/payment/failure`,
        pending: `${window.location.origin}/payment/pending`
      },
      auto_return: 'approved'
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Failed to create payment preference';
      throw new Error(errorMessage);
    }

    if (!data.id) {
      throw new Error('Invalid response from Mercado Pago');
    }

    return { id: data.id };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating preference:', error.message);
      throw new Error(`Erro de integração com Mercado Pago: ${error.message}`);
    } else {
      console.error('Error creating preference:', error);
      throw new Error('Erro inesperado ao criar preferência de pagamento');
    }
  }
}