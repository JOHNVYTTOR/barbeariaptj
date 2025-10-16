import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import {
  Facebook,
  Instagram,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import barberHero from "../assets/chefe_png.png";
import bgImage from "@/assets/cimento.jpg";
import { motion, AnimatePresence } from "framer-motion";
import barberImage from "@/assets/bigode_img.jpg";
import haircutImage from "@/assets/navalhinha_img.jpg";
import completeImage from "@/assets/bigode_img.jpg";
import mustacheImage from "@/assets/tudo_img.jpg";
import { useState } from "react";

const Home = () => {
  interface Service {
    id: number;
    title: string;
    description: string;
    image: string;
  }

  const services: Service[] = [
    {
      id: 1,
      title: "BARBA COMPLETA",
      description:
        "A barba bem cuidada transforma o visual. No serviço de Barba Completa, faço o alinhamento dos fios, aparo no estilo desejado e finalizo com hidratação e acabamento preciso, garantindo conforto e um visual impecável.",
      image: barberImage,
    },
    {
      id: 2,
      title: "CORTE MASCULINO",
      description:
        "Corte moderno e personalizado para cada cliente. Utilizo técnicas atuais e clássicas para criar o visual perfeito que combina com seu estilo de vida, sempre com acabamento profissional e atenção aos detalhes.",
      image: haircutImage,
    },
    {
      id: 3,
      title: "CORTE + BARBA",
      description:
        "O combo completo para quem busca praticidade e estilo. Corte de cabelo moderno combinado com barba alinhada e bem cuidada. Um visual completo e harmonioso em um só atendimento.",
      image: completeImage,
    },
    {
      id: 4,
      title: "BIGODE ESTILIZADO",
      description:
        "Cuidado especializado para bigodes. Aparo, modelagem e finalização com produtos específicos. Seja clássico ou moderno, deixo seu bigode com o formato ideal e bem definido.",
      image: mustacheImage,
    },
  ];

  const [currentService, setCurrentService] = useState(0);

  const handlePrevious = () => {
    setCurrentService((prev) => (prev === 0 ? services.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentService((prev) => (prev === services.length - 1 ? 0 : prev + 1));
  };

  const current = services[currentService];
  return (
    <div
>
  <Navigation />

  {/* Hero Section com Partículas */}
  <section className="relative flex items-end justify-center min-h-screen overflow-hidden">
    
    {/* Partículas — posicionadas por cima do fundo */}
    <div className="absolute inset-0 z-10 pointer-events-none">
      <FloatingParticles />
    </div>

    {/* Imagem do barbeiro — acima das partículas */}
   <motion.img
  src={barberHero}
  alt="Gabriel Rocha - Barbeiro Profissional"
  className="max-h-[80vh] w-full object-contain relative z-20 select-none"
  initial={{ opacity: 0, y: 60, scale: 0.95, filter: "blur(8px)" }}
  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
  transition={{
    duration: 1.8,
    ease: [0.16, 1, 0.3, 1], // cubic-bezier tipo "spring suave"
  }}
  whileHover={{
    scale: 1.03,
    rotate: 0.3,
    transition: { duration: 0.6, ease: "easeOut" },
  }}
  whileTap={{
    scale: 0.98,
    rotate: 0,
    transition: { duration: 0.2 },
  }}
/>

  </section>

      {/* Sobre mim */}
      <section className="py-20 px-2 lg:px-6 bg-[#D99D00]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto alinhado à esquerda */}
          <div className="text-left px-4">
            <h2 className="text-4xl font-bold mb-6 font-display tracking-wider">
              Sobre Mim
            </h2>
            {/* CORREÇÃO AQUI: removi a classe 'font-sans' */}
            <p className="text-xl text-black max-w-2xl">
              Meu nome é Gabriel Rocha, sou barbeiro apaixonado pelo que faço.
              Desde cedo descobri na barbearia uma forma de unir técnica, estilo
              e cuidado em cada detalhe. Para mim, cortar cabelo e aparar barba
              vai muito além da estética: é proporcionar confiança, bem-estar e
              uma boa experiência a cada cliente.
            </p>
          </div>

          {/* Certificados à direita */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <img
                src="/certificados/up.png"
                alt="Up Escola de Beleza"
                className="mx-auto mb-4 h-16"
              />
              <h3 className="font-semibold text-lg">Up Escola de Beleza</h3>
              <p className="text-gray-600">Data de emissão:</p>
              <p className="text-primary font-bold">20/11/2019</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <img
                src="/certificados/prohair.png"
                alt="ProHair International"
                className="mx-auto mb-4 h-16"
              />
              <h3 className="font-semibold text-lg">ProHair International</h3>
              <p className="text-gray-600">Data de emissão:</p>
              <p className="text-primary font-bold">12/02/2020</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <img
                src="/certificados/likebarber.png"
                alt="LikeBarber School"
                className="mx-auto mb-4 h-16"
              />
              <h3 className="font-semibold text-lg">LikeBarber School</h3>
              <p className="text-gray-600">Data de emissão:</p>
              <p className="text-primary font-bold">18/07/2022</p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-barbershop-concrete to-barbershop-dark overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center -mt-8 mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-barbershop-text-light tracking-widest">
              NOSSOS SERVIÇOS
            </h2>
          </div>

          <div className="relative flex items-center justify-center mt-6">
           <button
  onClick={handlePrevious}
  className="
    absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 z-20
    bg-gradient-to-r from-gray-100 via-white to-white
    p-3 rounded-full shadow-md backdrop-blur-md border border-black/30
    hover:from-white hover:via-gray-100 hover:to-barbershop-accent/20
    hover:border-barbershop-accent hover:scale-105 hover:shadow-lg
    transition-all duration-300 ease-in-out
  "
>
  <ChevronLeft className="w-8 h-8 text-black drop-shadow-sm" />
</button>


            <AnimatePresence mode="wait">
              <motion.div
                key={`${current.id}-${currentService}`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-8 items-center"
              >
                {/* Imagem */}
                <div className="flex justify-center">
                  <div
                    className="w-80 h-80 rounded-full overflow-hidden border-4 border-barbershop-text-light/20 shadow-2xl"
                    style={{
                      background: `url(${current.image}) center/cover`,
                    }}
                  />
                </div>

                {/* Texto */}
                <div className="text-center lg:text-left space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold text-barbershop-text-light tracking-wider hover:text-barbershop-accent transition-colors duration-300">
                    {current.title}
                  </h1>

                  <p className="text-lg lg:text-xl text-barbershop-text-light/90 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {current.description}
                  </p>

                  {/* Botão preto sólido */}
                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="group bg-black text-white border border-black hover:bg-gray-900 hover:border-gray-900 px-12 py-3 text-lg font-medium tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/40"
                    >
                      <span className="group-hover:text-barbershop-accent transition-colors duration-300">
                        Agendar
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
  onClick={handleNext}
  className="
    absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 z-20
    bg-gradient-to-l from-gray-100 via-white to-white
    p-3 rounded-full shadow-md backdrop-blur-md border border-black/30
    hover:from-white hover:via-gray-100 hover:to-barbershop-accent/20
    hover:border-barbershop-accent hover:scale-105 hover:shadow-lg
    transition-all duration-300 ease-in-out
  "
>
  <ChevronRight className="w-8 h-8 text-black drop-shadow-sm" />
</button>

          </div>

          {/* Bolinhas de navegação */}
          <div className="mt-10 flex justify-center gap-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentService(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentService
                    ? "bg-barbershop-accent scale-125"
                    : "bg-barbershop-text-light/30 hover:bg-barbershop-text-light/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-[#393838] text-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
    
          {/* O bloco de redes sociais que estava aqui foi movido para o final */}
          <hr className="border-gray-700" />
          {/* Bloco com mapa e endereço */}
          {/* ATENÇÃO: Alterado de md:grid-cols-2 para md:grid-cols-3 para aumentar a largura do mapa */}
          <div className="grid md:grid-cols-3 gap-16 items-center mt-8">
            {/* Mapa do Google (Esquerda) */}
            {/* ATENÇÃO: Adicionado md:col-span-2 para ocupar 2/3 da largura */}
            <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-lg border border-gray-700 md:col-span-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.811770563788!2d-47.45275!3d-23.54045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf60b2a2ff7bb3%3A0x3e2db5b30d22a807!2sR.%20Manoel%20Augusto%20Rangel%2C%20243%20-%20Rio%20Acima%2C%20Votorantim%20-%20SP%2C%2018150-000%2C%20Brasil!5e0!3m2!1spt-BR!2sbr!4v1697660000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Endereço e contato (Direita) */}
            {/* ATENÇÃO: Permanece com alinhamento text-right (como estava no seu último código) e ocupa o espaço restante (1/3) */}
            <div className="text-right space-y-3">
              <h4 className="text-2xl font-bold text-yellow-400">
                Nosso Endereço
              </h4>
              <p className="text-gray-200">
                Rua Manoel Augusto Rangel, 243
                <br />
                Rio Acima – Votorantim – SP
              </p>
              <p className="text-gray-300">Telefone: (15) 99820-8468</p>
              {/* O botão fica alinhado à direita por causa do text-right no container pai */}
              <a
                href="https://wa.me/5515998208468"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-yellow-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-yellow-400 transition-all"
              >
                Falar pelo WhatsApp
              </a>
            </div>
          </div>
          <hr className="border-gray-700 mt-8" />{" "}

          <h3 className="text-lg font-semibold">
            Acompanhe-nos em nossas redes sociais!
          </h3>

          {/* ATENÇÃO: Bloco de Redes Sociais movido para AQUI (abaixo do mapa e endereço) */}
          <div className="flex justify-center gap-6 mt-8">
            <a
              href="https://web.facebook.com/barbershopgabrielrocha/?_rdc=1&_rdr#"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-800 hover:bg-primary transition-colors"
            >
              <Facebook className="w-6 h-6" />
            </a>

            <a
              href="https://www.instagram.com/barbershopgabrielrocha"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-800 hover:bg-primary transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>

            <a
              href="https://wa.me/5515998208468"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-800 hover:bg-primary transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
      
          <p className="text-xs text-gray-400 leading-relaxed max-w-4xl mx-auto">
            Todo o conteúdo do site, todas as fotos, imagens, logotipos, marcas,
            dizeres, som, software, conjunto imagem, layout, trade dress, aqui
            veiculados são de propriedade exclusiva da AVEC Serviços de
            Tecnologia LTDA. É vedada qualquer reprodução, total ou parcial, de
            qualquer elemento de identidade, sem expressa autorização. A
            violação de qualquer direito mencionado implicará na
            responsabilidade cível e criminal nos termos da Lei.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
