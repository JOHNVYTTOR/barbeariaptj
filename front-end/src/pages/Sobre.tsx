import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Produto {
  idProduto: number;
  nomeProduto: string;
  descricao: string;
  preco: number;
  stock: number;
  imagemUrl: string;
}

interface SobreProps {
  products: Produto[];
}

const Sobre: React.FC<SobreProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6 text-white">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">Sobre Nós</h1>
      <Carousel
        opts={{ align: "start", loop: products.length > 3 }}
        className="w-full max-w-6xl"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.idProduto}
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="p-2">
                <Card className="h-full flex flex-col rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
                  <CardContent className="relative h-[300px] overflow-hidden">
                    <img
                      src={product.imagemUrl}
                      alt={product.nomeProduto}
                      className="absolute top-0 left-0 w-full h-full object-cover transform scale-105 transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent flex items-end px-4 pb-2"></div>
                  </CardContent>

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
                    <Button
                      asChild
                      className="w-full mt-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-yellow-400 hover:text-black transition-all duration-300"
                    >
                      <Link to={`/produto/${product.idProduto}`}>Ver Produto</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-12 text-yellow-400" />
        <CarouselNext className="mr-12 text-yellow-400" />
      </Carousel>
    </div>
  );
};

export default Sobre;
