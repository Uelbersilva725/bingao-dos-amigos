import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!
})

export const handler: Handler = async (event) => {
  try {
    console.log('Webhook recebido:', event.body)

    const body = JSON.parse(event.body || '{}')

    if (body.type !== 'payment') {
      return { statusCode: 200, body: 'Ignored' }
    }

    const payment = await new Payment(mp).get({ id: body.data.id })

    if (payment.status !== 'approved') {
      return { statusCode: 200, body: 'Not approved' }
    }

    const { user_id, bets } = payment.metadata as {
      user_id: string
      bets: number[][]
    }

    if (!user_id || !bets?.length) {
      throw new Error('Metadata incompleta')
    }

    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('contest_number')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single()

    if (drawError) throw drawError

    const inserts = bets.map(numbers => ({
      user_id,
      contest_number: draw.contest_number,
      numbers
    }))

    const { error } = await supabase
      .from('user_bets')
      .insert(inserts)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    }
  } catch (err) {
    console.error('ERRO NO WEBHOOK:', err)
    return { statusCode: 500, body: 'Webhook error' }
  }
}
