import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { supabase } from './supabaseClient'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export const handler: Handler = async (event) => {
  try {
    console.log('Webhook recebido:', event.body)

    const body = JSON.parse(event.body || '{}')

    if (body.type !== 'payment') {
      return { statusCode: 200, body: 'Ignorado' }
    }

    const paymentId = body.data.id
    const payment = await new Payment(client).get({ id: paymentId })

    if (payment.status !== 'approved') {
      return { statusCode: 200, body: 'Pagamento não aprovado' }
    }

    const { user_id, bets } = payment.metadata as any

    if (!user_id || !Array.isArray(bets)) {
      throw new Error('Metadata inválida')
    }

    const { data: draw } = await supabase
      .from('draws')
      .select('contest_number')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single()

    if (!draw) {
      throw new Error('Nenhum sorteio encontrado')
    }

    const inserts = bets.map((numbers: number[]) => ({
      user_id, // UUID REAL
      contest_number: draw.contest_number,
      numbers,
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
  } catch (error) {
    console.error('ERRO NO WEBHOOK:', error)
    return {
      statusCode: 500,
      body: 'Erro no webhook',
    }
  }
}
