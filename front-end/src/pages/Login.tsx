import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // ATENÇÃO: Trocado ArrowLeft por Home
import type { User } from "@/hooks/useAuth";
import { api } from '../api.ts'
import { toast } from "sonner";

import logoBlur from "@/assets/logo-blur-bg.png";
import logoImage from "@/assets/logo.png";

interface LoginProps {
  loginFn: (user: User) => void; // salva usuário no contexto global
}

interface FormData {
  email: string;
  senha: string;
}

const Login: React.FC<LoginProps> = ({ loginFn }) => {
  const [formData, setFormData] = useState<FormData>({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/usuarios/login", {
        email: formData.email,
        senha: formData.senha,
      });

      const user: User = res.data;

      if (!user) {
        toast.error("Email ou senha inválidos!");
        setLoading(false);
        return;
      }

      // Salva no contexto global e localStorage
      loginFn(user);
      localStorage.setItem("usuarioLogado", JSON.stringify(user));

      toast.success("Login realizado com sucesso")
      if (user.tipoUsuario?.nomeTipoUsuario === "Admin") {
        navigate("/dashboard"); // Admin vai para o Dashboard
      } else {
        navigate("/"); // Outros usuários vão para a Home
      }

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("Email ou senha inválidos.");
      } else {
        toast.error("Erro na autenticação. Tente novamente.");
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-100">E-mail:</Label>
              <Input
                name="email"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-100">Senha:</Label>
              <Input
                name="senha"
                id="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
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