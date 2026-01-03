import { Handler } from '@netlify/functions';
import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';
import { supabase } from './supabaseClient';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

async function processPayment(paymentId: number) {
  const payment = await new Payment(client).get({ id: paymentId });

  if (payment.status !== 'approved') {
    return { ok: true, reason: 'not_approved' };
  }

  const md: any = payment.metadata || {};
  const user_id = String(md.user_id || '');
  const bets = md.bets;

  if (!user_id || user_id.length < 10) {
    throw new Error(`metadata.user_id inválido: "${user_id}"`);
  }
  if (!Array.isArray(bets) || !bets.length) {
    throw new Error(`metadata.bets inválido`);
  }

  // pega o último concurso
  const { data: draw, error: drawErr } = await supabase
    .from('draws')
    .select('contest_number')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single();

  if (drawErr || !draw) {
    throw new Error(`Não encontrou draw atual: ${drawErr?.message || 'sem dados'}`);
  }

  const inserts = bets.map((numbers: number[]) => ({
    user_id,
    contest_number: draw.contest_number,
    numbers,
  }));

  const { error: insErr } = await supabase.from('user_bets').insert(inserts);
  if (insErr) throw new Error(`Erro insert user_bets: ${insErr.message}`);

  return { ok: true, reason: 'saved' };
}

export const handler: Handler = async (event) => {
  try {
    const raw = event.body || '{}';
    const body = JSON.parse(raw);

    console.log('Webhook recebido:', raw);

    // Mercado Pago pode mandar:
    // - type: "payment" com data.id
    // - topic: "merchant_order" com resource/merchant order
    const type = body.type || body.topic;

    if (type === 'payment') {
      const paymentId = Number(body.data?.id);
      if (!paymentId) return { statusCode: 200, body: 'ignored_no_payment_id' };

      const r = await processPayment(paymentId);
      return { statusCode: 200, body: JSON.stringify(r) };
    }

    if (type === 'merchant_order') {
      // tenta resolver merchant order -> payments
      const resource: string = body.resource || '';
      const moId = Number(resource.split('/').pop());
      if (!moId) return { statusCode: 200, body: 'ignored_no_merchant_order_id' };

      const mo = await new MerchantOrder(client).get({ merchantOrderId: moId });
      const payments = (mo.payments || []).map((p: any) => Number(p.id)).filter(Boolean);

      if (!payments.length) return { statusCode: 200, body: 'merchant_order_no_payments' };

      // processa todos (normalmente só 1)
      for (const pid of payments) {
        await processPayment(pid);
      }

      return { statusCode: 200, body: JSON.stringify({ ok: true, processed: payments.length }) };
    }

    return { statusCode: 200, body: 'ignored' };
  } catch (error: any) {
    console.error('ERRO NO WEBHOOK:', {
      message: error?.message || String(error),
      stack: error?.stack,
    });
    return { statusCode: 500, body: 'Webhook error' };
  }
};
