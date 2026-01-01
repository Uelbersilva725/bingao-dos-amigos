import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  // Ainda carregando auth
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 REGRA DE ADMIN (SIMPLES E CLARA)
  if (user.email !== 'admin@bingao.com') {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Admin autorizado
  return children;
}
