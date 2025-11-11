import { useState, useEffect } from 'react';
import { Navigation } from "../components/ui/navigation"; // Corrigido
import { HeroCarousel } from "../components/ui/lojass/HeroCarousel"; // Corrigido
import { ProductCarousel } from "../components/ui/lojass/ProductCarousel"; // Corrigido
import { api } from '../api.ts'; // Corrigido

// --- Interface para o Produto ---
// Sincronizada com o DashboardAdmin.tsx
interface Produto {
  idProduto: number;
  nomeProduto: string;
  descricao: string;
  preco: number;
  estoque: number;
  imgUrl: string;
}

const Loja = () => {
  // --- Estados ---
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Efeito para Buscar Dados ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Presume que o endpoint de produtos no backend é '/produtos'
        const response = await api.get('/produtos'); 
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar os produtos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // --- Renderização Condicional do Carrossel ---
  const renderProductCarousel = () => {
    if (isLoading) {
      return <div className="text-center p-10 text-white">Carregando produtos...</div>;
    }

    if (error) {
      return <div className="text-center p-10 text-red-400">{error}</div>;
    }

    if (products.length === 0) {
      return <div className="text-center p-10 text-gray-400">Nenhum produto encontrado.</div>;
    }

    // Passa os produtos buscados do backend para o carrossel
    return <ProductCarousel products={products}/>; 
  };

  return (
    <div className="min-h-screen bg-barbershop-darker">
      <Navigation />
      <HeroCarousel /> 
      {renderProductCarousel()}
    </div>
  );
};

export default Loja;


