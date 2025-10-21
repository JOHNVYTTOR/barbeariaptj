import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Importa o toast do Sonner
import { Home } from "lucide-react"; // ATENÇÃO: Trocado ArrowLeft por Home
import { useAuth } from "@/hooks/useAuth";
import api from '../api.ts'
import { AxiosError } from "axios";

import logoBlur from "@/assets/logo-blur-bg.png";
import logoImage from "@/assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
if (!email || !password) {
toast.error("Erro no Login", { description: "Por favor, preencha todos os campos." });
return;
}

setLoading(true);

try {
// 4. Usar api.post ao invés de fetch
const response = await api.post('/auth/login', {
email,
password
});

// 5. Chamar a função login do context
// O response.data já é o JSON (ex: { token: "...", user: {...} })
login(response.data);

// O toast de sucesso e o redirecionamento agora são feitos DENTRO da função login()

} catch (error) {
// O interceptor já lida com 401 e erros de rede
// Este catch lida com outros erros (ex: 400 Bad Request)
if (error instanceof AxiosError && error.response) {
// Usa a mensagem de erro do backend (ex: "E-mail ou senha inválidos.")
// Note: O interceptor de 401 pode já ter lidado com isso
if (error.response.status !== 401) {
toast.error("Erro no Login", {
description: error.response.data.message || "E-mail ou senha inválidos.",
});
}
} else if (error instanceof Error) {
// Caso não seja um erro do axios
toast.error("Erro no Login", { description: error.message });
}
} finally {
setLoading(false);
}
};

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative text-white"
      style={{
        backgroundImage: `url(${logoBlur})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Botão de Voltar para a Página Inicial com ícone de Casinha */}
      {/* ATENÇÃO: Substituído ArrowLeft por Home */}
      <Link 
        to="/" // Leva para a página inicial
        className="absolute top-8 left-8 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-gray-700 
                   hover:bg-yellow-400 hover:text-black transition-colors shadow-lg"
      >
        <Home className="w-5 h-5 text-yellow-400 hover:text-black transition-colors" />
      </Link>
      
      <Card className="w-full max-w-md relative z-10 bg-transparent backdrop-blur-md border border-gray-700 shadow-2xl text-white">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={logoImage} 
              alt="Gabriel Rocha" 
              className="h-16 w-auto drop-shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-white">
            Faça já o seu login!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-100">E-mail:</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-100">Senha:</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md hover:shadow-yellow-400/40 transition-all"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-200">
            Não tem cadastro?{" "}
            <Link 
              to="/cadastro" 
              className="text-yellow-400 hover:underline font-medium"
            >
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;