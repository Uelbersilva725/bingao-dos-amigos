import { useState } from 'react'

export default function Cart() {
  const [loading, setLoading] = useState(false)

  const totalValue = 5 // ou calcule dinamicamente

  const handlePayment = async () => {
    try {
      setLoading(true)

      const response = await fetch('/.netlify/functions/createPreference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total: totalValue,
        }),
      })

      const data = await response.json()

      if (!data.id) {
        throw new Error('Preference ID não retornado')
      }

      // 🚀 REDIRECIONAMENTO CORRETO PARA O MERCADO PAGO
      window.location.href =
        `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`

    } catch (error) {
      console.error(error)
      alert('Erro ao iniciar pagamento. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Carrinho</h2>
      <p>Total: R$ {totalValue.toFixed(2)}</p>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: '12px 20px',
          background: '#009ee3',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Redirecionando...' : 'Finalizar Pagamento'}
      </button>
    </div>
  )
}
