// netlify/functions/saveUserBets.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function handler(event: any) {
  try {
    const { userId, bets } = JSON.parse(event.body);

    if (!userId || !bets || !bets.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados inválidos' })
      };
    }

    // 🔹 buscar sorteio ativo (último cadastrado)
    const { data: draw } = await supabase
      .from('draws')
      .select('id')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single();

    if (!draw) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nenhum sorteio ativo' })
      };
    }

    const rows = bets.map((bet: any) => ({
      user_id: userId,
      draw_id: draw.id,
      numbers: bet.numbers,
      price: bet.price
    }));

    const { error } = await supabase.from('bets').insert(rows);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
