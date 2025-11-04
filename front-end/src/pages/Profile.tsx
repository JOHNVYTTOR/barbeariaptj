import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Import do hook
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // 👈 Inicializa o hook de navegação

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado com sucesso!",
      description: "As alterações foram salvas no seu perfil.",
    });
  };

  // 👇 Função de logout com redirecionamento
  const handleLogout = () => {
    logout();
    navigate("/"); // Redireciona para a página inicial
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Editar Perfil</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nomeUsuario"
                name="nomeUsuario"
                value={formData.nomeUsuario}
                onChange={handleChange}
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seuemail@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Salvar Alterações
            </Button>

            {user && (
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={handleLogout} // 👈 Agora chama a função que redireciona
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
