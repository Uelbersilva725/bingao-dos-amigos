export async function createPreference(data: {
  total: number;
  userId: string;
  bets: number[][];
}): Promise<{ id: string }> {

  const response = await fetch('/.netlify/functions/createPreference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro ao criar preferência');
  }

  return response.json();
}
