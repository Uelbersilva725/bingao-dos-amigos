interface CreatePreferencePayload {
  total: number
  userId: string
  bets: number[][]
}

export async function createPreference(
  payload: CreatePreferencePayload
): Promise<{ id: string }> {
  const response = await fetch('/.netlify/functions/createPreference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(text)
    throw new Error('Erro ao criar preferência')
  }

  return response.json()
}
