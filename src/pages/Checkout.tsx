import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from '@mercadopago/sdk-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { createPreference } from '../api/mercadoPago'

export default function Checkout() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initPayment() {
      try {
        if (!user) {
          navigate('/login')
          return
        }

        if (items.length === 0) {
          navigate('/dashboard')
          return
        }

        const bets = items.map(item => item.ticket.numbers)

        const response = await createPreference({
          total,
          userId: user.id, // UUID REAL DO SUPABASE
          bets,
        })

        setPreferenceId(response.id)
      } catch (err) {
        console.error(err)
        setError('Erro ao iniciar pagamento')
      } finally {
        setLoading(false)
      }
    }

    initPayment()
  }, [user, items, total, navigate])

  if (loading) {
    return <p className="text-center mt-10">Preparando pagamento...</p>
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-6 text-center">
        Finalizar Pagamento
      </h1>

      {preferenceId && (
        <Wallet
          initialization={{ preferenceId }}
          onReady={() => console.log('Wallet pronta')}
          onError={(err) => {
            console.error('Erro Wallet:', err)
            setError('Erro ao carregar pagamento')
          }}
        />
      )}
    </div>
  )
}
