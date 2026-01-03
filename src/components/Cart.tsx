import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type CartItem = {
  numbers: number[]
  price: number
}

const CART_KEY = 'bingaodosamigos_cart' // ajuste se o seu for diferente

export default function Cart() {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      setItems(Array.isArray(parsed) ? parsed : [])
    } catch {
      setItems([])
    }
  }, [])

  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.price || 0), 0)
  }, [items])

  function removeItem(idx: number) {
    const next = items.filter((_, i) => i !== idx)
    setItems(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }

  async function finalizePayment() {
    setErr(null)
    setLoading(true)

    try {
      // 1) usuário logado
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id

      if (!userId) {
        setErr('Você precisa estar logado para pagar.')
        return
      }

      if (!items.length) {
        setErr('Nenhuma aposta adicionada.')
        return
      }

      // No seu caso, cada “aposta” parece ter 10 números
      // Aqui vamos pagar a PRIMEIRA aposta do carrinho (ajuste se quiser pagar várias)
      const bet = items[0]
      const numbers = bet?.numbers || []
      const betTotal = Number(bet?.price || 0)

      if (!Array.isArray(numbers) || numbers.length !== 10) {
        setErr('Dados inválidos: aposta precisa ter 10 números.')
        return
      }
      if (!betTotal || betTotal <= 0) {
        setErr('Dados inválidos: valor da aposta inválido.')
        return
      }

      // 2) chama function createPreference (que já salva no banco como pending)
      const resp = await fetch('/.netlify/functions/createPreference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          numbers,
          total: betTotal,
        }),
      })

      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        setErr(data?.error || 'Erro ao iniciar pagamento.')
        return
      }

      const initPoint = data?.init_point
      if (!initPoint) {
        setErr('Mercado Pago não retornou init_point.')
        return
      }

      // 3) redireciona pro checkout do Mercado Pago
      window.location.href = initPoint
    } catch (e: any) {
      setErr(e?.message || 'Erro ao iniciar pagamento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
      <h2>Carrinho de Apostas</h2>

      {items.length === 0 ? (
        <p>Nenhuma aposta adicionada.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>Aposta — R$ {Number(it.price).toFixed(2)}</strong>
                  <div>Números: {it.numbers?.join(', ')}</div>
                </div>
                <button onClick={() => removeItem(idx)} style={{ cursor: 'pointer' }}>
                  Remover
                </button>
              </div>
            </div>
          ))}

          <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Total</strong>
              <strong>R$ {total.toFixed(2)}</strong>
            </div>

            {err && (
              <div style={{ marginTop: 10, color: '#b00020' }}>
                {err}
              </div>
            )}

            <button
              onClick={finalizePayment}
              disabled={loading}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Iniciando...' : 'Finalizar Pagamento'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
