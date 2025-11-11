import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import barberImage from '@/assets/tudo_img.jpg';
import haircutImage from '@/assets/cimento.jpg';
import completeImage from '@/assets/fotoCorte.jpg';
import mustacheImage from '@/assets/gabriel.png';

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
    description: "A barba bem cuidada transforma o visual. No serviço de Barba Completa, faço o alinhamento dos fios, aparo no estilo desejado e finalizo com hidratação e acabamento preciso, garantindo conforto e um visual impecável.",
    image: barberImage
  },
  {
    id: 2,
    title: "CORTE MASCULINO",
    description: "Corte moderno e personalizado para cada cliente. Utilizo técnicas atuais e clássicas para criar o visual perfeito que combina com seu estilo de vida, sempre com acabamento profissional e atenção aos detalhes.",
    image: haircutImage
  },
  {
    id: 3,
    title: "CORTE + BARBA",
    description: "O combo completo para quem busca praticidade e estilo. Corte de cabelo moderno combinado com barba alinhada e bem cuidada. Um visual completo e harmonioso em um só atendimento.",
    image: completeImage
  },
  {
    id: 4,
    title: "BIGODE ESTILIZADO",
    description: "Cuidado especializado para bigodes. Aparo, modelagem e finalização com produtos específicos. Seja clássico ou moderno, deixo seu bigode com o formato ideal e bem definido.",
    image: mustacheImage
  }
];

export const ServiceSection: React.FC = () => {
  const [currentService, setCurrentService] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentService((prev) => (prev === 0 ? services.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 150);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentService((prev) => (prev === services.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 150);
  };

  const current = services[currentService];

  return (
    <div className="relative min-h-screen bg-barbershop-concrete bg-gradient-to-br from-barbershop-concrete to-barbershop-dark overflow-hidden">
      {/* Background texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation arrows with hover animations */}
      <button 
        onClick={handlePrevious}
        disabled={isTransitioning}
        className="group absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-barbershop-glass border border-barbershop-text-light/20 flex items-center justify-center text-barbershop-text-light hover:bg-barbershop-text-light/10 hover:border-barbershop-text-light/40 transition-all duration-300 disabled:opacity-50"
      >
        <ChevronLeft className="w-6 h-6 group-hover:animate-slide-hover-left transition-transform duration-200" />
      </button>
      
      <button 
        onClick={handleNext}
        disabled={isTransitioning}
        className="group absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-barbershop-glass border border-barbershop-text-light/20 flex items-center justify-center text-barbershop-text-light hover:bg-barbershop-text-light/10 hover:border-barbershop-text-light/40 transition-all duration-300 disabled:opacity-50"
      >
        <ChevronRight className="w-6 h-6 group-hover:animate-slide-hover-right transition-transform duration-200" />
      </button>

      {/* Service indicators */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentService(index);
                  setIsTransitioning(false);
                }, 150);
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentService 
                ? 'bg-barbershop-accent scale-125' 
                : 'bg-barbershop-text-light/30 hover:bg-barbershop-text-light/50'
            }`}
          />
        ))}
      </div>

      {/* Main content with transition */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className={`max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-8 items-center transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          
          {/* Service image with circular crop and animations */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative group">
              <div 
                className="w-80 h-80 rounded-full overflow-hidden border-4 border-barbershop-text-light/20 shadow-2xl transition-all duration-500 group-hover:border-barbershop-text-light/40 group-hover:shadow-3xl group-hover:scale-105"
                style={{
                  background: `url(${current.image}) center/cover`,
                }}
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full shadow-2xl shadow-barbershop-accent/20 group-hover:shadow-barbershop-accent/30 transition-all duration-500" />
            </div>
          </div>

          {/* Service content with animation */}
          <div className="order-1 lg:order-2 text-center lg:text-left space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-barbershop-text-light tracking-wider hover:text-barbershop-accent transition-colors duration-300">
              {current.title}
            </h1>
            
            <p className="text-lg lg:text-xl text-barbershop-text-light/90 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {current.description}
            </p>

            <div className="pt-4">
              <Button 
                size="lg"
                className="group bg-barbershop-dark/80 text-barbershop-text-light border border-barbershop-text-light/30 hover:bg-barbershop-text-light/10 hover:border-barbershop-text-light/50 px-12 py-3 text-lg font-medium tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-barbershop-accent/20"
              >
                <span className="group-hover:text-barbershop-accent transition-colors duration-300">
                  Agendar
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSection;