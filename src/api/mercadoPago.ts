import axios from 'axios';
import { mercadoPagoConfig } from '../config/mercadoPago';
import { getCurrentUser } from '../utils/getCurrentUser'; 
import { getCurrentDraw } from '../utils/getCurrentDraw';
import { getCartItems } from '../utils/getCartItems';

/**
 * Cria uma preferência no Mercado Pago
 * IMPORTANTE:
 * - external_reference = user_id
 * - metadata = dados que o webhook vai usar
 */
export async function createPreference(total: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const currentDraw = await getCurrentDraw();
    if (!currentDraw) {
      throw new Error('Nenhum sorteio ativo');
    }

    const cartItems = getCartItems();
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Carrinho vazio');
    }

    const preference = {
      items: cartItems.map((item: any, index: number) => ({
        id: `bilhete-${index + 1}`,
        title: 'Bilhete Bingão dos Amigos',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: item.ticket.price
      })),

      payer: {
        email: user.email
      },

      external_reference: String(user.id), // 🔑 CRÍTICO

      metadata: {
        draw_id: currentDraw.id,
        tickets: cartItems.map((item: any) => ({
          numbers: item.ticket.numbers,
          price: item.ticket.price
        }))
      },

      notification_url:
        'https://SEUSITE.netlify.app/.netlify/functions/mercadoPagoWebhook',

      back_urls: {
        success: 'https://SEUSITE.netlify.app/payment/success',
        failure: 'https://SEUSITE.netlify.app/payment/failure',
        pending: 'https://SEUSITE.netlify.app/payment/pending'
      },

      auto_return: 'approved'
    };

    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preference,
      {
        headers: {
          Authorization: `Bearer ${mercadoPagoConfig.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar preferência:', error?.response?.data || error);
    throw new Error('Erro ao iniciar pagamento');
  }
}
