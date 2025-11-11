import React, { createContext, useState, useEffect, ReactNode } from 'react'; // 1. Importações do React corrigidas
import { jwtDecode } from 'jwt-decode';
import { api } from '@/api';

// Definição da interface para o usuário (baseado no seu código de login)
interface User {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    tipoUsuario: {
        id: number;
        nomeTipoUsuario: string;
    };
    // Adicione 'iat' e 'exp' que vêm do token JWT
    iat: number;
    exp: number;
    sub: string; // Geralmente o email
}

// Definição da interface para o contexto
interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

// --- ESTA É A CORREÇÃO PRINCIPAL ---
// Adicionamos 'export' aqui para que o 'useAuth.tsx' possa importá-lo
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Definição da interface para as props do provider
interface AuthProviderProps {
    children: ReactNode;
}

// O 'AuthProvider' (que você já usa no main.tsx)
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken: User = jwtDecode(token);
                
                // Verifica se o token expirou
                if (decodedToken.exp * 1000 < Date.now()) {
                    logout(); // Desloga se expirado
                } else {
                    setUser(decodedToken);
                    // Lógica correta para verificar se é Admin
                    if (decodedToken.tipoUsuario?.nomeTipoUsuario === 'Admin') {
                        setIsAdmin(true);
                    }
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Erro ao decodificar token:", error);
                logout(); // Desloga se o token for inválido
            }
        }
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
            const decodedToken: User = jwtDecode(token);
            setUser(decodedToken);
            if (decodedToken.tipoUsuario?.nomeTipoUsuario === 'Admin') {
                setIsAdmin(true);
            }
        } catch (error) {
             console.error("Erro ao decodificar token no login:", error);
             setUser(user);
             if (user.tipoUsuario?.nomeTipoUsuario === 'Admin') {
                setIsAdmin(true);
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// A importação circular de 'useAuth' foi removida