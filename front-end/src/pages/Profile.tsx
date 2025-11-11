import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"; // Mantido o use-toast
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api"; // 1. Importar a API

export default function Profile() {
  // 2. Pegar a função 'login' para ATUALIZAR o usuário logado
  const { user, logout, login } = useAuth(); 
  const navigate = useNavigate();
  const { toast } = useToast(); // Mantido o use-toast
  const [isLoading, setIsLoading] = useState(false); // Estado de loading

  const [formData, setFormData] = useState({
    nomeUsuario: user?.nomeUsuario || "",
    email: user?.email || "",
    cpf: user?.cpf || "",
    telefone: user?.telefone || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nomeUsuario: user.nomeUsuario || "",
        email: user.email || "",
        cpf: user.cpf || "",
        telefone: user.telefone || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Atualizar a função handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // Se não tiver usuário, não faz nada

    setIsLoading(true);

    // 4. Preparar o payload (dados para enviar)
    // O back-end precisa de TODOS os campos, mesmo os que não mudaram
    const payload = {
      idUsuario: user.idUsuario,
      nomeUsuario: formData.nomeUsuario,
      email: formData.email,
      telefone: formData.telefone,
      cpf: user.cpf, // CPF não muda
      tipoUsuario: user.tipoUsuario, // 'tipoUsuario' também não muda aqui
      // A senha não é enviada, então o back-end (que arrumamos) vai mantê-la
    };

    try {
      // 5. Chamar a API (a mesma do Dashboard)
      const response = await api.put(`/usuarios/${user.idUsuario}`, payload);

      // 6. Atualizar o usuário no app (useAuth) com os dados novos
      login(response.data); 

      toast({
        title: "Perfil atualizado com sucesso!",
        description: "As alterações foram salvas no seu perfil.",
      });

    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      const errorMsg = error.response?.data?.message || error.message || "Erro desconhecido";
      toast({
        title: "Erro ao atualizar",
        description: `Não foi possível salvar: ${errorMsg}`,
        variant: "destructive", // Mostra o toast com cor de erro
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/"); 
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl bg-gray-900 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-yellow-400">Editar Perfil</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nomeUsuario" className="text-gray-300">Nome</Label>
              <Input
                id="nomeUsuario"
                name="nomeUsuario"
                value={formData.nomeUsuario}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                className="bg-gray-800 border-gray-700 focus:ring-yellow-400"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seuemail@email.com"
                required
                className="bg-gray-800 border-gray-700 focus:ring-yellow-400"
              />
            </div>

            <div>
              <Label htmlFor="cpf" className="text-gray-300">CPF (não pode ser alterado)</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                disabled // Desabilitado para edição
                className="bg-gray-800 border-gray-700 opacity-70"
              />
            </div>

            <div>
              <Label htmlFor="telefone" className="text-gray-300">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="bg-gray-800 border-gray-700 focus:ring-yellow-400"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>

            {user && (
              <Button
                type="button"
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handleLogout} 
              >
                Sair da Conta
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}