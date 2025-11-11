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
import { motion, AnimatePresence } from "framer-motion";
import barberImage from "@/assets/bigode_img.jpg";
import haircutImage from "@/assets/navalhinha_img.jpg";
import completeImage from "@/assets/barbaCabelo.png";
import mustacheImage from "@/assets/barba.jpg";
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
        "A barba bem cuidada transforma o visual. Alinhamento dos fios, aparo no estilo desejado e hidratação final.",
      image: barberImage,
    },
    {
      id: 2,
      title: "CORTE MASCULINO",
      description:
        "Corte moderno e personalizado. Técnicas clássicas e atuais para criar o visual que combina com você.",
      image: haircutImage,
    },
    {
      id: 3,
      title: "CORTE + BARBA",
      description:
        "Combo completo para praticidade e estilo. Corte moderno e barba alinhada em um só atendimento.",
      image: completeImage,
    },
    {
      id: 4,
      title: "BIGODE ESTILIZADO",
      description:
        "Aparo, modelagem e finalização para seu bigode ficar perfeito, seja clássico ou moderno.",
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
    <div>
      <Navigation />

      <section className="relative flex items-end justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-10 pointer-events-none">
          <FloatingParticles />
        </div>

        <motion.img
          src={barberHero}
          alt="Gabriel Rocha - Barbeiro Profissional"
          className="max-h-[80vh] w-full object-contain relative z-20 select-none"
          initial={{ opacity: 0, y: 60, scale: 0.95, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.03, rotate: 0.3, transition: { duration: 0.6 } }}
          whileTap={{ scale: 0.98, rotate: 0, transition: { duration: 0.2 } }}
        />
      </section>

      <section className="py-20 px-2 lg:px-6 bg-[#D99D00]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left px-4">
            <h2 className="text-4xl font-bold mb-6 font-display tracking-wider">Sobre Mim</h2>
            <p className="text-xl text-black max-w-2xl">
              Meu nome é Gabriel Rocha, sou barbeiro apaixonado pelo que faço.
              Cortar cabelo e aparar barba vai muito além da estética: é proporcionar confiança, bem-estar e uma boa experiência a cada cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS53QtmSBcetC1JRFNfI_IJJKfWy9fpy093QQ&s" alt="Up Escola de Beleza" className="mx-auto mb-4 h-16" />
              <h3 className="font-semibold text-lg">Up Escola de Beleza</h3>
              <p className="text-gray-600">Data de emissão:</p>
              <p className="text-primary font-bold">20/11/2019</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe7FG91MSW-tbBOFw-9B1-6vkLrUNhAlfUFw&s" alt="ProHair International" className="mx-auto mb-4 h-16" />
              <h3 className="font-semibold text-lg">ProHair International</h3>
              <p className="text-gray-600">Data de emissão:</p>
              <p className="text-primary font-bold">12/02/2020</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Senac_logo.svg/1200px-Senac_logo.svg.png" alt="LikeBarber School" className="mx-auto mb-4 h-16" />
              <h3 className="font-semibold text-lg">LikeBarber School</h3>
              <p className="text-gray-600">Data de emissão:</p>
              <p className="text-primary font-bold">18/07/2022</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-4 bg-[#1a1a1a] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-extrabold text-white font-sans tracking-tight relative inline-block"
            >
              Serviços  
              <span className="block w-96 h-1 bg-yellow-500 mt-3 mx-auto rounded-full animate-pulse"></span>
            </motion.h2>
            <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
              Confira nossos principais serviços:
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 p-3 rounded-full hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronLeft className="w-8 h-8 text-yellow-400" />
            </button>

            {/*
              *** MUDANÇA AQUI ***
              Trocamos 'y: 50' e 'y: -50' por 'scale: 0.95'.
              Isso cria uma transição de "fade" e "zoom" suaves,
              que não afeta a altura do contêiner, evitando o "salto".
            */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${current.id}-${currentService}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }} // Duração pode ser ajustada
                className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 items-center bg-[#1A1A1A] p-8 rounded-2xl"
              >
                <div className="flex justify-center">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-80 h-80 rounded-full object-cover"
                  />
                </div>

                <div className="text-center lg:text-left space-y-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-yellow-400">
                    {current.title}
                  </h1>
                  <p className="text-gray-300 text-lg lg:text-xl max-w-lg mx-auto lg:mx-0">
                    {current.description}
                  </p>

                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="bg-yellow-500 text-black hover:bg-yellow-400 px-10 py-3 font-medium transition-all"
                    >
                      Agendar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 p-3 rounded-full hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronRight className="w-8 h-8 text-yellow-400" />
            </button>
          </div>

          <div className="mt-10 flex justify-center gap-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentService(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentService ? "bg-yellow-500 scale-125" : "bg-gray-500/40 hover:bg-yellow-400/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#393838] text-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <hr className="border-gray-700" />
          <div className="grid md:grid-cols-3 gap-16 items-center mt-8">
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

            <div className="text-right space-y-3">
              <h4 className="text-2xl font-bold text-yellow-400">Nosso Endereço</h4>
              <p className="text-gray-200">
                Rua Manoel Augusto Rangel, 243
                <br />
                Rio Acima – Votorantim – SP
              </p>
              <p className="text-gray-300">Telefone: (15) 99820-8468</p>
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

          <hr className="border-gray-700 mt-8" />
          <h3 className="text-lg font-semibold">Acompanhe-nos em nossas redes sociais!</h3>

          <div className="flex justify-center gap-6 mt-8">
            <a href="https://web.facebook.com/barbershopgabrielrocha/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/barbershopgabrielrocha" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-gray-800 hover:bg-pink-600 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://wa.me/5515998208468" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-gray-800 hover:bg-green-600 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed max-w-4xl mx-auto">
            Todo o conteúdo do site é de propriedade exclusiva da AVEC Serviços de Tecnologia LTDA. Reprodução sem autorização é proibida.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
