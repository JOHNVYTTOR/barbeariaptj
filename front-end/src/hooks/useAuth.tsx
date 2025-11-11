import React, { createContext, useContext, useState } from "react";

// Tipos do usuário
export interface TipoUsuario {
  id: number;
  nomeTipoUsuario: "Usuario" | "Admin";
}

export interface User {
  idUsuario: number;
  nomeUsuario: string;
  email: string;
  senha: string;
  tipoUsuario: TipoUsuario; 
  telefone: string;
  cpf: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("usuarioLogado");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as User;
    } catch {
      localStorage.removeItem("usuarioLogado");
      return null;
    }
  });

  // Função de login
  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("usuarioLogado", JSON.stringify(newUser));
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("usuarioLogado");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o AuthContext
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return ctx;
};

export default AuthProvider;
