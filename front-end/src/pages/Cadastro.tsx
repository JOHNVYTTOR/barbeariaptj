import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Importa o toast do Sonner
import { ArrowLeft } from "lucide-react"; 
import { api } from '../api.ts'

import logoBlur from "@/assets/logo-blur-bg.png"; 
import logoImage from "@/assets/logo.png";

// =================================================================
// FUNÇÕES DE MÁSCARA
// =================================================================

// Máscara para CPF: 000.000.000-00 (máximo 11 dígitos)
const formatCPF = (value: string) => {
  // 1. Remove tudo que não for dígito
  const numericValue = value.replace(/\D/g, '').substring(0, 11); 
  
  // 2. Aplica a máscara
  return numericValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

// Máscara para Telefone: (00) 00000-0000 (máximo 11 dígitos, incluindo DDD)
const formatPhone = (value: string) => {
  // 1. Remove tudo que não for dígito
  const numericValue = value.replace(/\D/g, '').substring(0, 11);
  
  // 2. Aplica a máscara
  if (numericValue.length <= 10) { // Formato (00) 0000-0000
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
  } else { // Formato (00) 00000-0000 (celular)
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
  }
};


// =================================================================
// COMPONENTE CADASTRO
// =================================================================
interface FormData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
}

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name: string, value: string) => {
    let formattedValue = value;

    // 1. Aplica a máscara APENAS se for o campo CPF ou Telefone
    if (name === "cpf") {
        formattedValue = formatCPF(value);
    } else if (name === "telefone") {
        formattedValue = formatPhone(value);
    }
    
    // 2. Atualiza o estado com o valor (mascarado ou não)
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanCpf = formData.cpf.replace(/\D/g, '');
    const cleanTelefone = formData.telefone.replace(/\D/g, '');
    try {
      const response = await api.post("/usuarios/register", {
        nomeUsuario: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cpf: formData.cpf,
        telefone: formData.telefone,
      });

      alert("Cadastro realizado com sucesso!");
      localStorage.setItem("idUsuario", response.data.idUsuario);
      setFormData({
        nome: "",
        email: "",
        senha: "",
        cpf: "",
        telefone: "",
      });
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Falha ao cadastrar usuário. Tente novamente."
      );
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
      
      {/* Botão de Voltar para Login */}
      <Link 
        to="/login"
        className="absolute top-8 left-8 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-gray-700 
                   hover:bg-yellow-400 hover:text-black transition-colors shadow-lg"
      >
        <ArrowLeft className="w-5 h-5 text-yellow-400 hover:text-black transition-colors" />
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
            Cadastre-se conosco!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo Nome (mantido) */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-100">Nome:</Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome} 
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Seu nome completo"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            {/* Campo E-mail (mantido) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-100">E-mail:</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            {/* Campo CPF (com Máscara) */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-gray-100">CPF (Opcional):</Label>
              <Input
                id="cpf"
                type="text"
                // ATENÇÃO: Adicionado pattern e maxLength para acessibilidade e limitação
                pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                maxLength={14}
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            {/* Campo Telefone (com Máscara) */}
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-gray-100">Telefone (Opcional):</Label>
              <Input
                id="telefone"
                type="tel"
                // ATENÇÃO: Adicionado pattern e maxLength
                pattern="\(\d{2}\) \d{5}-\d{4}"
                maxLength={15} // (xx) xxxxx-xxxx
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Campos Senha (mantidos) */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-100">Senha:</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => handleChange("senha", e.target.value)}
                placeholder="Crie uma senha forte"
                className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
              />  
            </div>

            {/* Botão de Cadastro (mantido) */}
            <Button 
              type="submit" 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md hover:shadow-yellow-400/40 transition-all"
            >
              Cadastrar
            </Button>
          </form>
          
          {/* Link para Login (mantido) */}
          <div className="text-center text-sm text-gray-200">
            Já tem cadastro?{" "}
            <Link 
              to="/login" 
              className="text-yellow-400 hover:underline font-medium"
            >
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cadastro;