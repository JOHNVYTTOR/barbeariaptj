import React, { useState, useEffect } from 'react';
import diploma1 from '@/assets/bigode_img.jpg';
import diploma2 from '@/assets/gabriel.png';
import diploma3 from '@/assets/bigode_img.jpg';
import diploma4 from '@/assets/chefe_png.png';
import diploma5 from '@/assets/cimento.jpg';

interface DiplomaItem {
  id: number;
  image: string;
  title: string;
  description: string;
}

const diplomaData: DiplomaItem[] = [
  {
    id: 1,
    image: diploma1,
    title: 'Certificado Profissional',
    description: 'Curso Profissional de Barbeiro - Técnicas Básicas'
  },
  {
    id: 2,
    image: diploma2,
    title: 'Certificação Master',
    description: 'Certificação Master Barber - Técnicas Avançadas'
  },
  {
    id: 3,
    image: diploma3,
    title: 'Academia Moderna',
    description: 'Técnicas Avançadas de Barbearia - Design Moderno'
  },
  {
    id: 4,
    image: diploma4,
    title: 'Especialista em Cortes',
    description: 'Especialização em Cortes de Cabelo - Design Clássico'
  },
  {
    id: 5,
    image: diploma5,
    title: 'Expert em Barbas',
    description: 'Especialização em Design de Barbas - Técnicas Modernas'
  }
];

const DiplomaSlider: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Duplicate the diplomas for infinite scroll
  const duplicatedDiplomas = [...diplomaData, ...diplomaData, ...diplomaData];

  return (
    <div className="w-full overflow-hidden bg-barber-dark py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-barber-gold mb-2">
          Certificações & Diplomas
        </h2>
        <p className="text-primary-foreground/80 text-lg">
          Qualificações profissionais em barbearia
        </p>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className={`flex gap-6 slider-container ${isPaused ? 'pause' : ''}`}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            width: `${duplicatedDiplomas.length * 280}px`
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setHoveredCard(null);
          }}
        >
          {duplicatedDiplomas.map((diploma, index) => (
            <div
              key={`${diploma.id}-${index}`}
              className={`flex-shrink-0 diploma-card accordion-expand bg-barber-card rounded-xl border border-barber-border overflow-hidden shadow-lg transition-all duration-500 ease-out ${
                hoveredCard === index ? 'w-80' : 'w-64'
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={diploma.image}
                  alt={diploma.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-barber-gold font-semibold text-lg mb-2 truncate">
                  {diploma.title}
                </h3>
                <p className={`text-primary-foreground/70 text-sm leading-relaxed transition-all duration-300 ${
                  hoveredCard === index ? 'opacity-100 max-h-20' : 'opacity-60 max-h-12 line-clamp-2'
                }`}>
                  {diploma.description}
                </p>
              </div>
              
              {/* Decorative golden accent */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-barber-gold/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-barber-gold rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for smooth edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-barber-dark to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-barber-dark to-transparent pointer-events-none z-10"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="flex justify-center mt-8 space-x-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-barber-gold/30 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default DiplomaSlider;