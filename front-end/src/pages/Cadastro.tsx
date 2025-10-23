import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api }from "../api.ts";
import { toast } from "sonner";
import { Navigation } from "@/components/ui/navigation";

const formSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    cpf: z.string().length(11, "O CPF deve ter 11 dígitos"),
    telefone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos"),
});

const Cadastro = () => {
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: "",
            email: "",
            password: "",
            cpf: "",
            telefone: "",
        },
    });

    async function handleCadastro(data: z.infer<typeof formSchema>) {
        try {
            // --- ALTERAÇÃO AQUI ---
            // 1. Endpoint corrigido para '/usuarios/auth/register'
            // 2. Objeto 'tipoUsuario' removido (backend cuida disso)
            await api.post('/usuarios/register', { 
                nome: data.nome,
                email: data.email,
                senha: data.password,
                cpf: data.cpf,
                telefone: data.telefone
            });
            // --- FIM DA ALTERAÇÃO ---

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
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Navigation />
            <div className="container mx-auto flex items-center justify-center min-h-screen pt-20">
                <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-yellow-400">Criar Conta</h1>
                        <p className="text-gray-400">Preencha os campos para se cadastrar</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCadastro)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu nome completo" {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                                            <Input type="email" placeholder="seuemail@exemplo.com" {...field} className="bg-gray-700 border-gray-600 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Sua senha" {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                                            <Input placeholder="12345678900" {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                                            <Input placeholder="(11) 98765-4321" {...field} className="bg-gray-700 border-gray-600 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
                                Cadastrar
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center text-gray-400">
                        <p>Já tem uma conta? <Link to="/login" className="text-yellow-400 hover:underline">Faça login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cadastro;