// src/api/mercadoPago.ts

export async function createPreference(total: number): Promise<{ id: string }> {
  const response = await fetch('/.netlify/functions/createPreference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      total,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Erro ao criar preferência:', text);
    throw new Error('Erro ao iniciar pagamento');
  }

  return response.json();
}
