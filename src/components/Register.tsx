import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMask } from '@react-input/mask';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Calendar, FileText, UserPlus } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome completo é obrigatório'),
  cpf: z.string().min(14, 'CPF inválido'),
  birthDate: z.string().min(10, 'Data de nascimento inválida'),
  email: z.string().email('E-mail inválido'),
  emailConfirmation: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  passwordConfirmation: z.string()
}).refine((data) => data.email === data.emailConfirmation, {
  message: "Os e-mails não coincidem",
  path: ["emailConfirmation"],
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas não coincidem",
  path: ["passwordConfirmation"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const cpfInputRef = useMask({ mask: '999.999.999-99', replacement: { 9: /[0-9]/ } });
  const birthDateInputRef = useMask({ mask: '99/99/9999', replacement: { 9: /[0-9]/ } });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatBirthDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    e.target.value = formattedValue;
    setValue('cpf', formattedValue);
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBirthDate(e.target.value);
    e.target.value = formattedValue;
    setValue('birthDate', formattedValue);
  };

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    setLoading(true);

    try {
      const resp = await fetch('/.netlify/functions/saveUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          cpf: data.cpf,               // vai como "000.000.000-00"
          birth_date: data.birthDate,  // vai como "DD/MM/AAAA"
        }),
      });

      const result = await resp.json();

      if (!resp.ok || !result.ok) {
        setServerError(result?.error || 'Erro ao cadastrar');
        setLoading(false);
        return;
      }

      // Mantém seu comportamento atual (logar no contexto)
      login({
        name: data.name,
        cpf: data.cpf,
        birthDate: data.birthDate,
        email: data.email,
        phone: '',
      });

      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="max-w-md w-full px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-600 mb-2">Crie sua conta</h2>
            <p className="text-gray-600">Preencha os dados abaixo para se cadastrar</p>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Dados Pessoais
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    {...register('name')}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    ref={cpfInputRef}
                    {...register('cpf')}
                    onChange={handleCPFChange}
                    maxLength={14}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    ref={birthDateInputRef}
                    {...register('birthDate')}
                    onChange={handleBirthDateChange}
                    maxLength={10}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Dados de Acesso
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    {...register('email')}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirme o E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Confirme seu e-mail"
                    {...register('emailConfirmation')}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.emailConfirmation && <p className="mt-1 text-sm text-red-600">{errors.emailConfirmation.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Sua senha"
                    {...register('password')}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirme a Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirme sua senha"
                    {...register('passwordConfirmation')}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-3 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                {errors.passwordConfirmation && <p className="mt-1 text-sm text-red-600">{errors.passwordConfirmation.message}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
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
