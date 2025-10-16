import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import pomadeProduct from "@/assets/pomada_cabelo.png";

const products = [
  { id: 1, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 102, price: "R$ 29,90" },
  { id: 2, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 88, price: "R$ 32,90" },
  { id: 3, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 156, price: "R$ 27,90" },
  { id: 4, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 93, price: "R$ 35,90" },
  { id: 5, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 127, price: "R$ 31,90" },
  { id: 6, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 76, price: "R$ 28,90" },
  { id: 7, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 76, price: "R$ 28,90" },
  { id: 8, name: "Pomada capilar", image: pomadeProduct, rating: 5, reviews: 76, price: "R$ 28,90" },
];

export const ProductCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCount = 6; // desktop mostra 6 por vez

  const clampIndex = (index: number) => {
    const len = products.length;
    return ((index % len) + len) % len;
  };

  const next = () => setCurrentIndex((prev) => clampIndex(prev + 1));
  const prev = () => setCurrentIndex((prev) => clampIndex(prev - 1));

  const getVisibleProducts = () => {
    const visible: Array<any> = [];
    for (let i = 0; i < visibleCount; i++) {
      const productIndex = (currentIndex + i) % products.length;
      visible.push({
        ...products[productIndex],
        key: `${productIndex}-${Math.floor((currentIndex + i) / products.length)}`,
      });
    }
    return visible;
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? "fill-barbershop-gold text-barbershop-gold" : "text-gray-300"}`}
      />
    ));

  const translatePercent = (currentIndex % products.length) * (100 / visibleCount);

  return (
    <section className="bg-barbershop-dark py-16 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-barbershop-text-light mb-12">
          Produtos
        </h2>

        <div className="relative">
          {/* Botão esquerda */}
          <button
            onClick={prev}
            className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full shadow-lg"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Viewport */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-4"
              style={{
                width: `${(products.length * 100) / visibleCount}%`,
                transform: `translateX(-${translatePercent}%)`,
              }}
            >
              {getVisibleProducts().map((product) => (
                <div
                  key={product.key}
                  className="flex-none w-1/2 sm:w-1/4 lg:w-1/6 min-w-[160px]"
                >
                  <Card className="bg-barbershop-text-light border-0 hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-4">
                      <div className="aspect-square mb-3 overflow-hidden rounded-md">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <h3 className="font-semibold text-barbershop-darker text-sm mb-1">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(product.rating)}
                        <span className="text-xs text-gray-600 ml-1">
                          ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-barbershop-green">
                          {product.price}
                        </span>
                        <Button
                          size="sm"
                          className="bg-barbershop-gold hover:bg-barbershop-gold-hover text-barbershop-darker font-semibold text-xs px-2"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Comprar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Botão direita */}
          <button
            onClick={next}
            className="absolute -right-10 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full shadow-lg"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
};
