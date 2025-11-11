import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// --- Interface para o Produto ---
// ATUALIZADA para bater com o DashboardAdmin e a API
interface Produto {
  idProduto: number;
  nomeProduto: string;
  descricao: string;
  preco: number;
  estoque: number;     // Corrigido de 'estoque'
  imgUrl: string; // Corrigido de 'imgUrl'
}

interface ProductCarouselProps {
  products: Produto[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  if (!products || products.length === 0) return null;
  
  return (
    <Carousel
      opts={{
        align: "start",
        loop: products.length > 3,
      }}
      className="w-full"
    >
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem
            key={product.idProduto}
            className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <div className="p-2">
              <Card className="h-full flex flex-col rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
                
                {/* Imagem com overlay degradê */}
                <CardContent className="relative h-[300px] overflow-hidden"> {/* altura aumentada */}
                  <img
                    src={product.imgUrl} // <-- 4. Corrigido de 'imgUrl'
                    alt={product.nomeProduto}
                    className="absolute top-0 left-0 w-full h-full object-cover transform scale-105 transition-transform duration-500 hover:scale-115"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent flex items-end px-4 pb-2"></div>
                </CardContent>

                {/* Conteúdo do card */}
                <CardFooter className="flex flex-col items-start gap-2 pt-4 mt-auto px-4">
                  <h3
                    className="font-bold text-lg text-white truncate w-full"
                    title={product.nomeProduto}
                  >
                    {product.nomeProduto}
                  </h3>
                  <p className="font-semibold text-xl text-yellow-400">
                    R$ {product.preco.toFixed(2)}
                  </p>

                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="ml-12 text-yellow-400" />
      <CarouselNext className="mr-12 text-yellow-400" />
    </Carousel>
  );
}
