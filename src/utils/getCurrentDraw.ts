import { supabase } from './supabase';

export async function getCurrentDraw() {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Erro ao buscar sorteio atual:', error);
    return null;
  }

  return data;
}
