import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const navigate = useNavigate()

  const [numbers, setNumbers] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const PRICE_PER_BET = 5

  // 🔹 Carrega números salvos (se existirem)
  useEffect(() => {
    const saved = localStorage.getItem('selected_numbers')
    if (saved) {
      setNumbers(JSON.parse(saved))
    }
  }, [])

  // 🔹 Remove aposta
  function removeBet() {
    localStorage.removeItem('selected_numbers')
    setNumbers([])
  }

  // 🔹 Inicia pagamento
  async function handlePayment() {
    setError(null)

    if (numbers.length !== 10) {
      setError('Selecione exatamente 10 números.')
      return
    }

    const total = PRICE_PER_BET

    try {
      setLoading(true)

      const response = await fetch(
        '/.netlify/functions/createPreference',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total,
            numbers,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro backend:', data)
        setError(data.error || 'Erro ao iniciar pagamento')
        setLoading(false)
        return
      }

      if (!data.id) {
        setError('ID de pagamento não retornado')
        setLoading(false)
        return
      }

      // 🔹 Redireciona para o checkout
      window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`
    } catch (err) {
      console.error(err)
      setError('Erro inesperado ao iniciar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>Carrinho de Apostas</h2>

      {numbers.length === 0 ? (
        <p>Nenhuma aposta adicionada.</p>
      ) : (
        <div style={{ border: '1px solid #ddd', padding: 16, marginTop: 16 }}>
          <p>
            <strong>Aposta:</strong> R$ {PRICE_PER_BET.toFixed(2)}
          </p>

          <p>
            <strong>Números:</strong>{' '}
            {numbers.sort((a, b) => a - b).join(', ')}
          </p>

          <button
            onClick={removeBet}
            style={{
              marginTop: 8,
              background: '#e53935',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Remover
          </button>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <p>
          <strong>Total:</strong> R$ {PRICE_PER_BET.toFixed(2)}
        </p>

        {error && (
          <p style={{ color: 'red', marginTop: 8 }}>{error}</p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || numbers.length === 0}
          style={{
            marginTop: 16,
            background: loading ? '#aaa' : '#4caf50',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processando...' : 'Finalizar Pagamento'}
        </button>
      </div>

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 24,
          background: 'transparent',
          border: 'none',
          color: '#1976d2',
          cursor: 'pointer',
        }}
      >
        ← Voltar
      </button>
    </div>
  )
}
