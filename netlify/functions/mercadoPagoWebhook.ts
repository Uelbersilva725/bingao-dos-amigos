// netlify/functions/mercadoPagoWebhook.ts
import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')

    if (body.type !== 'payment') {
      return { statusCode: 200, body: 'ignored' }
    }

    const payment = new Payment(mp)
    const result = await payment.get({ id: body.data.id })

    if (result.status !== 'approved') {
      return { statusCode: 200, body: 'not approved' }
    }

    const { user_id, bets } = result.metadata

    if (!user_id || !bets) {
      throw new Error('Metadata incompleta')
    }

    const rows = bets.map((numbers: number[]) => ({
      user_id,
      numbers,
      payment_id: result.id,
      status: 'paid',
    }))

    const { error } = await supabase
      .from('user_bets')
      .insert(rows)

    if (error) {
      console.error(error)
      throw error
    }

    return {
      statusCode: 200,
      body: 'ok',
    }

  } catch (err) {
    console.error('WEBHOOK ERROR:', err)
    return {
      statusCode: 500,
      body: 'error',
    }
  }
}
