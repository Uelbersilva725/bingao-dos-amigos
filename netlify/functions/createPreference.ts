import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

type Body = {
  total: number;
  userId: string;
  bets: number[][];
};

export const handler: Handler = async (event) => {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado' }) };
    }

    const body = JSON.parse(event.body || '{}') as Partial<Body>;
    const total = Number(body.total);
    const userId = String(body.userId || '');
    const bets = Array.isArray(body.bets) ? body.bets : [];

    if (!total || total <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Total inválido' }) };
    }

    // userId precisa ser UUID (string)
    if (!userId || userId.length < 10) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId inválido (UUID)' }) };
    }

    if (!bets.length || !bets.every(b => Array.isArray(b) && b.length === 10)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'bets inválido (precisa ser array de bilhetes com 10 números)' }) };
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: 'Bingão dos Amigos - Bilhetes',
            quantity: 1,
            unit_price: total,
            currency_id: 'BRL',
          },
        ],
        back_urls: {
          success: `${process.env.URL}/payment/success`,
          failure: `${process.env.URL}/payment/failure`,
          pending: `${process.env.URL}/payment/pending`,
        },
        auto_return: 'approved',

        // 🔥 O QUE RESOLVE O PROBLEMA:
        metadata: {
          user_id: userId,
          bets,
        },

        // opcional: melhorar identificação
        external_reference: `user:${userId}`,
        notification_url: `${process.env.URL}/.netlify/functions/mercadoPagoWebhook`,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.id }),
    };
  } catch (error) {
    console.error('Erro createPreference:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao criar preferência' }),
    };
  }
};
