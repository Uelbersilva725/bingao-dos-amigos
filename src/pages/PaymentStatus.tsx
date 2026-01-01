import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const status = searchParams.get('status');
  const paymentId = searchParams.get('payment_id');
  
  useEffect(() => {
    if (status === 'approved') {
      clearCart();
    }
  }, [status, clearCart]);

  const getStatusInfo = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
          title: 'Pagamento Aprovado!',
          message: 'Suas apostas foram confirmadas com sucesso.',
          buttonText: 'Voltar para o Jogo',
          buttonAction: () => navigate('/')
        };
      case 'pending':
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          title: 'Pagamento Pendente',
          message: 'Aguardando confirmação do pagamento.',
          buttonText: 'Verificar Status',
          buttonAction: () => window.location.reload()
        };
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Pagamento não Aprovado',
          message: 'Houve um problema com o pagamento. Por favor, tente novamente.',
          buttonText: 'Tentar Novamente',
          buttonAction: () => navigate('/cart')
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          {statusInfo.icon}
        </div>
        <h2 className="text-2xl font-bold mb-4">{statusInfo.title}</h2>
        <p className="text-gray-600 mb-6">{statusInfo.message}</p>
        {paymentId && (
          <p className="text-sm text-gray-500 mb-6">
            ID do Pagamento: {paymentId}
          </p>
        )}
        <button
          onClick={statusInfo.buttonAction}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {statusInfo.buttonText}
        </button>
      </div>
    </div>
  );
}