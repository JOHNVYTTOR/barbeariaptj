import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react'; // Importa o ícone de casa

// Reutiliza a estrutura e os estilos do seu NotFound.tsx
const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-900 text-white"> {/* Mantém o fundo escuro e texto branco */}
      
      {/* Ícone de "Proibido" (Opcional, pode remover se preferir) */}
      <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-20 w-20 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>

      {/* Título Grande (estilo similar ao 404, mas com texto diferente) */}
      <h1 className="text-6xl md:text-8xl font-bold text-yellow-400">Acesso Negado</h1> {/* Mantém a cor amarela */}
      
      {/* Subtítulo (opcional) */}
      <h2 className="text-2xl md:text-3xl font-semibold mt-4 mb-2">Você Não Tem Permissão</h2>
      
      {/* Descrição (estilo similar ao NotFound) */}
      <p className="text-lg text-gray-400 mb-8 max-w-md"> {/* Mantém a cor cinza claro */}
        Desculpe, você precisa estar autenticado como Administrador para acessar esta página.
      </p>
      
      {/* Botão (estilo idêntico ao NotFound) */}
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
      >
        <Home size={20} /> {/* Usa o mesmo ícone do NotFound */}
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};

export default Unauthorized;