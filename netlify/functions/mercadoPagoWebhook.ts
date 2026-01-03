import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! //⚠️ OBRIGATÓRIO
)

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')

    if (body.type !== 'payment') {
      return { statusCode: 200, body: 'ignored' }
    }

    const paymentId = body.data.id

    const payment = new Payment(mp)
    const result = await payment.get({ id: paymentId })

    if (result.status !== 'approved') {
      return { statusCode: 200, body: 'payment not approved' }
    }

    const metadata = result.metadata

    if (!metadata?.user_id || !metadata?.numbers || !metadata?.amount) {
      throw new Error('Metadata incompleta')
    }

    const { error } = await supabase.from('user_bets').insert({
      user_id: metadata.user_id,
      numbers: metadata.numbers,
      amount: metadata.amount,
      status: 'paid',
      payment_id: String(paymentId),
      preference_id: result.preference_id,
    })

    if (error) throw error

    return {
      statusCode: 200,
      body: 'saved',
    }
  } catch (err) {
    console.error('Webhook error:', err)
    return {
      statusCode: 500,
      body: 'error',
    }
  }
}
