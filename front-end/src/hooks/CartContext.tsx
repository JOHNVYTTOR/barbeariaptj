import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

// A interface do produto deve ser a MESMA da Loja.tsx e Carrinho.tsx
interface Produto {
  idProduto: number;
  nomeProduto: string;
  descricao: string;
  preco: number;
  estoque: number; // Estoque
  imgUrl: string;
}

// Interface para o item dentro do carrinho (Produto + quantidade)
interface CartItem extends Produto {
  quantity: number;
}

// Interface para o valor que o contexto vai fornecer
interface CartContextType {
  cartItems: CartItem[];
  addItem: (produto: Produto, quantity: number) => void;
  removeFromCart: (idProduto: number) => void;
  clearCart: () => void;
  increaseQuantity: (idProduto: number) => void; // <-- ADICIONADO
  decreaseQuantity: (idProduto: number) => void; // <-- ADICIONADO
}

// --- Criação do Contexto ---
// @ts-ignore: Começa como undefined mas será sempre provido
const CartContext = createContext<CartContextType>(undefined);

// --- Hook customizado para usar o contexto ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

// --- Componente Provedor ---
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Tenta carregar o carrinho do localStorage ao iniciar
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const item = window.localStorage.getItem('cartItems');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Erro ao carregar carrinho do localStorage:", error);
      return [];
    }
  });

  // Salva o carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    try {
      window.localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Erro ao salvar carrinho no localStorage:", error);
    }
  }, [cartItems]);

  // Adicionar item (usado pela Loja)
  const addItem = (produto: Produto, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.idProduto === produto.idProduto);

      if (existingItem) {
        // Se já existe, atualiza a quantidade (respeitando o estoque)
        const newQuantity = Math.min(existingItem.quantity + quantity, produto.estoque);
        if (newQuantity === existingItem.quantity) {
          toast.warning(`Você já atingiu o limite de estoque (${produto.estoque}) para este item.`);
        }
        return prevItems.map(item =>
          item.idProduto === produto.idProduto
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Se não existe, adiciona
        return [...prevItems, { ...produto, quantity: quantity }];
      }
    });
  };

  // Remover item (usado pelo Carrinho)
  const removeFromCart = (idProduto: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.idProduto !== idProduto));
    toast.error("Item removido do carrinho.");
  };

  // Limpar o carrinho (usado pelo Carrinho após o pedido)
  const clearCart = () => {
    setCartItems([]);
  };

  // ===== INÍCIO DA CORREÇÃO =====

  // Aumentar quantidade (usado pelo Carrinho)
  const increaseQuantity = (idProduto: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.idProduto === idProduto && item.quantity < item.estoque) // Verifica o estoque
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Diminuir quantidade (usado pelo Carrinho)
  const decreaseQuantity = (idProduto: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.idProduto === idProduto && item.quantity > 1) // Não deixa ser menor que 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0) // Garante que o item não fique com 0 (opcional, mas bom)
    );
  };

  // Objeto de valor que o provedor vai fornecer
  const value = {
    cartItems,
    addItem,
    removeFromCart,
    clearCart,
    increaseQuantity, // <-- Adicionado ao valor
    decreaseQuantity  // <-- Adicionado ao valor
  };

  // ===== FIM DA CORREÇÃO =====

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

