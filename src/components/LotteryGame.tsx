import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Trash2 } from 'lucide-react';

export default function LotteryGame() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const { addToCart, items, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
  const TICKET_PRICE = 5;
  const MAX_NUMBERS = 10;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else if (selectedNumbers.length < MAX_NUMBERS) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const completeRandom = () => {
    const remainingCount = MAX_NUMBERS - selectedNumbers.length;
    if (remainingCount <= 0) return;

    const availableNumbers = numbers.filter(n => !selectedNumbers.includes(n));
    const randomNumbers: number[] = [];

    while (randomNumbers.length < remainingCount) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const number = availableNumbers[randomIndex];
      randomNumbers.push(number);
      availableNumbers.splice(randomIndex, 1);
    }

    setSelectedNumbers([...selectedNumbers, ...randomNumbers]);
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedNumbers.length !== MAX_NUMBERS) {
      alert('Selecione exatamente 10 números para completar sua aposta!');
      return;
    }

    addToCart({
      numbers: selectedNumbers,
      price: TICKET_PRICE
    });
    setSelectedNumbers([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-4 md:space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">Monte seu bilhete</h1>
        <p className="text-center mb-4 text-sm md:text-base">
          Escolha 10 números para sua aposta - R$ {TICKET_PRICE},00 por bilhete
        </p>
        
        <div className="grid grid-cols-8 md:grid-cols-10 gap-1 md:gap-2 mb-4 md:mb-6">
          {numbers.map(number => (
            <button
              key={number}
              onClick={() => toggleNumber(number)}
              className={`
                w-full aspect-square rounded-full text-xs md:text-sm font-medium
                ${selectedNumbers.includes(number)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'}
              `}
            >
              {formatNumber(number)}
            </button>
          ))}
        </div>

        <div className="text-center space-y-3 md:space-y-4">
          <p className="font-medium text-sm md:text-base">
            Números selecionados: {selectedNumbers.length}/10
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4">
            <button
              onClick={completeRandom}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              disabled={selectedNumbers.length >= MAX_NUMBERS}
            >
              <Shuffle className="h-4 w-4 md:h-5 md:w-5" />
              Completar Aleatoriamente
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              disabled={selectedNumbers.length !== MAX_NUMBERS}
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>

      {/* Carrinho na parte inferior */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold">Seu Carrinho</h2>
          <p className="text-base md:text-lg font-semibold">
            Total: R$ {total},00
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-sm md:text-base">
            Seu carrinho está vazio. Faça suas apostas!
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm md:text-base">Bilhete - R$ {item.ticket.price},00</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Números: {item.ticket.numbers.sort((a, b) => a - b).map(n => formatNumber(n)).join(', ')}
                  </p>
                </div>
              ))}
            </div>
            
            {items.length > 0 && (
              <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-4 mt-4">
                <button
                  onClick={clearCart}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
                >
                  <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  Limpar Carrinho
                </button>
                <button 
                  onClick={() => navigate('/cart')}
                  className="bg-green-600 text-white px-6 md:px-8 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}