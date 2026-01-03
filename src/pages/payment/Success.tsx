import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const nav = useNavigate()

  useEffect(() => {
    // dá um tempo pro webhook atualizar no banco
    const t = setTimeout(() => {
      nav('/my-bets') // ajuste para sua rota real de "Meus Jogos"
    }, 2000)
    return () => clearTimeout(t)
  }, [nav])

  return (
    <div style={{ maxWidth: 700, margin: '24px auto', padding: 16 }}>
      <h2>Pagamento aprovado ✅</h2>
      <p>Estamos confirmando sua aposta... (bet: {params.get('bet')})</p>
      <p>Você será redirecionado para ver seus jogos.</p>
    </div>
  )
}
