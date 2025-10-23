// AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api'; // Importa a instância do axios

// --- Tipagem (Baseada nas suas Entidades Java) ---

interface TipoUsuario {
  idTipoUsuario: number;
  nomeTipoUsuario: string;
}

// Este é o usuário que vem do backend
interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipoUsuario: TipoUsuario;
}

// O que o backend retorna no login (/auth/login)
interface AuthResponse {
  token: string;
  user: Usuario;
}

// O que o nosso contexto vai fornecer
interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  loading: boolean; // Para sabermos se está carregando o estado inicial
}
// -----------------

// 1. Cria o Contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Cria o Provedor (Provider)
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Começa carregando
  const navigate = useNavigate();

  // Efeito para carregar o estado do localStorage na inicialização
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user'); // Busca APENAS o objeto user
      
      // Verifica se os dados essenciais existem E se não são a string "undefined"
      if (storedToken && storedToken !== 'undefined' && 
          storedUser && storedUser !== 'undefined') {
        
        // Faz o parse apenas dos dados essenciais
        const parsedUser: Usuario = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Sincroniza o token no header do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      } else {
        // Se os dados forem inválidos (null ou "undefined"), 
        // limpa apenas os dados essenciais.
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }

    } catch (error) {
      // Captura erros de JSON.parse (ex: dados corrompidos)
      console.error("Falha ao carregar dados de autenticação (JSON inválido)", error);
      // Limpa storage inválido/corrompido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      // Garante que o app seja liberado após a verificação
      setLoading(false); 
    }
  }, []); // Array vazio garante que rode apenas uma vez, na inicialização

  // Função de Login
  const login = (data: AuthResponse) => {
    const { token, user } = data;
    
    // 1. Salva no React State (Reatividade imediata)
    setUser(user);
    setToken(token);

    // 2. Salva no localStorage (APENAS o essencial)
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user)); // Salva o objeto usuário

    // 3. Define o token nos headers padrão do axios
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 4. Redireciona com base no tipo de usuário
    // (Acessamos o tipo de usuário a partir do objeto 'user')
    if (user.tipoUsuario.nomeTipoUsuario === 'Admin') {
      navigate("/dashboard");
    } else {
      navigate("/"); // Redireciona cliente para a home
    }
  };

  // Função de Logout
  const logout = () => {
    // 1. Limpa o React State
    setUser(null);
    setToken(null);

    // 2. Limpa o localStorage (APENAS o essencial)
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // 3. Remove o token dos headers do axios
    delete api.defaults.headers.common['Authorization'];

    // 4. Redireciona para o login
    navigate("/login");
  };

  // Valor booleano simples para verificar se está autenticado
  const isAuthenticated = !!token; 

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
      {/* Não renderiza os componentes filhos (rotas, etc.) 
        enquanto a autenticação inicial do localStorage não for verificada.
      */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// 3. Hook customizado (Recomendado)
// Facilita o uso do contexto nos componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};