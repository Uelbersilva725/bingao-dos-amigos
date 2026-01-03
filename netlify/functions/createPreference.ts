// netlify/functions/createPreference.ts
import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export const handler: Handler = async (event) => {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('Access token não configurado')
    }

    const body = JSON.parse(event.body || '{}')
    const { total, user_id, bets } = body

    if (!total || total <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Total inválido' }),
      }
    }

    if (!user_id || !Array.isArray(bets) || bets.length === 0) {
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
    console.error('createPreference ERROR:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno' }),
    }
  }
}
