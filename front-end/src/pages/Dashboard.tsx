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
// import { Sidebar } from '@/components/ui/sidebar'; // Removido (correto)
import { toast } from "sonner";
import { api } from '@/api'; // Importa a instância configurada do Axios
import { format } from 'date-fns'; // Para formatar a data para a API
import { ptBR } from 'date-fns/locale'; // Para localização do calendário

// --- Tipos de Dados (Interfaces baseadas no seu Backend) ---
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
  idServico: number;
  nomeServico: string;
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
  idAgendamento: number;
  dataHora: string; // Vem como ISO string do backend
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  usuario: Usuario;
  servico: Servico;
}

interface HorarioDisponivel {
  idHorarioDisponivel: number | null; // ID pode ser nulo se for um novo horário não salvo ainda
  horarios: string; // Formato HH:MM
  disponivel: boolean;
  data: Date;
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
  const [servicoEditando, setServicoEditando] = useState<Partial<Servico> | null>(null); // Usar Partial para formulário
  const [produtoEditando, setProdutoEditando] = useState<Partial<Produto> | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [novoHorario, setNovoHorario] = useState("");

  // --- Funções de Busca (Fetch) ---
  const fetchAgendamentos = useCallback(async () => {
    try {
      const response = await api.get('/agendamentos'); // Endpoint do backend
      setAgendamentos(response.data);
    } catch (error) {
      console.error("Erro fetchAgendamentos:", error);
      toast.error('Erro ao buscar agendamentos.');
    }
  }, []);

