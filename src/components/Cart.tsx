export default function Cart() {
  const total = 5

  // EXEMPLO — pegue do seu estado real
  const user_id = 'UUID_DO_USUARIO_LOGADO'
  const bets = [
    [1, 3, 15, 31, 48, 50, 63, 69, 79, 80],
  ]

  const handlePayment = async () => {
    try {
      const response = await fetch('/.netlify/functions/createPreference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total,
          user_id,
          bets,
        }),
      })

      const data = await response.json()

      if (!data.id) throw new Error('Preference ID inválido')

      window.location.href =
        `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`

    } catch (err) {
      console.error(err)
      alert('Erro ao iniciar pagamento')
    }
  }

  return (
    <div>
      <h2>Total: R$ {total},00</h2>
      <button onClick={handlePayment}>
        Finalizar Pagamento
      </button>
    </div>
  )
}
