// Local: front-end/src/pages/Sobre.tsx

import React from 'react';
import { Navigation } from "@/components/ui/navigation"; 
import gabrielImg from "@/assets/gabriel.png"; // Exemplo de import de imagem

const Sobre = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />
      
      {/* Container da Primeira Seção (Imagem | Texto) */}
      {/* O 'pt-32' (padding-top) é mantido para afastar do menu fixo */}
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
          
          {/* 1. Bloco da Imagem (Original mantido) */}
          <div>
            <img 
              src={gabrielImg} 
              alt="Gabriel Rocha" 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>

          {/* 2. Bloco de Texto (Original mantido) */}
          <div className="space-y-4 text-gray-300"> 
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
        </div>
      </div>


      {/* Container da Segunda Seção (Texto | Imagem) */}
      {/* ALTERAÇÃO: 'py-24' mudou para 'py-16' (padding vertical reduzido) */}
      <div className="max-w-4xl mx-auto px-4 py-16"> 
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Bloco de Texto (NOVO TEXTO) */}
          <div className="space-y-4 text-gray-300">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">Nossa Filosofia</h2>
            <p className="text-lg leading-relaxed">
              Nossa filosofia vai além da tesoura e da navalha. Acreditamos que cada 
              cliente é único e merece um atendimento que reflita sua personalidade. 
              Por isso, valorizamos a escuta atenta para entender exatamente o que você busca.
            </p>
            <p className="leading-relaxed">
              Combinamos a precisão dos cortes clássicos com a criatividade das tendências 
              contemporâneas. Seja para um 'fade' perfeito, uma barba alinhada ou um 
              visual totalmente novo, nossa equipe está preparada para superar suas expectativas.
            </p>
            <p className="leading-relaxed">
              Mais do que um corte, oferecemos um momento de pausa. Um ambiente onde você 
              pode relaxar, tomar um bom café e cuidar de si. A Gabriel Rocha Barbearia 
              é o seu refúgio na cidade.
            </p>
            
          </div>
          
          {/* Bloco da Imagem (Original mantido) */}
          <div>
            <img 
              src={gabrielImg} 
              alt="Gabriel Rocha" 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      
      {/* Container da Terceira Seção (Imagem | Texto) */}
      {/* ALTERAÇÃO: 'py-24' mudou para 'py-16' (padding vertical reduzido) */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* 1. Bloco da Imagem (Original mantido) */}
          <div>
            <img 
              src={gabrielImg} 
              alt="Gabriel Rocha" 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>

          {/* 2. Bloco de Texto (NOVO TEXTO) */}
          <div className="space-y-4 text-gray-300"> 
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">Nosso Compromisso</h2>
            <p className="text-lg leading-relaxed">
              Nosso compromisso é com a excelência. Desde a higiene impecável de nossos 
              instrumentos até a qualidade dos produtos utilizados, cada detalhe é pensado 
              para sua segurança e conforto.
            </p>
            <p className="leading-relaxed">
              Investimos constantemente em treinamento para que nossa equipe esteja sempre 
              atualizada com as técnicas mais recentes. Acreditamos que a arte da 
              barbearia está em constante evolução, e nós evoluímos com ela.
            </p>
            <p className="leading-relaxed">
              Convidamos você a conhecer nosso espaço e a vivenciar a diferença. Agende 
              seu horário e descubra por que somos mais do que uma barbearia: somos um 
              ponto de encontro do homem moderno que valoriza o cuidado e o estilo.
            </p>
            
          </div>
        </div>
      </div>

    </div>
  );
};

export default Sobre;