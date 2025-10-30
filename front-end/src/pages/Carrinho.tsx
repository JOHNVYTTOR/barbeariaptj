import { useState } from 'react';
import { useCart } from "../hooks/CartContext"; // Puxa os dados do carrinho
import { useAuth } from "../hooks/useAuth"; // Puxa os dados do usuário logado
import { api } from '../api'; // Para enviar o pedido ao backend
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

// A interface do produto deve ser a MESMA da Loja.tsx
interface Produto {
  idProduto: number;
  nomeProduto: string;
  descricao: string;
  preco: number;
  estoque: number;
  imgUrl: string;
}

const Carrinho = () => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { user } = useAuth(); // Pega o usuário logado
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Calcula o preço total
  const totalPrice = cartItems.reduce((total, item) => total + (item.preco * item.quantity), 0);

  // Função para finalizar o pedido (Reserva)
  const handleConfirmOrder = async () => {
    // 1. Verifica se o usuário está logado
    if (!user) {
      toast.error("Você precisa estar logado para confirmar sua reserva.", {
        description: "Você será redirecionado para o login.",
      });
      navigate("/login");
      return;
    }

    // 2. Verifica se o carrinho não está vazio
    if (cartItems.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    setIsLoading(true);

    // 3. Prepara os dados para o backend
    // (O backend deve esperar um ID de usuário e uma lista de itens)
    const pedidoPayload = {
      idUsuario: user.idUsuario,
      itens: cartItems.map(item => ({
        idProduto: item.idProduto,
        quantidade: item.quantity,
        precoUnitario: item.preco // Envia o preço para registro
      })),
      valorTotal: totalPrice
    };

    try {
      // 4. Envia o pedido para o backend
      // (Você precisará criar este endpoint '/pedidos' no seu backend)
      await api.post('/pedidos', pedidoPayload);

      toast.success("Reserva confirmada com sucesso!", {
        description: "Seus produtos estão separados. Pague e retire no local.",
      });
      
      clearCart(); // Limpa o carrinho
      navigate("/"); // Redireciona para a Home

    } catch (error) {
      console.error("Erro ao confirmar pedido:", error);
      toast.error("Falha ao confirmar sua reserva.", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-barbershop-darker text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto pt-20"> {/* pt-20 para o menu fixo */}
        
        <h1 className="text-4xl font-bold mb-8 text-center">
          Meu <span className="text-yellow-400">Carrinho</span>
        </h1>

        {cartItems.length === 0 ? (
          // --- CARRINHO VAZIO ---
          <Card className="border-gray-700 bg-gray-800 shadow-lg text-center p-10">
            <CardTitle className="text-2xl text-gray-300 mb-4">Seu carrinho está vazio.</CardTitle>
            <p className="text-gray-400 mb-6">Que tal adicionar alguns produtos?</p>
            <Button asChild className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300">
              <Link to="/loja">
                <ArrowLeft size={20} className="mr-2" />
                Voltar para a Loja
              </Link>
            </Button>
          </Card>
        ) : (
          // --- CARRINHO CHEIO ---
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Coluna 1: Itens do Carrinho */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.idProduto} className="border-gray-700 bg-gray-800 shadow-lg flex items-center p-4">
                  <img
                    src={item.imgUrl}
                    alt={item.nomeProduto}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-gray-700"
                  />
                  <div className="flex-grow mx-4">
                    <h3 className="text-lg font-semibold text-white">{item.nomeProduto}</h3>
                    <p className="text-sm text-gray-400">Preço: R$ {item.preco.toFixed(2)}</p>
                    <p className="text-md font-bold text-yellow-400 mt-1">
                      Subtotal: R$ {(item.preco * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Controles de Quantidade */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-white border-gray-600 hover:bg-gray-700"
                      onClick={() => decreaseQuantity(item.idProduto)}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-white border-gray-600 hover:bg-gray-700"
                      onClick={() => increaseQuantity(item.idProduto)}
                      disabled={item.quantity >= item.estoque} // Desativa se a qtd for igual ao estoque
                    >
                      <Plus size={16} />
                    </Button>
                  </div>

                  {/* Botão Remover */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-400 hover:bg-gray-700 ml-2"
                    onClick={() => removeFromCart(item.idProduto)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </Card>
              ))}
            </div>

            {/* Coluna 2: Resumo do Pedido */}
            <div className="lg:col-span-1">
              <Card className="border-gray-700 bg-gray-800 shadow-lg sticky top-28"> {/* sticky top para fixar o resumo */}
                <CardHeader>
                  <CardTitle className="text-2xl text-yellow-400">Resumo da Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-lg text-gray-300">
                    <span>Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Taxa de Entrega</span>
                    <span>Retirar no Local</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-2xl font-bold text-white">
                      <span>Total</span>
                      <span>R$ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center pt-2">
                    O pagamento será realizado no estabelecimento.
                  </p>

                  <Button 
                    className="w-full text-lg p-6 bg-yellow-400 text-black font-bold hover:bg-yellow-300"
                    onClick={handleConfirmOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? "Confirmando..." : "Confirmar Reserva"}
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Carrinho;

