import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Tipagem ---
// (Adapte esta interface 'Usuario' conforme sua entidade no backend)
interface TipoUsuario {
  idTipoUsuario: number;
  nomeTipoUsuario: string;
}

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
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const storedUserName = localStorage.getItem('userName');
      const storedUserRole = localStorage.getItem('userRole');
     
      // (Isso é uma simplificação. O ideal seria ter o objeto 'user' completo no storage)
      // Por enquanto, vamos recriar um objeto 'user' parcial.
      if (storedToken && storedUserName && storedUserRole) {
        setToken(storedToken);
        // Recria um objeto de usuário parcial com o que temos
        setUser({
            nome: storedUserName,
            tipoUsuario: { nomeTipoUsuario: storedUserRole }
            // Preencha outros campos com valores padrão ou nulos se necessário
        } as Usuario); // Usamos 'as' porque sabemos que é parcial
      }
    } catch (error) {
      console.error("Falha ao carregar dados de autenticação", error);
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

    // 2. Salva no localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userName', user.nome);
    localStorage.setItem('userRole', user.tipoUsuario.nomeTipoUsuario);
    // (O ideal é salvar o objeto user inteiro como string JSON)
    // localStorage.setItem('user', JSON.stringify(user));

    // 3. Redireciona
    if (user.tipoUsuario.nomeTipoUsuario === 'Admin') {
      navigate("/dashboard");
    } else {
      navigate("/");
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
    // localStorage.removeItem('user');

    // 3. Redireciona para o login
    navigate("/login");
  };

  const isAuthenticated = !!token; // Verdadeiro se o token existir

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
      {!loading && children} {/* Só renderiza os filhos quando o loading terminar */}
    </AuthContext.Provider>
  );
};

// 3. Cria o Hook (O que o usuário pediu)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};