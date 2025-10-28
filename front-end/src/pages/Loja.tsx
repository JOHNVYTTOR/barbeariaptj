import { Navigation } from "@/components/ui/navigation";
import { HeroCarousel } from "@/components/ui/lojass/HeroCarousel";
import { ProductCarousel } from "@/components/ui/lojass/ProductCarousel";
import pomadaImg from "@/assets/pomada_cabelo.png"; 
import pomadaImg02 from "@/assets/produtoLoja02.png"; 
import pomadaImg03 from "@/assets/produtoLoja03.png"; 
import pomadaImg04 from "@/assets/produtoLoja04.png"; 

// Dados de exemplo (interface igual à do ProductCarousel)
const exampleProducts = [
  { idProduto: 1, nomeProduto: "Pomada Capilar", descricao: "Desc", preco: 25.9, stock: 10, imagemUrl: pomadaImg },
  { idProduto: 2, nomeProduto: "Pomada Exemplo 2", descricao: "Desc", preco: 30.0, stock: 5, imagemUrl: pomadaImg02 },
  { idProduto: 3, nomeProduto: "Pomada Exemplo 3", descricao: "Desc", preco: 28.5, stock: 8, imagemUrl: pomadaImg03 },
  { idProduto: 4, nomeProduto: "Pomada Exemplo 4", descricao: "Desc", preco: 22.0, stock: 12, imagemUrl: pomadaImg04},
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