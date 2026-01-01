import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!
});

export const handler: Handler = async (event) => {
  const { total, userId, bets } = JSON.parse(event.body || '{}');

  if (!total || !userId || !bets) {
    return { statusCode: 400, body: 'Invalid payload' };
  }

  const preference = await new Preference(client).create({
    body: {
      items: [
        {
          title: 'Apostas Bingão dos Amigos',
          quantity: 1,
          unit_price: total
        }
      ],
      metadata: {
        user_id: userId,
        bets
      },
      notification_url: `${process.env.URL}/.netlify/functions/mercadoPagoWebhook`
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ id: preference.id })
  };
};
