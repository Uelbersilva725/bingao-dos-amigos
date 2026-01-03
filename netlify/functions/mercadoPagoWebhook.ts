import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function mpFetch(path: string) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })
  const text = await res.text()
  let json: any = null
  try { json = JSON.parse(text) } catch {}
  return { ok: res.ok, status: res.status, json, text }
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const raw = event.body || '{}'
    let payload: any = {}
    try { payload = JSON.parse(raw) } catch {}

    console.log('Webhook recebido:', raw)

    const topic = payload?.topic || payload?.type
    const resource = payload?.resource
    const dataId = payload?.data?.id

    // Se for merchant_order, buscamos o merchant order e pegamos o payment
    if (topic === 'merchant_order') {
      const merchantOrderId = resource?.toString().split('/').pop()
      if (!merchantOrderId) return { statusCode: 200, body: 'ok' }

      const mo = await mpFetch(`/merchant_orders/${merchantOrderId}`)
      if (!mo.ok) {
        console.error('Erro buscando merchant_order:', mo.status, mo.text)
        return { statusCode: 200, body: 'ok' }
      }

      const payments = mo.json?.payments || []
      const approvedPayment = payments.find((p: any) => p.status === 'approved') || payments[0]
      const paymentId = approvedPayment?.id
      if (!paymentId) return { statusCode: 200, body: 'ok' }

      const pay = await mpFetch(`/v1/payments/${paymentId}`)
      if (!pay.ok) {
        console.error('Erro buscando payment:', pay.status, pay.text)
        return { statusCode: 200, body: 'ok' }
      }

      const status = pay.json?.status
      const betId = pay.json?.external_reference
      const mpPaymentId = pay.json?.id
      const mpMerchantOrderId = Number(merchantOrderId)

      if (!betId) {
        console.error('Payment sem external_reference (betId).')
        return { statusCode: 200, body: 'ok' }
      }

      if (status === 'approved') {
        const { error } = await supabaseAdmin
          .from('user_bets')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            payment_id: mpPaymentId,
            merchant_order_id: mpMerchantOrderId,
          })
          .eq('id', betId)

        if (error) console.error('ERRO NO WEBHOOK (update bet):', error)
      }

      return { statusCode: 200, body: 'ok' }
    }

    // Se for payment, buscamos o payment direto
    if (topic === 'payment' || topic === 'payment.updated') {
      const paymentId = dataId || resource?.toString().split('/').pop()
      if (!paymentId) return { statusCode: 200, body: 'ok' }

      const pay = await mpFetch(`/v1/payments/${paymentId}`)
      if (!pay.ok) {
        console.error('Erro buscando payment:', pay.status, pay.text)
        return { statusCode: 200, body: 'ok' }
      }

      const status = pay.json?.status
      const betId = pay.json?.external_reference

      if (!betId) {
        console.error('Payment sem external_reference (betId).')
        return { statusCode: 200, body: 'ok' }
      }

      if (status === 'approved') {
        const { error } = await supabaseAdmin
          .from('user_bets')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            payment_id: pay.json?.id,
            merchant_order_id: pay.json?.order?.id ?? null,
          })
          .eq('id', betId)

        if (error) console.error('ERRO NO WEBHOOK (update bet):', error)
      }

      return { statusCode: 200, body: 'ok' }
    }

    return { statusCode: 200, body: 'ok' }
  } catch (err) {
    console.error('WEBHOOK ERROR:', err)
    // Mercado Pago precisa receber 200 mesmo em erro, senão ele re-tenta e vira bagunça
    return { statusCode: 200, body: 'ok' }
  }
}
