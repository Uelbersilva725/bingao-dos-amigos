import { Handler } from '@netlify/functions'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado')
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados')
    }
    if (!process.env.URL) {
      throw new Error('URL do Netlify não configurada')
    }

    const body = JSON.parse(event.body || '{}')

    const total = Number(body.total)
    const numbers: number[] = Array.isArray(body.numbers) ? body.numbers.map(Number) : []
    const userId: string = String(body.userId || '')

    if (!total || total <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Total inválido' }) }
    }
    if (!numbers || numbers.length !== 10 || numbers.some((n) => !Number.isInteger(n) || n < 1 || n > 80)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Números inválidos (precisa 10 de 1 a 80)' }) }
    }
    if (!isUuid(userId)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId inválido (uuid)' }) }
    }

    // 1) cria aposta pending no banco
    const { data: bet, error: betErr } = await supabaseAdmin
      .from('user_bets')
      .insert({
        user_id: userId,
        numbers,
        total,
        status: 'pending',
      })
      .select('id')
      .single()

    if (betErr || !bet?.id) {
      console.error('Erro inserindo user_bets:', betErr)
      return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao salvar aposta (pending)' }) }
    }

    const betId = bet.id as string

    // 2) cria preferência no Mercado Pago
    const preference = new Preference(mp)
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

        // CHAVE do fluxo: webhook consegue identificar a aposta
        external_reference: betId,

        back_urls: {
          success: `${process.env.URL}/payment/success?bet=${betId}`,
          failure: `${process.env.URL}/payment/failure?bet=${betId}`,
          pending: `${process.env.URL}/payment/pending?bet=${betId}`,
        },
        auto_return: 'approved',

        // webhook da Netlify function
        notification_url: `${process.env.URL}/.netlify/functions/mercadoPagoWebhook`,
      },
    })

    // 3) salva preference_id e init_point na aposta
    await supabaseAdmin
      .from('user_bets')
      .update({
        preference_id: result.id ?? null,
        init_point: (result as any).init_point ?? null,
      })
      .eq('id', betId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        betId,
        preferenceId: result.id,
        init_point: (result as any).init_point,
      }),
    }
  } catch (error) {
    console.error('Erro createPreference:', error)
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao criar preferência' }) }
  }
}
