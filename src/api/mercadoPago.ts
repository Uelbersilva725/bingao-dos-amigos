// src/api/mercadoPago.ts

interface CreatePreferencePayload {
  total: number;
  user_id: number;
  bets: number[][];
}

export async function createPreference(
  payload: CreatePreferencePayload
): Promise<{ id: string }> {
  const response = await fetch('/.netlify/functions/createPreference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Erro ao criar preferência:', text);
    throw new Error('Erro ao iniciar pagamento');
  }

  return response.json();
}
