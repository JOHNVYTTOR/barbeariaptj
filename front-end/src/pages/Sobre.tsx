import React from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import barberHero from "@/assets/gabriel.png";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-200 flex flex-col">
      <Navigation />

      {/* Centraliza o conteúdo verticalmente */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Texto à esquerda */}
          <div className="flex flex-col justify-center text-center md:text-left space-y-6">
            <h1 className="text-5xl font-bold text-yellow-400 tracking-tight">
              Sobre mim
            </h1>

            <p className="text-lg leading-relaxed text-gray-200">
              Olá! Sou <span className="font-semibold text-yellow-400">Gabriel Rocha</span>, 
              barbeiro profissional apaixonado por estilo, precisão e autenticidade. 
              Há mais de 5 anos dedico-me a criar visuais únicos que combinam técnica 
              moderna com um toque clássico, ajudando meus clientes a expressarem 
              confiança e personalidade.
            </p>

            <p className="text-lg leading-relaxed text-gray-200">
              Acredito que uma barbearia é mais do que um lugar para cortar o cabelo —
              é um espaço de conexão, identidade e renovação. 
              Cada atendimento é uma experiência pensada nos detalhes, 
              para que cada cliente saia daqui se sentindo melhor do que entrou.
            </p>

            <div className="grid sm:grid-cols-3 gap-8 text-center md:text-left mt-6">
              <div>
                <p className="font-semibold uppercase text-sm text-gray-500">
                  E-mail
                </p>
                <p className="text-yellow-400">gabrochabarber 
                  @gmail.com</p>
              </div>

              <div>
                <p className="font-semibold uppercase text-sm text-gray-500">
                  Função
                </p>
                <p>Barbeiro & Designer Capilar</p>
              </div>

              <div>
                <p className="font-semibold uppercase text-sm text-gray-500">
                  Telefone
                </p>
                <p className="text-yellow-400">(+55) 98765-4321</p>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-6 bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Baixar CV
            </Button>
          </div>

          {/* Imagem à direita */}
          <div className="flex justify-center md:justify-end relative">
            <div className="relative group w-full max-w-md">
              {/* Círculo decorativo */}
              <div className="absolute -top-8 -right-8 w-52 h-52 bg-yellow-400 rounded-full blur-xl opacity-40 -z-10 transition-transform duration-700 group-hover:scale-110"></div>

              <img
                src={barberHero}
                alt="Gabriel Rocha"
                className="w-full h-[30rem] object-cover rounded-lg border-[6px] border-gray-700 shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sobre;
