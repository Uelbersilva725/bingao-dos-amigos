import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Gamepad2, History, MessageCircleQuestion, LogOut, 
  LayoutDashboard, Trophy, Medal, ChevronDown, ChevronUp, 
  Calendar, Eye 
} from 'lucide-react';

/* =====================
   INTERFACES REAIS
===================== */

interface Draw {
  id: number;
  draw_date: string;
  contest_number: string;
  numbers: number[];
}

interface UserBet {
  id: number;
  contest_number: string;
  numbers: number[];
  created_at: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* =====================
     DADOS REAIS
  ===================== */

  const [draws, setDraws] = useState<Draw[]>([]);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  /* =====================
     HANDLERS
  ===================== */

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    setLoading(true);
    navigate(path);
  };

  const openWhatsAppSupport = () => {
    window.open(
      'https://wa.me/5561995828948?text=Olá,%20preciso%20de%20suporte!',
      '_blank'
    );
  };

  const togglePlayerDetails = (playerId: number) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  /* =====================
     FETCH SORTEIOS (ADMIN → DASHBOARD)
  ===================== */

  useEffect(() => {
    async function fetchDraws() {
      try {
        const res = await fetch('/.netlify/functions/listDraws');
        const json = await res.json();
        if (res.ok) {
          setDraws(json.draws || []);
        }
      } catch {}
    }
    fetchDraws();
  }, []);

  const latestDraw = draws.length > 0 ? draws[0] : null;

  /* =====================
     FETCH APOSTAS DO USUÁRIO
  ===================== */

  useEffect(() => {
    async function fetchUserBets() {
      try {
        const res = await fetch('/.netlify/functions/listUserBets', {
          headers: {
            'x-user-email': user?.email || ''
          }
        });
        const json = await res.json();
        if (res.ok) {
          setUserBets(json.bets || []);
        }
      } catch {}
    }

    if (user) {
      fetchUserBets();
    }
  }, [user]);

  /* =====================
     DADOS ORIGINAIS (MANTIDOS)
  ===================== */

  const preferredNumbers = [
    { number: 7, count: 156 },
    { number: 23, count: 142 },
    { number: 45, count: 138 },
    { number: 12, count: 135 },
    { number: 34, count: 129 },
    { number: 56, count: 127 },
    { number: 67, count: 124 },
    { number: 3, count: 120 },
    { number: 17, count: 118 },
    { number: 42, count: 115 }
  ];

  const rankingData = [
    { id: 1, name: 'João Silva', correctNumbers: 42, totalGames: 8 },
    { id: 2, name: 'Maria Oliveira', correctNumbers: 38, totalGames: 6 },
    { id: 3, name: 'Carlos Santos', correctNumbers: 35, totalGames: 7 }
  ];

  /* =====================
     RENDER
  ===================== */

  return (
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <span className="text-2xl font-bold text-green-600">
          BINGÃO DOS AMIGOS
        </span>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          {user?.name}
        </div>
      </div>

      {/* MENU */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-5 gap-2">
          <button onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeTab === 'dashboard' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
            }`}>
            <LayoutDashboard className="h-6 w-6 mb-1" />
            Dashboard
          </button>

          <button onClick={() => setActiveTab('games')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeTab === 'games' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
            }`}>
            <Gamepad2 className="h-6 w-6 mb-1" />
            Meus Jogos
          </button>

          <button onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              activeTab === 'history' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
            }`}>
            <History className="h-6 w-6 mb-1" />
            Histórico
          </button>

          <button onClick={openWhatsAppSupport}
            className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100">
            <MessageCircleQuestion className="h-6 w-6 mb-1" />
            Suporte
          </button>

          <button onClick={handleLogout}
            className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100">
            <LogOut className="h-6 w-6 mb-1" />
            Sair
          </button>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-white rounded-lg shadow-md p-6">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Números favoritos</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap justify-center gap-3">
              {preferredNumbers.map(item => (
                <div key={item.number} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold">
                    {item.number}
                  </div>
                  <span className="text-xs text-gray-500">{item.count}x</span>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-4">Último sorteio</h2>

            {latestDraw ? (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
                <p className="text-center text-gray-600 mb-4">
                  Sorteio do dia {new Date(latestDraw.draw_date).toLocaleDateString('pt-BR')}
                  {' '}• Concurso {latestDraw.contest_number}
                </p>
                <div className="flex justify-center gap-4">
                  {latestDraw.numbers.map(n => (
                    <div key={n}
                      className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                Nenhum sorteio cadastrado ainda.
              </div>
            )}

            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              Ranking de Apostadores
            </h3>

            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Jogador</th>
                  <th className="p-3">Maior Pontuação</th>
                  <th className="p-3">Jogos</th>
                </tr>
              </thead>
              <tbody>
                {rankingData.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.correctNumbers}</td>
                    <td className="p-3">{p.totalGames}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* MEUS JOGOS (AGORA REAL) */}
        {activeTab === 'games' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Meus Jogos</h2>

            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Números Apostados</th>
                  <th className="p-3">Concurso</th>
                </tr>
              </thead>
              <tbody>
                {userBets.map(bet => (
                  <tr key={bet.id} className="border-t">
                    <td className="p-3">
                      {new Date(bet.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {bet.numbers.map(n => (
                          <span key={n} className="bg-green-100 px-2 py-1 rounded text-xs">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">{bet.contest_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 text-center">
              <button
                onClick={() => handleNavigate('/game')}
                className={`bg-green-600 text-white px-6 py-2 rounded-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Comprar Mais Jogos'}
              </button>
            </div>
          </>
        )}

        {/* HISTÓRICO */}
        {activeTab === 'history' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Histórico</h2>

            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Concurso</th>
                  <th className="p-3">Números</th>
                </tr>
              </thead>
              <tbody>
                {draws.map(d => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3">
                      {new Date(d.draw_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3">{d.contest_number}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {d.numbers.map(n => (
                          <span key={n} className="bg-green-100 px-2 py-1 rounded text-xs">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

      </div>
    </div>
  );
}
