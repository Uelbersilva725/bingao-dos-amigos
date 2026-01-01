import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  try {
    const adminEmail = event.headers['x-user-email'];

    if (adminEmail !== 'admin@bingao.com') {
      return {
        statusCode: 403,
        body: JSON.stringify({ ok: false, error: 'Acesso negado' }),
      };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, cpf, birth_date, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, users: data }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Erro inesperado' }),
    };
  }
};
