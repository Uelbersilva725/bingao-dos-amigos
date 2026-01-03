// src/pages/Cart.tsx
import { useAuth } from '../contexts/AuthContext'

export default function Cart() {
  const { user } = useAuth()

  // EXEMPLO — ajuste se seu carrinho for dinâmico
  const cartItems = [
    {
      numbers: [1, 3, 15, 31, 48, 50, 63, 69, 79, 80],
      price: 5,
    },
  ]

  const total = cartItems.reduce((acc, item) => acc + item.price, 0)

  async function handleCheckout() {
    try {
      if (!user) {
        alert('Usuário não autenticado')
        return
      }

      const bets = cartItems.map(item => item.numbers)

      console.log('ENVIANDO PARA API:', {
        total,
        user_id: user.id,
        bets,
      })

      const response = await fetch(
        '/.netlify/functions/createPreference',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total,
            user_id: user.id,
            bets,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        alert('Erro ao iniciar pagamento')
        return
      }

      // REDIRECIONA PARA O CHECKOUT
      window.location.href =
        `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`

    } catch (err) {
      console.error(err)
      alert('Erro ao iniciar pagamento')
    }
  }

  return (
    <div>
      <h2>Carrinho</h2>
      <p>Total: R$ {total},00</p>

      <button onClick={handleCheckout}>
        Finalizar Pagamento
      </button>
    </div>
  )
}
