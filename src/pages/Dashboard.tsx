import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gamepad2, History, LayoutDashboard } from 'lucide-react';

interface UserBet {
  id: number;
  contest_number: string;
  numbers: number[];
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'games' | 'history'>('dashboard');
  const [bets, setBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState(false);

  /* ==========================
     🔗 BUSCAR MEUS JOGOS
     ========================== */
  useEffect(() => {
    if (activeTab !== 'games' || !user) return;

    async function fetchBets() {
      setLoading(true);
      try {
        const res = await fetch('/.netlify/functions/listUserBets', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const json = await res.json();
        if (res.ok) {
          setBets(json.bets || []);
        }
      } catch (err) {
        console.error('Erro ao buscar apostas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBets();
  }, [activeTab, user]);

  return (
    <div className="max-w-6xl mx-auto">

      {/* MENU */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`p-3 rounded flex flex-col items-center ${
            activeTab === 'dashboard' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
          }`}
        >
          <LayoutDashboard />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`p-3 rounded flex flex-col items-center ${
            activeTab === 'games' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
          }`}
        >
          <Gamepad2 />
          Meus Jogos
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`p-3 rounded flex flex-col items-center ${
            activeTab === 'history' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
          }`}
        >
          <History />
          Histórico
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-white rounded-lg shadow p-6">

        {/* DASHBOARD (PLACEHOLDER – NÃO MEXIDO) */}
        {activeTab === 'dashboard' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Bem-vindo 👋</h2>
            <p>Escolha uma opção no menu acima.</p>
          </>
        )}

        {/* ==========================
            🎯 MEUS JOGOS (REAL)
            ========================== */}
        {activeTab === 'games' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Meus Jogos</h2>

            {/* BOTÃO DE COMPRA */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg">Compra de Bilhetes</h3>
              <p className="text-sm text-gray-600 mb-3">
                Escolha seus números e participe do próximo sorteio
              </p>
              <a
                href="/game"
                className="inline-block bg-green-600 text-white px-5 py-2 rounded"
              >
                Ir para compra
              </a>
            </div>

            {loading && <p>Carregando seus jogos...</p>}

            {!loading && bets.length === 0 && (
              <p className="text-gray-500">Você ainda não possui apostas.</p>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {bets.map(bet => (
                <div key={bet.id} className="border rounded p-4">
                  <p className="font-semibold mb-2">
                    Concurso {bet.contest_number}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {bet.numbers.map(n => (
                      <span
                        key={n}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {n}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Aposta realizada em{' '}
                    {new Date(bet.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* HISTÓRICO (RESERVADO) */}
        {activeTab === 'history' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Histórico</h2>
            <p>Em breve.</p>
          </>
        )}
      </div>
    </div>
  );
}
