import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Instagram, Scissors, Users } from "lucide-react";

import gabrielPng from "@/assets/gabriel.png";
import bb01 from "@/assets/bb_01.png";
import bb02 from "@/assets/bb_02.png";
import bb03 from "@/assets/bb_03.png";

export default function Sobre() {
  const galleryImages = [
    { src: bb01, alt: "Interior da barbearia 1" },
    { src: bb02, alt: "Interior da barbearia 2" },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <section className="mb-24 text-center">
          <h1 className="text-5xl font-bold mb-4 text-yellow-400 tracking-tight">
            Nossa História
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Mais do que uma barbearia, somos um ponto de encontro para
            cavalheiros que valorizam a tradição, o estilo e um serviço
            impecável. Aqui, cada corte é uma obra de arte.
          </p>
        </section>

        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img
                src={gabrielPng}
                alt="Barbeiro Gabriel"
                className="w-96 h-[28rem] md:w-[32rem] md:h-[32rem] object-cover border-4 border-yellow-400 shadow-2xl rounded-xl"
              />
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold mb-4">Conheça o Mestre</h2>
              <p className="text-gray-300 text-lg mb-6">
                Com mais de uma década de experiência, Gabriel (ou "Chefe") não
                é apenas um barbeiro, é um artista. Especialista em cortes
                clássicos e tendências modernas, ele dedica seu tempo a entender
                o estilo de cada cliente, garantindo um resultado que vai além
                das expectativas.
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="https://www.instagram.com/barbershopgabrielrocha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Instagram size={28} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            Nossos Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700 text-white rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-yellow-400 rounded-full mb-4">
                  <Scissors size={32} className="text-gray-900" />
                </div>
                <CardTitle className="text-2xl font-bold">Tradição</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Respeitamos as técnicas clássicas da barbearia, trazendo a
                navalha e a tesoura para o centro da nossa arte.
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-white rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-yellow-400 rounded-full mb-4">
                  <Award size={32} className="text-gray-900" />
                </div>
                <CardTitle className="text-2xl font-bold">Qualidade</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Utilizamos apenas os melhores produtos e ferramentas do mercado
                para garantir um acabamento perfeito em cada serviço.
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-white rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-yellow-400 rounded-full mb-4">
                  <Users size={32} className="text-gray-900" />
                </div>
                <CardTitle className="text-2xl font-bold">Comunidade</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-300">
                Acreditamos que a barbearia é um espaço de diálogo, amizade e
                troca de ideias. Sinta-se em casa.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-12">Nosso Espaço</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl shadow-xl"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="text-center bg-gray-800 p-12 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar seu estilo?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Sua cadeira está esperando por você. Agende seu horário e viva a
            experiência completa.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-yellow-400 text-gray-900 font-bold text-lg px-8 py-6 hover:bg-yellow-500 transition-all rounded-xl"
          >
            <Link to="/agendamento">Agendar Horário</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
