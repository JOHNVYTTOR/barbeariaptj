import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Check, Edit, Plus, Search, Trash, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Sidebar } from '@/components/ui/sidebar';
import { toast } from "sonner";
import{api} from '@/api';
import { format } from 'date-fns'; // Para formatar a data para a API
import { ptBR } from 'date-fns/locale';

// --- Tipos de Dados (Interfaces do Backend) ---
interface TipoUsuario {
  id: number;
  nomeTipoUsuario: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoUsuario: TipoUsuario;
}

interface Servico {
  id: number;
  nome: string;
  preco: number;
  duracao: number; // em minutos
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}

interface Agendamento {
  id: number;
  dataHora: string; // Vem como ISO string
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  cliente: Usuario;
  servico: Servico;
}

interface HorarioDisponivel {
  id: number | null; // ID pode ser nulo se for um novo horário
  data: string; // Formato YYYY-MM-DD
  horario: string; // Formato HH:MM
  disponivel: boolean;
}

// --- Componente Principal do Dashboard ---
const Dashboard = () => {
  // --- Estados de Dados ---
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [servicoDialogAberto, setServicoDialogAberto] = useState(false);
  const [produtoDialogAberto, setProdutoDialogAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Partial<Servico> | null>(null);
  const [produtoEditando, setProdutoEditando] = useState<Partial<Produto> | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [novoHorario, setNovoHorario] = useState("");

  // --- Funções de Busca (Fetch) ---
  const fetchAgendamentos = useCallback(async () => {
    try {
      const response = await api.get('/agendamentos');
      setAgendamentos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar agendamentos.');
    }
  }, []);

  const fetchServicos = useCallback(async () => {
    try {
      const response = await api.get('/servicos');
      setServicos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar serviços.');
    }
  }, []);

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar produtos.');
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const response = await api.get('/usuarios');
      // Filtra para mostrar apenas clientes
      setClientes(response.data.filter((u: Usuario) => u.tipoUsuario.nomeTipoUsuario === 'Cliente'));
    } catch (error) {
      toast.error('Erro ao buscar clientes.');
    }
  }, []);

  const fetchHorarios = useCallback(async (data: Date) => {
    try {
      const dataFormatada = format(data, 'yyyy-MM-dd');
      const response = await api.get(`/horarios-disponiveis/data/${dataFormatada}`);
      setHorarios(response.data.sort((a: HorarioDisponivel, b: HorarioDisponivel) => a.horario.localeCompare(b.horario)));
    } catch (error) {
      setHorarios([]); // Limpa os horários se der erro
      toast.info('Nenhum horário cadastrado para este dia.');
    }
  }, []);

  // --- Efeito de Carregamento Inicial ---
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAgendamentos(),
        fetchServicos(),
        fetchProdutos(),
        fetchClientes(),
        fetchHorarios(dataSelecionada || new Date())
      ]);
      setLoading(false);
    };
    loadDashboardData();
  }, [fetchAgendamentos, fetchServicos, fetchProdutos, fetchClientes, fetchHorarios, dataSelecionada]);

  // Efeito para recarregar horários quando a data muda
  useEffect(() => {
    if (dataSelecionada) {
      fetchHorarios(dataSelecionada);
    }
  }, [dataSelecionada, fetchHorarios]);

  // --- Handlers de Ações (CRUD) ---

  // Agendamentos
  const handleUpdateAgendamentoStatus = async (agendamento: Agendamento, status: 'Concluído' | 'Cancelado') => {
    try {
      // O backend service só atualiza status e dataHora, é seguro enviar o objeto parcial
      await api.put(`/agendamentos/${agendamento.id}`, { status: status });
      toast.success(`Agendamento ${status.toLowerCase()}!`);
      fetchAgendamentos();
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  // Serviços
  const handleSaveServico = async (formData: Partial<Servico>) => {
    try {
      if (formData.id) {
        // Editar
        await api.put(`/servicos/${formData.id}`, formData);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        // Criar
        await api.post('/servicos', formData);
        toast.success('Serviço criado com sucesso!');
      }
      setServicoDialogAberto(false);
      fetchServicos();
    } catch (error) {
      toast.error('Erro ao salvar serviço.');
    }
  };

  const handleDeleteServico = async (id: number) => {
    try {
      await api.delete(`/servicos/${id}`);
      toast.success('Serviço excluído com sucesso!');
      fetchServicos();
    } catch (error) {
      toast.error('Erro ao excluir serviço.');
    }
  };

  // Produtos
  const handleSaveProduto = async (formData: Partial<Produto>) => {
    try {
      if (formData.id) {
        // Editar
        await api.put(`/produtos/${formData.id}`, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar
        await api.post('/produtos', formData);
        toast.success('Produto criado com sucesso!');
      }
      setProdutoDialogAberto(false);
      fetchProdutos();
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    }
  };

  const handleDeleteProduto = async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`);
      toast.success('Produto excluído com sucesso!');
      fetchProdutos();
    } catch (error) {
      toast.error('Erro ao excluir produto.');
    }
  };
  
  // Clientes
  const handleDeleteCliente = async (id: number) => {
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Cliente excluído com sucesso!');
      fetchClientes();
    } catch (error) {
      toast.error('Erro ao excluir cliente.');
    }
  };

  // Horários
  const handleToggleHorario = (index: number) => {
    const novosHorarios = [...horarios];
    novosHorarios[index].disponivel = !novosHorarios[index].disponivel;
    setHorarios(novosHorarios);
  };

  const handleAdicionarHorario = async () => {
    if (!dataSelecionada) return;
    if (novoHorario && /^[0-2]?[0-9]:[0-5][0-9]$/.test(novoHorario)) {
      try {
        const dataFormatada = format(dataSelecionada, 'yyyy-MM-dd');
        await api.post('/horarios-disponiveis', {
          data: dataFormatada,
          horario: novoHorario,
          disponivel: true
        });
        toast.success("Horário adicionado!");
        setNovoHorario(""); // Limpa o input
        fetchHorarios(dataSelecionada); // Recarrega a lista
      } catch (error) {
        toast.error('Erro ao adicionar horário.');
      }
    } else {
      toast.error("Formato de horário inválido. Use HH:MM (ex: 19:30).");
    }
  };

  const handleSalvarHorarios = async () => {
    try {
      // O endpoint /salvar-lista aceita a lista inteira
      await api.post('/horarios-disponiveis/salvar-lista', horarios);
      toast.success('Horários salvos com sucesso!');
      if (dataSelecionada) fetchHorarios(dataSelecionada);
    } catch (error) {
      toast.error('Erro ao salvar alterações nos horários.');
    }
  };

  // --- Handlers de UI ---
  const handleEditarServicoClick = (servico: Servico) => {
    setServicoEditando(servico);
    setServicoDialogAberto(true);
  };

  const handleNovoServicoClick = () => {
    setServicoEditando(null); // Limpa o estado de edição
    setServicoDialogAberto(true);
  };

  const handleEditarProdutoClick = (produto: Produto) => {
    setProdutoEditando(produto);
    setProdutoDialogAberto(true);
  };

  const handleNovoProdutoClick = () => {
    setProdutoEditando(null); // Limpa o estado de edição
    setProdutoDialogAberto(true);
  };

  // ----- JSX DO DASHBOARD -----
  if (loading && !servicoDialogAberto && !produtoDialogAberto) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white items-center justify-center">
        <p>Carregando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">Dashboard</h1>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Bell className="h-6 w-6" />
          </Button>
        </header>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700 border">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
          </TabsList>

          {/* === Aba: Visão Geral === */}
          <TabsContent value="overview" className="mt-6">
            <div className="mb-6">
              <Card className="bg-gray-800 border-gray-700 text-white max-w-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agendamentos Pendentes (Hoje)</CardTitle>
                  <Check className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {agendamentos.filter(a => 
                      new Date(a.dataHora).toLocaleDateString() === new Date().toLocaleDateString() &&
                      a.status === 'Pendente'
                    ).length}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Próximos Agendamentos (Pendentes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <TabelaAgendamentos 
                    data={agendamentos.filter(a => a.status === 'Pendente')} 
                    onUpdateStatus={handleUpdateAgendamentoStatus}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === Aba: Agendamentos === */}
          <TabsContent value="agendamentos" className="mt-6">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-yellow-400">Gerenciar Agendamentos</CardTitle>
                {/* Você pode adicionar um filtro de busca aqui depois */}
              </CardHeader>
              <CardContent>
                <TabelaAgendamentos data={agendamentos} onUpdateStatus={handleUpdateAgendamentoStatus} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Aba: Serviços === */}
          <TabsContent value="servicos" className="mt-6">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-yellow-400">Gerenciar Serviços</CardTitle>
                <Button onClick={handleNovoServicoClick} className="bg-yellow-400 text-black hover:bg-yellow-300">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Serviço
                </Button>
              </CardHeader>
              <CardContent>
                <TabelaServicos data={servicos} onEdit={handleEditarServicoClick} onDelete={handleDeleteServico} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Aba: Produtos === */}
          <TabsContent value="produtos" className="mt-6">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-yellow-400">Gerenciar Produtos da Loja</CardTitle>
                <Button onClick={handleNovoProdutoClick} className="bg-yellow-400 text-black hover:bg-yellow-300">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
                </Button>
              </CardHeader>
              <CardContent>
                <TabelaProdutos data={produtos} onEdit={handleEditarProdutoClick} onDelete={handleDeleteProduto} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* === Aba: Horários === */}
          <TabsContent value="horarios" className="mt-6">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-400">Gerenciar Horários Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Selecione o dia</h3>
                  <Calendar
                    mode="single"
                    selected={dataSelecionada}
                    onSelect={setDataSelecionada}
                    className="rounded-md border bg-gray-700 border-gray-600"
                    locale={ptBR}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Horários de {dataSelecionada ? format(dataSelecionada, 'dd/MM/yyyy') : '...'}
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
                    {horarios.length > 0 ? horarios.map((h, index) => (
                      <div key={h.id || h.horario} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                        <Label htmlFor={`horario-${h.horario}`} className="text-base">
                          {h.horario}
                        </Label>
                        <Switch
                          id={`horario-${h.horario}`}
                          checked={h.disponivel}
                          onCheckedChange={() => handleToggleHorario(index)}
                          className="data-[state=checked]:bg-yellow-400"
                        />
                      </div>
                    )) : (
                      <p className='text-gray-400'>Nenhum horário encontrado para este dia.</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                    <Input
                      type="text"
                      placeholder="Novo horário (ex: 19:30)"
                      value={novoHorario}
                      onChange={(e) => setNovoHorario(e.target.value)}
                      className="bg-gray-700 border-gray-600"
                    />
                    <Button onClick={handleAdicionarHorario} className="bg-yellow-400 text-black hover:bg-yellow-300">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button onClick={handleSalvarHorarios} className="w-full mt-4 bg-green-500 text-white hover:bg-green-600">
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Aba: Clientes === */}
          <TabsContent value="clientes" className="mt-6">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-400">Gerenciar Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <TabelaClientes data={clientes} onDelete={handleDeleteCliente} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* --- Dialogs (Pop-ups) --- */}
        <ServicoDialog
          key={servicoEditando?.id || 'new'} // Força a recriação do dialog
          open={servicoDialogAberto}
          onOpenChange={setServicoDialogAberto}
          onSave={handleSaveServico}
          servico={servicoEditando}
        />
        <ProdutoDialog
          key={produtoEditando?.id || 'new'}
          open={produtoDialogAberto}
          onOpenChange={setProdutoDialogAberto}
          onSave={handleSaveProduto}
          produto={produtoEditando}
        />
      </main>
    </div>
  );
};

// --- Componentes de Tabela (Separados para organização) ---

interface TabelaAgendamentosProps {
  data: Agendamento[];
  onUpdateStatus: (agendamento: Agendamento, status: 'Concluído' | 'Cancelado') => void;
}
const TabelaAgendamentos: React.FC<TabelaAgendamentosProps> = ({ data, onUpdateStatus }) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-gray-700 border-gray-700">
        <TableHead className="text-white">Cliente</TableHead>
        <TableHead className="text-white">Data / Hora</TableHead>
        <TableHead className="text-white">Serviço</TableHead>
        <TableHead className="text-white">Status</TableHead>
        <TableHead className="text-right text-white">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((ag) => (
        <TableRow key={ag.id} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{ag.cliente.nome}</TableCell>
          <TableCell>{new Date(ag.dataHora).toLocaleString('pt-BR')}</TableCell>
          <TableCell>{ag.servico.nome}</TableCell>
          <TableCell>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              ag.status === 'Pendente' ? 'bg-yellow-400 text-black' :
              ag.status === 'Concluído' ? 'bg-green-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {ag.status}
            </span>
          </TableCell>
          <TableCell className="text-right space-x-2">
            {ag.status === 'Pendente' && (
              <>
                <Button onClick={() => onUpdateStatus(ag, 'Concluído')} variant="outline" size="icon" className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white">
                  <Check className="h-4 w-4" />
                </Button>
                <Button onClick={() => onUpdateStatus(ag, 'Cancelado')} variant="outline" size="icon" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

interface TabelaServicosProps {
  data: Servico[];
  onEdit: (s: Servico) => void;
  onDelete: (id: number) => void;
}
const TabelaServicos: React.FC<TabelaServicosProps> = ({ data, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-gray-700 border-gray-700">
        <TableHead className="text-white">Nome</TableHead>
        <TableHead className="text-white">Preço</TableHead>
        <TableHead className="text-white">Duração (min)</TableHead>
        <TableHead className="text-right text-white">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((s) => (
        <TableRow key={s.id} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{s.nome}</TableCell>
          <TableCell>R$ {s.preco.toFixed(2)}</TableCell>
          <TableCell>{s.duracao} min</TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(s)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black">
              <Edit className="h-4 w-4" />
            </Button>
            <BotaoExcluir onConfirm={() => onDelete(s.id)} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

interface TabelaProdutosProps {
  data: Produto[];
  onEdit: (p: Produto) => void;
  onDelete: (id: number) => void;
}
const TabelaProdutos: React.FC<TabelaProdutosProps> = ({ data, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-gray-700 border-gray-700">
        <TableHead className="text-white">Nome</TableHead>
        <TableHead className="text-white">Preço</TableHead>
        <TableHead className="text-white">Estoque</TableHead>
        <TableHead className="text-right text-white">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((p) => (
        <TableRow key={p.id} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{p.nome}</TableCell>
          <TableCell>R$ {p.preco.toFixed(2)}</TableCell>
          <TableCell>{p.estoque}</TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(p)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black">
              <Edit className="h-4 w-4" />
            </Button>
            <BotaoExcluir onConfirm={() => onDelete(p.id)} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

interface TabelaClientesProps {
  data: Usuario[];
  onDelete: (id: number) => void;
}
const TabelaClientes: React.FC<TabelaClientesProps> = ({ data, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-gray-700 border-gray-700">
        <TableHead className="text-white">Nome</TableHead>
        <TableHead className="text-white">Email</TableHead>
        <TableHead className="text-white">Telefone</TableHead>
        <TableHead className="text-right text-white">Ações</TableHead> 
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((c) => (
        <TableRow key={c.id} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{c.nome}</TableCell>
          <TableCell>{c.email}</TableCell>
          <TableCell>{c.telefone}</TableCell>
          <TableCell className="text-right">
            <BotaoExcluir onConfirm={() => onDelete(c.id)} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// --- Componentes de Dialog (Pop-up) ---

const BotaoExcluir: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline" size="icon" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
        <Trash className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
      <AlertDialogHeader>
        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
        <AlertDialogDescription className="text-gray-400">
          Essa ação não pode ser desfeita. Isso excluirá permanentemente o item.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 border-0">Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-red-500 hover:bg-red-600">Excluir</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// --- Dialogs de Formulário ---

interface ServicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Servico>) => void;
  servico: Partial<Servico> | null;
}
const ServicoDialog: React.FC<ServicoDialogProps> = ({ open, onOpenChange, onSave, servico }) => {
  const [formData, setFormData] = useState<Partial<Servico>>({ nome: '', preco: 0, duracao: 30 });

  useEffect(() => {
    if (servico) {
      setFormData(servico);
    } else {
      setFormData({ nome: '', preco: 0, duracao: 30 });
    }
  }, [servico, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-yellow-400">{servico ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome</Label>
              <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preco" className="text-right">Preço (R$)</Label>
              <Input id="preco" name="preco" type="number" value={formData.preco} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duracao" className="text-right">Duração (min)</Label>
              <Input id="duracao" name="duracao" type="number" value={formData.duracao} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="bg-gray-700 hover:bg-gray-600 border-0">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-300">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Produto>) => void;
  produto: Partial<Produto> | null;
}
const ProdutoDialog: React.FC<ProdutoDialogProps> = ({ open, onOpenChange, onSave, produto }) => {
  const [formData, setFormData] = useState<Partial<Produto>>({ nome: '', preco: 0, estoque: 0 });

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    } else {
      setFormData({ nome: '', preco: 0, estoque: 0 });
    }
  }, [produto, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-yellow-400">{produto ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome</Label>
              <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preco" className="text-right">Preço (R$)</Label>
              <Input id="preco" name="preco" type="number" value={formData.preco} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estoque" className="text-right">Estoque</Label>
              <Input id="estoque" name="estoque" type="number" value={formData.estoque} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="bg-gray-700 hover:bg-gray-600 border-0">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-300">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Dashboard;