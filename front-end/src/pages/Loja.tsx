import { Navigation } from "@/components/ui/navigation";
import { HeroCarousel } from "@/components/ui/lojass/HeroCarousel";
import { ProductCarousel } from "@/components/ui/lojass/ProductCarousel";
import pomadaImg from "@/assets/pomada_cabelo.png"; // Exemplo de imagem

// Dados de exemplo (interface igual à do ProductCarousel)
const exampleProducts = [
  { idProduto: 1, nomeProduto: "Pomada Exemplo 1", descricao: "Desc", preco: 25.9, stock: 10, imagemUrl: pomadaImg },
  { idProduto: 2, nomeProduto: "Pomada Exemplo 2", descricao: "Desc", preco: 30.0, stock: 5, imagemUrl: pomadaImg },
  { idProduto: 3, nomeProduto: "Pomada Exemplo 3", descricao: "Desc", preco: 28.5, stock: 8, imagemUrl: pomadaImg },
  { idProduto: 4, nomeProduto: "Pomada Exemplo 4", descricao: "Desc", preco: 22.0, stock: 12, imagemUrl: pomadaImg },
];


const Loja = () => {
  return (
    <div className="min-h-screen bg-barbershop-darker">
      <Navigation />
      <HeroCarousel /> 
      {/* --- Passando os dados de exemplo --- */}
      <ProductCarousel products={exampleProducts} /> 
    </div>
  );
};

export default Loja;