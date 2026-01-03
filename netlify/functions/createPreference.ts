import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const body = JSON.parse(event.body || '{}')
    const { total, user_id, bets } = body

    if (!total || !user_id || !bets || !Array.isArray(bets)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Payload inválido' }),
      }
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: [
          {
            title: 'Bingão dos Amigos - Aposta',
            quantity: 1,
            unit_price: Number(total),
            currency_id: 'BRL',
          },
        ],
        metadata: {
          user_id,
          bets,
        },
        notification_url:
          'https://bingaodosamigos.netlify.app/.netlify/functions/mercadoPagoWebhook',
        back_urls: {
          success: `${process.env.URL}/payment/success`,
          failure: `${process.env.URL}/payment/failure`,
          pending: `${process.env.URL}/payment/pending`,
        },
        auto_return: 'approved',
      },
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.id }),
    }
  } catch (error) {
    console.error('Erro createPreference:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao criar preferência' }),
    }
  }
}
