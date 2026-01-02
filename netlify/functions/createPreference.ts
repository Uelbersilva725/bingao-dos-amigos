import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const total = body.total;

    if (!total || typeof total !== 'number') {
      console.error('Payload inválido recebido:', body);
      return {
        statusCode: 400,
        body: 'Invalid payload',
      };
    }

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: 'Bilhete - Bingão dos Amigos',
            quantity: 1,
            unit_price: total,
          },
        ],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: response.id }),
    };
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return {
      statusCode: 500,
      body: 'Erro ao criar preferência',
    };
  }
};
