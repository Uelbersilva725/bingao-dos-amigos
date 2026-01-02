import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';


const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler = async (event) => {
  try {
    const userEmail = event.headers['x-user-email'];

    if (!userEmail) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Usuário não autenticado' })
      };
    }

    // buscar usuário
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Usuário não encontrado' })
      };
    }

    // buscar apostas
    const { data: bets } = await supabase
      .from('user_bets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return {
      statusCode: 200,
      body: JSON.stringify({ bets })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno' })
    };
  }
};
