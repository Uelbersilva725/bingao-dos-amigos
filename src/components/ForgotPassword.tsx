import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

// Schema de validação do formulário
const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

/**
 * Componente de recuperação de senha
 * Permite que o usuário solicite a redefinição de senha através do e-mail
 */
export default function ForgotPassword() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  /**
   * Manipula o envio do formulário
   * Simula o envio do e-mail de recuperação
   */
  const onSubmit = (data: ForgotPasswordForm) => {
    // Aqui você implementaria a lógica real de envio do e-mail
    console.log('Enviando e-mail de recuperação para:', data.email);
    setIsEmailSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Link 
            to="/login" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o login
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Recuperar Senha
            </h2>
            <p className="text-gray-600">
              Digite seu e-mail para receber as instruções de recuperação
            </p>
          </div>

          {!isEmailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Seu e-mail cadastrado"
                    {...register('email')}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <Send className="h-5 w-5" />
                Enviar Instruções
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Mail className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  E-mail Enviado!
                </h3>
                <p className="text-green-700">
                  Verifique sua caixa de entrada e siga as instruções para recuperar sua senha.
                </p>
              </div>
              
              <Link 
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Voltar para o login
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Lembrou sua senha?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}