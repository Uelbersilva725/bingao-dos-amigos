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
    console.log('Webhook recebido:', event.body)

    const body = JSON.parse(event.body || '{}')

    if (body.type !== 'payment') {
      return { statusCode: 200, body: 'Ignored' }
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      throw new Error('Payment ID ausente')
    }

    const payment = new Payment(mp)
    const paymentData = await payment.get({ id: paymentId })

    if (paymentData.status !== 'approved') {
      console.log('Pagamento não aprovado:', paymentData.status)
      return { statusCode: 200, body: 'Not approved' }
    }

    const { user_id, bets } = paymentData.metadata || {}

    if (!user_id || !bets) {
      throw new Error('Metadata ausente no pagamento')
    }

    const inserts = bets.map((numbers: number[]) => ({
      user_id,
      numbers,
      payment_id: paymentId,
      status: 'paid',
    }))

    const { error } = await supabase
      .from('user_bets')
      .insert(inserts)

    if (error) {
      throw error
    }

    console.log('Apostas salvas com sucesso')

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    }
  } catch (err) {
    console.error('ERRO NO WEBHOOK:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook error' }),
    }
  }
}
