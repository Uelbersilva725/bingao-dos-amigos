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

    const { user_id, bets } = payment.metadata as any

    if (!user_id || !Array.isArray(bets)) {
      throw new Error('Metadata incompleta')
    }

    // Buscar último concurso
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('contest_number')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single()

    if (drawError || !draw) {
      throw new Error('Concurso não encontrado')
    }

    const inserts = bets.map((numbers: number[]) => ({
      user_id,
      contest_number: draw.contest_number,
      numbers,
      payment_id: payment.id,
    }))

    const { error: insertError } = await supabase
      .from('user_bets')
      .insert(inserts)

    if (insertError) {
      throw insertError
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return {
      statusCode: 500,
      body: 'Webhook error',
    }
  }
}
