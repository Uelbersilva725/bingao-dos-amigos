import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Gamepad2, History, LogOut,
  LayoutDashboard, Trophy, Medal,
  Calendar, Users, Settings, DollarSign,
  Save
} from 'lucide-react';

interface Draw {
  id: number;
  contest_number: string;
  draw_date: string; // YYYY-MM-DD
  numbers: number[];
}

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  created_at: string;
}

/* 🔧 CORREÇÃO DE DATA (SEM FUSO HORÁRIO) */
function formatBrDate(isoDate: string) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  /* 🔹 USUÁRIOS REAIS */
  const [users, setUsers] = useState<User[]>([]);

  /* 🔹 DASHBOARD (MESMO LAYOUT) */
  const adminStats = {
    totalUsers: users.length,
    activeGames: 0,
    totalRevenue: 0,
    pendingPayments: 0
  };

  /* 🔹 SORTEIO */
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawDate, setDrawDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [contestNumber, setContestNumber] = useState('');

  /* 🔹 HISTÓRICO */
  const [draws, setDraws] = useState<Draw[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* 🔐 Proteção simples */
  useEffect(() => {
    if (!user || user.email !== 'admin@bingao.com') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  /* 📡 CARREGAR USUÁRIOS */
  const loadUsers = async () => {
    try {
      const res = await fetch('/.netlify/functions/adminListUsers');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
  };

  /* 📡 CARREGAR HISTÓRICO */
  const loadDraws = async () => {
    try {
      const res = await fetch('/.netlify/functions/getDrawHistory');
      const data = await res.json();
      setDraws(data.draws || []);
    } catch {
      setDraws([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDraws();
  }, []);

  const toggleNumber = (n: number) => {
    if (selectedNumbers.includes(n)) {
      setSelectedNumbers(selectedNumbers.filter(x => x !== n));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, n]);
    }
  };

  const handleSaveDrawing = async () => {
    if (selectedNumbers.length !== 5) {
      alert('Selecione exatamente 5 números');
      return;
    }

    await fetch('/.netlify/functions/saveDraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contestNumber,
        drawDate,
        numbers: selectedNumbers
      })
    });

    setSelectedNumbers([]);
    setContestNumber('');
    await loadDraws();
    alert('Sorteio salvo com sucesso');
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <span className="text-2xl font-bold text-green-600">
          BINGÃO DOS AMIGOS — ADMIN
        </span>
        <button onClick={handleLogout} className="flex gap-2 text-red-600">
          <LogOut /> Sair
        </button>
      </div>

      {/* MENU */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 grid grid-cols-5 gap-2">
        <button onClick={() => setActiveTab('dashboard')} className="p-3 hover:bg-gray-100 rounded">
          <LayoutDashboard /> Dashboard
        </button>
        <button onClick={() => setActiveTab('users')} className="p-3 hover:bg-gray-100 rounded">
          <Users /> Usuários
        </button>
        <button onClick={() => setActiveTab('transactions')} className="p-3 hover:bg-gray-100 rounded">
          <DollarSign /> Transações
        </button>
        <button onClick={() => setActiveTab('settings')} className="p-3 hover:bg-gray-100 rounded">
          <Settings /> Configurações
        </button>
        <button onClick={handleLogout} className="p-3 hover:bg-gray-100 rounded">
          <LogOut /> Sair
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="bg-white rounded-lg shadow-md p-6">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Painel de Controle</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-100 p-6 rounded">
                <p>Total de Usuários</p>
                <h3 className="text-3xl font-bold">{adminStats.totalUsers}</h3>
              </div>
              <div className="bg-green-100 p-6 rounded">
                <p>Jogos Ativos</p>
                <h3 className="text-3xl font-bold">{adminStats.activeGames}</h3>
              </div>
              <div className="bg-yellow-100 p-6 rounded">
                <p>Receita Total</p>
                <h3 className="text-3xl font-bold">R$ {adminStats.totalRevenue}</h3>
              </div>
              <div className="bg-red-100 p-6 rounded">
                <p>Pagamentos Pendentes</p>
                <h3 className="text-3xl font-bold">{adminStats.pendingPayments}</h3>
              </div>
            </div>
          </>
        )}

        {/* USUÁRIOS (REAIS) */}
        {activeTab === 'users' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Usuários</h2>

            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">CPF</th>
                  <th className="p-3">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.cpf}</td>
                    <td className="p-3">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* CONFIGURAÇÕES / SORTEIO */}
        {activeTab === 'settings' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Configuração do Sorteio</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                value={drawDate}
                onChange={e => setDrawDate(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Número do concurso"
                value={contestNumber}
                onChange={e => setContestNumber(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div className="grid grid-cols-10 gap-2 mb-4">
              {Array.from({ length: 80 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => toggleNumber(n)}
                  className={`p-2 rounded ${
                    selectedNumbers.includes(n)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={handleSaveDrawing}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              <Save className="inline mr-2" />
              Salvar Sorteio
            </button>

            <h3 className="text-xl font-bold mt-8 mb-4">
              Histórico de Sorteios
            </h3>

            <div className="space-y-3">
              {draws.map(draw => (
                <div key={draw.id} className="border rounded p-3">
                  <strong>Concurso {draw.contest_number}</strong> —{' '}
                  {formatBrDate(draw.draw_date)}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {draw.numbers.map(n => (
                      <span
                        key={n}
                        className="bg-green-100 px-2 py-1 rounded text-sm"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
