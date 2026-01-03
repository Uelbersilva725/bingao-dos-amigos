import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const { total, userId, bets } = body

    if (!total || !userId || !Array.isArray(bets)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados inválidos' }),
      }
    }

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: [
          {
            title: 'Bingão dos Amigos - Apostas',
            quantity: 1,
            unit_price: total,
            currency_id: 'BRL',
          },
        ],

        // 👇 ESSENCIAL
        external_reference: userId,
        metadata: {
          user_id: userId,
          bets,
        },

        notification_url: `${process.env.URL}/.netlify/functions/mercadoPagoWebhook`,
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
      body: JSON.stringify({ error: 'Erro interno' }),
    }
  }
}
