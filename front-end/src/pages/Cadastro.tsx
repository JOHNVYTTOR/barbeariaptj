import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { api } from "../api.ts";
import { toast } from "sonner";
import logoBlur from "@/assets/logo-blur-bg.png";
import logoImage from "@/assets/logo.png";
import { Home } from "lucide-react";

const formSchema = z.object({
  nomeUsuario: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  cpf: z.string().length(11, "O CPF deve ter 11 dígitos"),
  telefone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos"),
});

const Cadastro = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeUsuario: "",
      email: "",
      senha: "",
      cpf: "",
      telefone: "",
    },
  });

  async function handleCadastro(data: z.infer<typeof formSchema>) {
    try {
      await api.post('/usuarios/register', {
        nomeUsuario: data.nomeUsuario,
        email: data.email,
        senha: data.senha,
        cpf: data.cpf,
        telefone: data.telefone
      });

      toast.success("Cadastro realizado com sucesso!");
      navigate('/login');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error("Erro no Cadastro", {
        description: "Ocorreu um erro ao tentar cadastrar. Verifique os dados e tente novamente."
      });
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative text-white"
      style={{
        backgroundImage: `url(${logoBlur})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay escurecido */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Botão de voltar */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-gray-700 
                   hover:bg-yellow-400 hover:text-black transition-colors shadow-lg"
      >
        <Home className="w-5 h-5 text-yellow-400 hover:text-black transition-colors" />
      </Link>

      {/* Card central */}
      <div className="w-full max-w-md relative z-10 bg-transparent backdrop-blur-md border border-gray-700 shadow-2xl text-white rounded-lg p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={logoImage}
              alt="Gabriel Rocha"
              className="h-16 w-auto drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Criar Conta
          </h1>
          <p className="text-gray-300 text-sm">
            Preencha os campos para se cadastrar
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCadastro)} className="space-y-4">
            <FormField
              control={form.control}
              name="nomeUsuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome completo"
                      {...field}
                      className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      {...field}
                      className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Sua senha"
                      {...field}
                      className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345678900"
                      {...field}
                      className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 98765-4321"
                      {...field}
                      className="bg-white/10 text-white placeholder-gray-300 border border-gray-500 focus:ring-2 focus:ring-yellow-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md hover:shadow-yellow-400/40 transition-all"
            >
              Cadastrar
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-gray-200">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="text-yellow-400 hover:underline font-medium"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
