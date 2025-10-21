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
  // Não inclua a senha!
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
// --- CORREÇÃO AQUI: Adicionado "export" ---
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// ------------------------------------------

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
      const storedUser = localStorage.getItem('user'); // Busca o usuário
      
      if (storedToken && storedUser) {
        const parsedUser: Usuario = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Sincroniza o token no header do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Falha ao carregar dados de autenticação", error);
      // Limpa storage inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false); // Termina o carregamento
    }
  }, []);

  // Função de Login
  const login = (data: AuthResponse) => {
    const { token, user } = data;
    
    // 1. Salva no React State
    setUser(user);
    setToken(token);

    // 2. Salva no localStorage (Salvando o usuário como JSON)
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    // (Os outros 'userName' e 'userRole' são redundantes se temos 'user')
    localStorage.setItem('userName', user.nome);
    localStorage.setItem('userRole', user.tipoUsuario.nomeTipoUsuario);


    // 3. Define o token nos headers padrão do axios para futuras requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 4. Redireciona
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

    // 2. Limpa o localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');

    // 3. Remove o token dos headers do axios
    delete api.defaults.headers.common['Authorization'];

    // 4. Redireciona para o login
    navigate("/login");
  };

  const isAuthenticated = !!token; // Verdadeiro se o token existir

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
      {!loading && children} {/* Só renderiza os filhos quando o loading terminar */}
    </AuthContext.Provider>
  );
};

// (Removi o hook 'useAuth' daqui, pois ele já está no seu próprio arquivo 'useAuth.tsx')