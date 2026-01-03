import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const total = Number(body.total)
    const user_id = body.user_id
    const bets = body.bets

    if (!total || !user_id || !bets) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados incompletos' }),
      }
    }

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: [
          {
            title: 'Bingão dos Amigos - Aposta',
            quantity: 1,
            unit_price: total,
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