  const fetchServicos = useCallback(async () => {
    try {
      const response = await api.get('/servicos'); // Endpoint do backend
      setServicos(response.data);
    } catch (error) {
      console.error("Erro fetchServicos:", error);
      toast.error('Erro ao buscar serviços.');
    }
  }, []);

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await api.get('/produtos'); // Endpoint do backend
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro fetchProdutos:", error);
      toast.error('Erro ao buscar produtos.');
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const response = await api.get('/usuarios'); // Endpoint do backend
      // Filtra no frontend para mostrar apenas usuários com tipo 'Cliente'
      setClientes(response.data.filter((u: Usuario) => u.tipoUsuario?.nomeTipoUsuario === 'Cliente'));
    } catch (error) {
      console.error("Erro fetchClientes:", error);
      toast.error('Erro ao buscar clientes.');
    }
  }, []);

  const fetchHorarios = useCallback(async (data: Date) => { try { const dataFormatada = format(data,
'yyyy-MM-dd'); const response = await api.get(`/horarios/disponiveis/${dataFormatada}`);
setHorarios(response.data); } catch (error: any) { setHorarios([]); if (error.response?.status !== 404)
{ console.error("Erro fetchHorarios:", error); toast.error('Erro ao buscar horários.'); } } }, []);


  // --- Efeito de Carregamento Inicial ---
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAgendamentos(),
        fetchServicos(),
        fetchProdutos(),
        fetchClientes(),
        // Carrega horários da data atual no início
        dataSelecionada ? fetchHorarios(dataSelecionada) : Promise.resolve()
      ]);
      setLoading(false);
    };
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependências removidas para rodar só uma vez no mount

  // Efeito para recarregar horários quando a data selecionada muda
  useEffect(() => {
    if (dataSelecionada) {
      fetchHorarios(dataSelecionada);
    }
  }, [dataSelecionada, fetchHorarios]);

  // --- Handlers de Ações (CRUD) ---

  // Agendamentos
  const handleUpdateAgendamentoStatus = async (agendamento: Agendamento, status: 'Concluído' | 'Cancelado') => {
    try {
      await api.put(`/agendamentos/${agendamento.idAgendamento}`, { ...agendamento, status: status });
      toast.success(`Agendamento ${status === 'Concluído' ? 'concluído' : 'cancelado'}!`);
      fetchAgendamentos(); // Rebusca a lista
    } catch (error) {
      console.error("Erro handleUpdateAgendamentoStatus:", error);
      toast.error('Erro ao atualizar status do agendamento.');
    }
  };

  // Serviços
  const handleSaveServico = async (formData: Partial<Servico>) => {
    if (!formData.nomeServico || !formData.preco || !formData.duracao) {
        toast.error("Preencha todos os campos do serviço.");
        return;
    }
    try {
      if (formData.idServico) {
        await api.put(`/servicos/${formData.idServico}`, formData);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await api.post('/servicos', formData);
        toast.success('Serviço criado com sucesso!');
      }
      setServicoDialogAberto(false);
      fetchServicos(); // Rebusca a lista
    } catch (error) {
      console.error("Erro handleSaveServico:", error);
      toast.error('Erro ao salvar serviço.');
    }
  };

  const handleDeleteServico = async (id: number) => {
    try {
      await api.delete(`/servicos/${id}`);
      toast.success('Serviço excluído com sucesso!');
      fetchServicos(); // Rebusca a lista
    } catch (error) {
      console.error("Erro handleDeleteServico:", error);
      toast.error('Erro ao excluir serviço. Verifique se ele não está sendo usado em agendamentos.');
    }
  };

  // Produtos
  const handleSaveProduto = async (formData: Partial<Produto>) => {
    if (!formData.nome || formData.preco === undefined || formData.estoque === undefined) {
        toast.error("Preencha todos os campos do produto.");
        return;
    }
    try {
      if (formData.id) {
        await api.put(`/produtos/${formData.id}`, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', formData);
        toast.success('Produto criado com sucesso!');
      }
      setProdutoDialogAberto(false);
      fetchProdutos(); // Rebusca a lista
    } catch (error) {
      console.error("Erro handleSaveProduto:", error);
      toast.error('Erro ao salvar produto.');
    }
  };

  const handleDeleteProduto = async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`);
      toast.success('Produto excluído com sucesso!');
      fetchProdutos(); // Rebusca a lista
    } catch (error) {
      console.error("Erro handleDeleteProduto:", error);
      toast.error('Erro ao excluir produto.');
    }
  };

  // Clientes
  const handleDeleteCliente = async (id: number) => {
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Cliente excluído com sucesso!');
      fetchClientes(); // Rebusca a lista
    } catch (error) {
      console.error("Erro handleDeleteCliente:", error);
      toast.error('Erro ao excluir cliente. Verifique se ele não possui agendamentos.');
    }
  };

  // Horários
  const handleToggleHorario = (index: number) => {
    const novosHorarios = [...horarios];
    novosHorarios[index].disponivel = !novosHorarios[index].disponivel;
    setHorarios(novosHorarios);
  };

  const handleAdicionarHorario = async () => { if (!dataSelecionada) { toast.error("Selecione uma data primeiro.");
    return; } if (!novoHorario || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(novoHorario)) {
toast.error("Formato inválido. Use HH:MM."); return; } const dataIso = `${format(dataSelecionada,
'yyyy-MM-dd')}T${novoHorario}:00`; try { await api.post('/horarios', { horarios: dataIso, disponivel:
true }); toast.success("Horário criado!"); setNovoHorario(""); fetchHorarios(dataSelecionada); }
catch (error) { console.error("Erro handleAdicionarHorario:", error); toast.error("Erro ao adicionar horário."); } }

  const handleSalvarHorarios = async () => { if (!dataSelecionada) return; try { await Promise.all(
horarios.map(h => api.put(`/horarios/${h.idHorarioDisponivel}/disponibilidade`, null, { params: { disponivel:
h.disponivel } }) ) ); toast.success("Horários atualizados!"); fetchHorarios(dataSelecionada); } catch
(error) { console.error("Erro handleSalvarHorarios:", error); toast.error("Erro ao salvar horários."); }
};

  // --- Handlers de UI (Abrir/Fechar Dialogs) ---
  const handleEditarServicoClick = (servico: Servico) => {
    setServicoEditando(servico);
    setServicoDialogAberto(true);
  };

  const handleNovoServicoClick = () => {
    setServicoEditando(null);
    setServicoDialogAberto(true);
  };

  const handleEditarProdutoClick = (produto: Produto) => {
    setProdutoEditando(produto);
    setProdutoDialogAberto(true);
  };

  const handleNovoProdutoClick = () => {
    setProdutoEditando(null);
    setProdutoDialogAberto(true);
  };

  // ----- JSX DO DASHBOARD -----
  if (loading && !servicoDialogAberto && !produtoDialogAberto) {
    return (
      <main className="flex-1 p-4 md:p-6 text-center text-white">Carregando Dashboard...</main>
    );
  }

  return (
    // *** MUDANÇA AQUI ***
    // Padding principal reduzido de 'p-6 md:p-10' para 'p-4 md:p-6'
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
      {/* Alterado para Grid de 3 colunas para forçar a centralização */}
      <header className="grid grid-cols-3 items-center mb-4">
        
        {/* Coluna 1: Vazia (para balancear) */}
        <div></div>
        
        {/* Coluna 2: Título Centralizado */}
        <h1 className="text-3xl font-bold text-yellow-400 text-center">
          Dashboard
        </h1>
        
        {/* Coluna 3: Ícone alinhado à direita */}
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Bell className="h-6 w-6" />
          </Button>
        </div>
      </header>

     <Tabs defaultValue="overview" className="w-full">
        {/* Adicionado 'flex-wrap' para lidar com a quebra de linha em telas menores */}
        <div className="flex justify-center flex-wrap">
          {/* Classes 'overflow-x-auto' e 'whitespace-nowrap' REMOVIDAS para tirar a barra de rolagem */}
          <TabsList className="bg-gray-800 border-gray-700 border mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
          </TabsList>
        </div>

        {/* === Aba: Visão Geral === */}
        {/* *** MUDANÇA AQUI *** (Margem superior reduzida de 'mt-6' para 'mt-4') */}
        <TabsContent value="overview" className="mt-4">
          {/* *** MUDANÇA AQUI *** (Margem inferior reduzida de 'mb-6' para 'mb-4') */}
          <div className="mb-4">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agendamentos Pendentes (Hoje)</CardTitle>
                <Check className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agendamentos.filter(a =>
                    format(new Date(a.dataHora), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
                    a.status === 'Pendente'
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* *** MUDANÇA AQUI *** (Margem superior reduzida de 'mt-8' para 'mt-6') */}
          <div className="mt-6">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-400">Próximos Agendamentos (Pendentes)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <TabelaAgendamentos
                  data={agendamentos
                    .filter(a => a.status === 'Pendente')
                    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
                  }
                  onUpdateStatus={handleUpdateAgendamentoStatus}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === Aba: Agendamentos === */}
        <TabsContent value="agendamentos" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-yellow-400">Gerenciar Agendamentos</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <TabelaAgendamentos data={agendamentos} onUpdateStatus={handleUpdateAgendamentoStatus} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Aba: Serviços === */}
        <TabsContent value="servicos" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-yellow-400">Gerenciar Serviços</CardTitle>
              <Button onClick={handleNovoServicoClick} className="bg-yellow-400 text-black hover:bg-yellow-300">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Serviço
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <TabelaServicos data={servicos} onEdit={handleEditarServicoClick} onDelete={handleDeleteServico} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Aba: Produtos === */}
        <TabsContent value="produtos" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-yellow-400">Gerenciar Produtos da Loja</CardTitle>
              <Button onClick={handleNovoProdutoClick} className="bg-yellow-400 text-black hover:bg-yellow-300">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <TabelaProdutos data={produtos} onEdit={handleEditarProdutoClick} onDelete={handleDeleteProduto} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Aba: Horários === */}
        <TabsContent value="horarios" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Gerenciar Horários Disponíveis</CardTitle>
            </CardHeader>
            {/* *** MUDANÇA AQUI *** (Gap reduzido de 'gap-8' para 'gap-6') */}
            <CardContent className="grid md:grid-cols-2 gap-6">
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
                    <div key={h.idHorarioDisponivel || `${h.data}-${h.horarios}`} className="flex items-center p-3 bg-gray-700 rounded-md">
_                      <Label htmlFor={`horario-${h.horarios}`} className="text-base flex-grow">
                        {new Date(h.horarios).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </Label>
                      <Switch
                        id={`horario-${h.horarios}`}
                        checked={h.disponivel}
                        onCheckedChange={() => handleToggleHorario(index)}
                        className="data-[state=checked]:bg-yellow-400"
                      />
                    </div>
                  )) : (
                    <p className='text-gray-400'>Nenhum horário encontrado ou cadastrado para este dia.</p>
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
                  <Button onClick={handleAdicionarHorario} className="bg-yellow-400 text-black hover:bg-yellow-300" title="Adicionar novo horário para este dia">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button onClick={handleSalvarHorarios} className="w-full mt-4 bg-green-500 text-white hover:bg-green-600">
                  Salvar Alterações nos Horários
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Aba: Clientes === */}
        <TabsContent value="clientes" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Gerenciar Clientes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <TabelaClientes data={clientes} onDelete={handleDeleteCliente} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Dialogs (Pop-ups) --- */}
      <ServicoDialog
        key={servicoEditando?.idServico || 'new-servico'}
        open={servicoDialogAberto}
        onOpenChange={setServicoDialogAberto}
        onSave={handleSaveServico}
        servico={servicoEditando}
      />
      <ProdutoDialog
        key={produtoEditando?.id || 'new-produto'}
        open={produtoDialogAberto}
        onOpenChange={setProdutoDialogAberto}
        onSave={handleSaveProduto}
        produto={produtoEditando}
      />
    </main>
  );
};

// --- Componentes de Tabela ---

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
      {data.length > 0 ? data.map((ag) => (
        <TableRow key={ag.idAgendamento} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{ag.usuario?.nome || 'Cliente não encontrado'}</TableCell>
          <TableCell>{new Date(ag.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
          <TableCell>{ag.servico?.nomeServico || 'Serviço não encontrado'}</TableCell>
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
                <Button onClick={() => onUpdateStatus(ag, 'Concluído')} variant="outline" size="icon" className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white" title="Marcar como Concluído">
                  <Check className="h-4 w-4" />
                </Button>
                <Button onClick={() => onUpdateStatus(ag, 'Cancelado')} variant="outline" size="icon" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white" title="Cancelar Agendamento">
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </TableCell>
        </TableRow>
      )) : (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-gray-400">Nenhum agendamento encontrado.</TableCell>
        </TableRow>
      )}
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
      {data.length > 0 ? data.map((s) => (
        <TableRow key={s.idServico} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{s.nomeServico}</TableCell>
          <TableCell>R$ {s.preco.toFixed(2)}</TableCell>
          <TableCell>{s.duracao} min</TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(s)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black" title="Editar Serviço">
              <Edit className="h-4 w-4" />
            </Button>
            <BotaoExcluir onConfirm={() => onDelete(s.idServico)} />
          </TableCell>
        </TableRow>
      )) : (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-gray-400">Nenhum serviço encontrado.</TableCell>
        </TableRow>
      )}
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
      {data.length > 0 ? data.map((p) => (
        <TableRow key={p.id} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{p.nome}</TableCell>
          <TableCell>R$ {p.preco.toFixed(2)}</TableCell>
          <TableCell>{p.estoque}</TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(p)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black" title="Editar Produto">
              <Edit className="h-4 w-4" />
            </Button>
            <BotaoExcluir onConfirm={() => onDelete(p.id)} />
          </TableCell>
        </TableRow>
      )) : (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-gray-400">Nenhum produto encontrado.</TableCell>
        </TableRow>
      )}
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
      {data.length > 0 ? data.map((c) => (
        <TableRow key={c.id} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{c.nome}</TableCell>
          <TableCell>{c.email}</TableCell>
          <TableCell>{c.telefone}</TableCell>
          <TableCell className="text-right">
            <BotaoExcluir onConfirm={() => onDelete(c.id)} />
          </TableCell>
        </TableRow>
      )) : (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-gray-400">Nenhum cliente encontrado.</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

// --- Componentes de Dialog ---

// Botão Excluir com confirmação
const BotaoExcluir: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="outline" size="icon" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white" title="Excluir Item">
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

// --- Dialogs de Formulário (com controle de estado interno) ---

interface ServicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Servico>) => void;
  servico: Partial<Servico> | null; // Recebe o serviço a editar ou null para criar
}
const ServicoDialog: React.FC<ServicoDialogProps> = ({ open, onOpenChange, onSave, servico }) => {
  // Estado local para o formulário
  const [formData, setFormData] = useState<Partial<Servico>>({ idServico: undefined, nomeServico: '', preco: 0, duracao: 30 });

  // Popula o formulário quando o dialog abre ou o serviço muda
  useEffect(() => {
    if (open) {
      if (servico) {
        setFormData(servico);
      } else {
        // Reset para novo serviço
        setFormData({ idServico: undefined, nomeServico: '', preco: 0, duracao: 30 });
      }
    }
  }, [servico, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value // Converte para número se for o caso
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData); // Chama a função onSave passada por props com os dados do form
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-yellow-400">{servico?.idServico ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome-servico" className="text-right">Nome</Label>
              <Input id="nome-servico" name="nomeServico" value={formData.nomeServico} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preco-servico" className="text-right">Preço (R$)</Label>
              <Input id="preco-servico" name="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required min="0"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duracao-servico" className="text-right">Duração (min)</Label>
              <Input id="duracao-servico" name="duracao" type="number" value={formData.duracao} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required min="1"/>
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
  const [formData, setFormData] = useState<Partial<Produto>>({ id: undefined, nome: '', preco: 0, estoque: 0 });

  useEffect(() => {
    if (open) {
      if (produto) {
        setFormData(produto);
      } else {
        setFormData({ id: undefined, nome: '', preco: 0, estoque: 0 });
      }
    }
  }, [produto, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value // Use parseInt para estoque
    }));
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
            <DialogTitle className="text-yellow-400">{produto?.id ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome-produto" className="text-right">Nome</Label>
              <Input id="nome-produto" name="nome" value={formData.nome} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preco-produto" className="text-right">Preço (R$)</Label>
              <Input id="preco-produto" name="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required min="0"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estoque-produto" className="text-right">Estoque</Label>
              <Input id="estoque-produto" name="estoque" type="number" value={formData.estoque} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required min="0"/>
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