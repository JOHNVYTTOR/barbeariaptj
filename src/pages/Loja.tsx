import { Navigation } from "@/components/ui/navigation";
import { HeroCarousel } from "@/components/ui/lojass/HeroCarousel";
import { ProductCarousel } from "@/components/ui/lojass/ProductCarousel";

const Loja = () => {
  return (
    <div className="min-h-screen bg-barbershop-darker">
      <Navigation />
      <HeroCarousel />
      <ProductCarousel />
    </div>
  );
};

export default Loja;