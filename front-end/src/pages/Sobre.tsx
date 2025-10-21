// Local: front-end/src/pages/Sobre.tsx

import React from 'react';
import { Navigation } from "@/components/ui/navigation"; 
import gabrielImg from "@/assets/gabriel.png"; // Exemplo de import de imagem

const Sobre = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-12 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-yellow-400">Sobre</span> Nós
          </h1>
          <p className="text-xl text-gray-400">
            Conheça a história da Gabriel Rocha Barbearia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-gray-300">
            <p className="text-lg leading-relaxed">
              Bem-vindo à Gabriel Rocha Barbearia, onde a tradição encontra o estilo moderno. 
              Nossa missão é oferecer mais do que apenas um corte de cabelo; é proporcionar uma 
              experiência completa de cuidado masculino.
            </p>
            <p className="leading-relaxed">
              Fundada por Gabriel Rocha, um apaixonado pela arte da barbearia com mais de 10 anos 
              de experiência, nossa barbearia se dedica a preservar as técnicas clássicas 
              enquanto inova com as últimas tendências.
            </p>
            <p className="leading-relaxed">
              Usamos apenas os melhores produtos do mercado e nossa equipe é treinada para 
              oferecer um atendimento personalizado, entendendo o estilo único de cada cliente.
            </p>
          </div>
          <div>
            <img 
              src={gabrielImg} 
              alt="Gabriel Rocha" 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ESTA LINHA CORRIGE O ERRO ---
export default Sobre;