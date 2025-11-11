// Local: front-end/src/pages/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-900 text-white">
      <h1 className="text-8xl font-bold text-yellow-400">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-2">Página Não Encontrada</h2>
      <p className="text-lg text-gray-400 mb-8">
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
      >
        <Home size={20} />
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};

export default NotFound;
// --- ESTA LINHA CORRIGE