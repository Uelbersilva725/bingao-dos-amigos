export async function createPreference(
  total: number,
  user_id: string,
  bets: number[][]
): Promise<{ id: string }> {
  const response = await fetch('/.netlify/functions/createPreference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      total,
      user_id,
      bets,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('Erro ao criar preferência:', text)
    throw new Error('Erro ao iniciar pagamento')
  }

  return response.json()
}
