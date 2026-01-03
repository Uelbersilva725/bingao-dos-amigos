import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { supabase } from './supabaseClient'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')

    if (body.type !== 'payment') {
      return { statusCode: 200, body: 'Ignored' }
    }

    const paymentId = body.data.id
    const payment = await new Payment(client).get({ id: paymentId })

    if (payment.status !== 'approved') {
      return { statusCode: 200, body: 'Payment not approved' }
    }

    const { user_id, bets } = payment.metadata || {}

    if (!user_id || !bets) {
      throw new Error('Metadata incompleta')
    }

    const { data: draw } = await supabase
      .from('draws')
      .select('contest_number')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single()

    const inserts = bets.map((numbers: number[]) => ({
      user_id,
      contest_number: draw.contest_number,
      numbers,
    }))

    await supabase.from('user_bets').insert(inserts)

    return { statusCode: 200, body: 'OK' }

  } catch (error) {
    console.error('WEBHOOK ERROR:', error)
    return { statusCode: 500, body: 'Webhook error' }
  }
}
