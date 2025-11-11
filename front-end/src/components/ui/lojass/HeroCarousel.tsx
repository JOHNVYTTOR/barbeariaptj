import { useState, useEffect } from "react";
import barbershop1 from "@/assets/bb_01.png";
import barbershop2 from "@/assets/bb_02.png";
import barbershop3 from "@/assets/bb_03.png";

const heroSlides = [
  {
    image: barbershop1,
    title: "Mantenha sua saúde capilar em dia",
    description: "Aqui na loja Gabriel Rocha você encontra todos os tipos de produtos para manter o seu cabelo saudável e bonito"
  },
  {
    image: barbershop2,
    title: "Produtos de qualidade premium",
    description: "Descubra nossa seleção exclusiva de pomadas e produtos para cabelo dos melhores fabricantes"
  },
  {
    image: barbershop3,
    title: "Atendimento especializado",
    description: "Nossa equipe está pronta para te ajudar a escolher os melhores produtos para seu tipo de cabelo"
  }
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Imagem de fundo */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />

          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Texto */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-4xl px-4">
              <h1 className="lobster text-4xl md:text-6xl text-white font-poppins mb-6 animate-fade-in">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed animate-fade-in">
                {slide.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide
                ? "bg-barbershop-gold"
                : "bg-barbershop-text-muted/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};  