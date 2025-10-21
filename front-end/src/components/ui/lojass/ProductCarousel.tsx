// Local: front-end/src/components/ui/lojass/ProductCarousel.tsx

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Componente 'Carousel' do Shadcn
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// 1. DEFINIR A INTERFACE DOS PRODUTOS
// (Esta interface deve ser idêntica à de Loja.tsx)
interface Produto {
  idProduto: number;
  nomeProduto: string;
  descricao: string;
  preco: number;
  stock: number;
  imagemUrl: string; // (Vem da API ou do fallback)
}

// 2. DEFINIR AS PROPS QUE O COMPONENTE RECEBE
interface ProductCarouselProps {
  products: Produto[]; // Ele deve receber a lista de produtos da Loja.tsx
}

// 3. SEU COMPONENTE REACT
export function ProductCarousel({ products }: ProductCarouselProps) {
  
  // Se não houver produtos, não renderiza nada
  if (!products || products.length === 0) {
     // Você pode retornar <p>Nenhum produto</p> ou null
     return null; 
  }

  return (
    <Carousel
      opts={{
        align: "start",
        // Só faz loop se houver mais de 3 produtos (ou o número de 'basis')
        loop: products.length > 3, 
      }}
      className="w-full"
    >
      <CarouselContent>
        {/* 4. Mapeia a lista de produtos recebida via props */}
        {products.map((product) => (
          // Define o tamanho de cada item no carrossel
          <CarouselItem key={product.idProduto} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
            <div className="p-1">
              <Card className="h-full flex flex-col">
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  {/* Usa os dados corretos do produto */}
                  <img
                    src={product.imagemUrl}
                    alt={product.nomeProduto}
                    className="w-full h-full object-contain"
                  />
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-4 mt-auto">
                  <h3 className="font-semibold text-lg truncate w-full" title={product.nomeProduto}>
                    {product.nomeProduto}
                  </h3>
                  <p className="font-bold text-xl">R$ {product.preco.toFixed(2)}</p>
                  <Button asChild className="w-full">
                    {/* Cria um link dinâmico para a página do produto */}
                    <Link to={`/produto/${product.idProduto}`}>
                      Ver Produto
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Setas de navegação */}
      <CarouselPrevious className="ml-12" />
      <CarouselNext className="mr-12" />
    </Carousel>
  );
}