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
// import { Sidebar } from '@/components/ui/sidebar'; // Removido (Layout Limpo)
import { toast } from "sonner";
import { api } from '../api.ts'; // Importa a instância configurada do Axios
import { format } from 'date-fns'; // Para formatar a data para a API
import { ptBR } from 'date-fns/locale'; // Para localização do calendário

// --- Tipos de Dados (Interfaces baseadas no seu Backend) ---
// (Estas são as interfaces do CÓDIGO 1 - Lógica Avançada)
interface TipoUsuario {
  id: number;
  nomeTipoUsuario: string;
}

interface Usuario {
  idUsuario: number;
  nomeUsuario: string;
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
  idProduto: number;
  nomeProduto: string; 
  descricao: string;   
  preco: number;
  estoque: number;     
  imgUrl: string;   
}

interface Agendamento {
  idAgendamento: number;
  dataHora: string; // Vem como ISO string do backend
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  usuario: Usuario;
  servico: Servico;
}

interface HorarioDisponivel {
  idHorarioDisponivel: number | null; 
  horarios: string; // Formato HH:MM
  disponivel: boolean;
  data: Date;
  isBooked?: boolean; // Flag temporária da UI
}

// --- FUNÇÃO GERADORA DE TEMPLATE ---
// (Esta é a função do CÓDIGO 1 - Lógica Avançada)
const generateDailyTemplate = (selectedDate: Date): HorarioDisponivel[] => {
  const template: HorarioDisponivel[] = [];
  const date = new Date(selectedDate); 

  const createEntry = (h: number, m: number): HorarioDisponivel => {
    const d = new Date(date);
    d.setHours(h, m, 0, 0); 

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0'); 
    const dd = String(d.getDate()).padStart(2, '0');
    
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');

    const isoLocalString = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;

    return {
      idHorarioDisponivel: null, 
      horarios: isoLocalString,   
      disponivel: true,           
      data: date,                 
      isBooked: false             
    };
  };

  const incrementTime = (h: number, m: number): {h: number, m: number} => {
      m += 45;
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
      return {h, m};
  };

  // --- Sessão da Manhã ---
  let h = 7;
  let m = 30;
  const breakStartH = 12;
  const breakStartM = 40;
  
  while (h < breakStartH || (h === breakStartH && m < breakStartM)) {
    template.push(createEntry(h, m));
    const next = incrementTime(h, m);
    h = next.h;
    m = next.m;
  }
  
  // --- Sessão da Tarde ---
  h = 13;
  m = 40;
  const endTimeH = 20; 
  const endTimeM = 0;
  
  while (h < endTimeH || (h === endTimeH && m <= endTimeM)) {
    template.push(createEntry(h, m));
    const next = incrementTime(h, m);
    h = next.h;
    m = next.m;
  }
  
  return template;
};


// --- Componente Principal do Dashboard ---
const Dashboard = () => {
  // --- Estados de Dados ---
  // (Estes são os estados do CÓDIGO 1 - Lógica Avançada)
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
  // novoHorario removido

  // --- Funções de Busca (Fetch) ---
  // (Estas são as funções do CÓDIGO 1 - Lógica Avançada)
  const fetchAgendamentos = useCallback(async () => {
    try {
      const response = await api.get('/agendamentos'); 
      setAgendamentos(response.data);
      return response.data; // <-- Retorna os dados
    } catch (error) {
      console.error("Erro fetchAgendamentos:", error);
      toast.error('Erro ao buscar agendamentos.');
      return []; // <-- Retorna vazio
    }
  }, []);

  const fetchServicos = useCallback(async () => {
    try {
      const response = await api.get('/servicos'); 
      setServicos(response.data);
    } catch (error) {
      console.error("Erro fetchServicos:", error);
      toast.error('Erro ao buscar serviços.');
    }
  }, []);

  const fetchProdutos = useCallback(async () => {
    try {
      const response = await api.get('/produtos'); 
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro fetchProdutos:", error);
      toast.error('Erro ao buscar produtos.');
    }
  }, []);

  const fetchClientes = useCallback(async () => {
    try {
      const response = await api.get('/usuarios'); 
      setClientes(response.data.filter((u: Usuario) => u.tipoUsuario?.nomeTipoUsuario === 'Cliente'));
    } catch (error) {
      console.error("Erro fetchClientes:", error);
      toast.error('Erro ao buscar clientes.');
    }
  }, []);

  // (Função fetchHorarios do CÓDIGO 1 - Lógica Avançada)
  const fetchHorarios = useCallback(async (data: Date, currentAgendamentos: Agendamento[]) => {
    let horariosDoDia: HorarioDisponivel[] = [];
    let errorOccurred = false;

    try {
      const dataFormatada = format(data, 'yyyy-MM-dd');
      const response = await api.get(`/horarios/disponiveis/${dataFormatada}`);
      
      if (response.data && response.data.length > 0) {
        horariosDoDia = response.data;
      } else {
        horariosDoDia = generateDailyTemplate(data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        horariosDoDia = generateDailyTemplate(data);
      } else {
        errorOccurred = true;
        setHorarios([]);
        console.error("Erro fetchHorarios:", error);
        toast.error('Erro ao buscar horários.');
      }
    }
    
    if (!errorOccurred) {
      const horariosAgendados = new Set(
        currentAgendamentos
          .filter(ag => ag.status !== 'Cancelado')
          .map(ag => new Date(ag.dataHora).toISOString()) 
      );

      const horariosAtualizados = horariosDoDia.map(h => {
        const horarioIso = new Date(h.horarios).toISOString();
        const estaAgendado = horariosAgendados.has(horarioIso);

        return {
          ...h,
          disponivel: estaAgendado ? false : h.disponivel, 
          isBooked: estaAgendado 
        };
      })
      .sort((a, b) => new Date(a.horarios).getTime() - new Date(b.horarios).getTime());

      setHorarios(horariosAtualizados);
    }
  }, []); 


  // --- Efeito de Carregamento Inicial ---
  // (Lógica do CÓDIGO 1 - Lógica Avançada)
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      const [agendamentosData] = await Promise.all([
        fetchAgendamentos(),
        fetchServicos(),
        fetchProdutos(),
        fetchClientes(),
      ]);
      
      if (dataSelecionada) {
          await fetchHorarios(dataSelecionada, agendamentosData);
      }
      setLoading(false);
    };
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependências vazias (só roda 1 vez)

  // Efeito para recarregar horários quando a data selecionada muda
  // (Lógica do CÓDIGO 1 - Lógica Avançada)
  useEffect(() => {
    if (dataSelecionada) {
      fetchHorarios(dataSelecionada, agendamentos);
    }
  }, [dataSelecionada, fetchHorarios, agendamentos]);

  // --- Handlers de Ações (CRUD) ---
  // (Todos os Handlers do CÓDIGO 1 - Lógica Avançada)

  // Agendamentos (com re-fetch de horários)
  const handleUpdateAgendamentoStatus = async (agendamento: Agendamento, status: 'Concluído' | 'Cancelado') => {
    try {
      await api.put(`/agendamentos/${agendamento.idAgendamento}`, { ...agendamento, status: status });
      toast.success(`Agendamento ${status === 'Concluído' ? 'concluído' : 'cancelado'}!`);

      const novosAgendamentos = await fetchAgendamentos(); 
      
      if (dataSelecionada && format(new Date(agendamento.dataHora), 'yyyy-MM-dd') === format(dataSelecionada, 'yyyy-MM-dd')) {
        fetchHorarios(dataSelecionada, novosAgendamentos);
      }

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
      fetchServicos(); 
    } catch (error) {
      console.error("Erro handleSaveServico:", error);
      toast.error('Erro ao salvar serviço.');
    }
  };

  const handleDeleteServico = async (idServico:number) => {
    try {
      await api.delete(`/servicos/${idServico}`);
      toast.success('Serviço excluído com sucesso!');
      fetchServicos(); 
    } catch (error) {
      console.error("Erro handleDeleteServico:", error);
      toast.error('Erro ao excluir serviço. Verifique se ele não está sendo usado em agendamentos.');
    }
  };

  // Produtos (com validação para os campos novos)
  const handleSaveProduto = async (formData: Partial<Produto>) => {
    if (!formData.nomeProduto || !formData.descricao || formData.preco === undefined || formData.estoque === undefined || !formData.imgUrl) {
        toast.error("Preencha todos os campos do produto.");
        return;
    }
    try {
      if (formData.idProduto) {
        await api.put(`/produtos/${formData.idProduto}`, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', formData);
        toast.success('Produto criado com sucesso!');
      }
      setProdutoDialogAberto(false);
      fetchProdutos(); 
    } catch (error) {
      console.error("Erro handleSaveProduto:", error);
      toast.error('Erro ao salvar produto.');
    }
  };

  const handleDeleteProduto = async (idProduto: number) => {
    try {
      await api.delete(`/produtos/${idProduto}`);
      toast.success('Produto excluído com sucesso!');
      fetchProdutos(); 
    } catch (error) {
      console.error("Erro handleDeleteProduto:", error);
      toast.error('Erro ao excluir produto.');
    }
  };

  // Clientes
  const handleDeleteCliente = async (idUsuario: number) => {
    try {
      await api.delete(`/usuarios/${idUsuario}`);
      toast.success('Cliente excluído com sucesso!');
      fetchClientes(); 
    } catch (error) {
      console.error("Erro handleDeleteCliente:", error);
      toast.error('Erro ao excluir cliente. Verifique se ele não possui agendamentos.');
    }
  };

  // Horários (sem 'handleAdicionarHorario')
  const handleToggleHorario = (index: number) => {
    const novosHorarios = [...horarios];
    novosHorarios[index].disponivel = !novosHorarios[index].disponivel;
    setHorarios(novosHorarios);
  };

  // handleSalvarHorarios (com lógica POST/PUT)
  const handleSalvarHorarios = async () => {
    if (!dataSelecionada) return;

    const promises = horarios.map(h => {
      if (h.idHorarioDisponivel) {
        return api.put(`/horarios/${h.idHorarioDisponivel}/disponibilidade`, null, { 
          params: { disponivel: h.disponivel } 
        });
      } else {
        return api.post('/horarios', { 
          horarios: h.horarios, 
          disponivel: h.disponivel 
        });
      }
    });

    try {
      await Promise.all(promises);
      toast.success("Horários atualizados!");
      fetchHorarios(dataSelecionada, agendamentos); 
    } catch (error) {
      console.error("Erro handleSalvarHorarios:", error);
      toast.error("Erro ao salvar horários.");
    }
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
  // (Este é o JSX do CÓDIGO 2 - Layout Limpo)

  if (loading && !servicoDialogAberto && !produtoDialogAberto) {
    return (
      <main className="flex-1 p-4 md:p-6 text-center text-white">Carregando Dashboard...</main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
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
        <div className="flex justify-center flex-wrap">
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
        <TabsContent value="overview" className="mt-4">
          <div className="mb-4">
            <Card className="bg-gray-800 border-gray-700 text-white max-w-sm mx-auto"> {/* Max-w e mx-auto adicionado */}
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
              {/* Esta TabelaProdutos agora é a do CÓDIGO 1 */}
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
                      {/* Lógica de 'isBooked' (do CÓDIGO 1) aplicada ao Label */}
                      <Label 
                        htmlFor={`horario-${h.horarios}`} 
                        className={`text-base flex-grow ${h.isBooked ? 'text-gray-400 line-through' : ''}`}
                      >
                        {new Date(h.horarios).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        {h.isBooked && <span className="text-xs ml-2 font-normal">(Agendado)</span>}
                      </Label>
                      <Switch
                        id={`horario-${h.horarios}`}
                        checked={h.disponivel}
                        onCheckedChange={() => handleToggleHorario(index)}
                        className="data-[state=checked]:bg-yellow-400"
                        disabled={h.isBooked} // Lógica 'disabled' (do CÓDIGO 1)
                      />
                    </div>
                  )) : (
                    <p className='text-gray-400'>Nenhum horário encontrado ou cadastrado para este dia.</p>
                  )}
                </div>

                {/* Bloco de "Adicionar Horário Manual" (do CÓDIGO 2) REMOVIDO */}

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
      {/* (Estes são os Dialogs do CÓDIGO 1 - Lógica Avançada) */}
      <ServicoDialog
        key={servicoEditando?.idServico || 'new-servico'}
        open={servicoDialogAberto}
        onOpenChange={setServicoDialogAberto}
        onSave={handleSaveServico}
        servico={servicoEditando}
      />
      {/* CORREÇÃO: A 'key' deve usar 'idProduto' (da Lógica 1) */}
      <ProdutoDialog
        key={produtoEditando?.idProduto || 'new-produto'} 
        open={produtoDialogAberto}
        onOpenChange={setProdutoDialogAberto}
        onSave={handleSaveProduto}
        produto={produtoEditando}
      />
    </main>
  );
};

// --- Componentes de Tabela ---
// (Estas são as Tabelas do CÓDIGO 1 - Lógica Avançada)

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
          {/* Usa idUsuario (Lógica 1) */}
          <TableCell>{ag.usuario?.nomeUsuario || 'Cliente não encontrado'}</TableCell> 
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
// (Tabela de Produtos do CÓDIGO 1 - Lógica Avançada)
const TabelaProdutos: React.FC<TabelaProdutosProps> = ({ data, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-gray-700 border-gray-700">
        <TableHead className="text-white">Nome do Produto</TableHead>
        <TableHead className="text-white">Preço</TableHead>
        <TableHead className="text-white">Estoque</TableHead>
        <TableHead className="text-right text-white">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.length > 0 ? data.map((p) => (
        <TableRow key={p.idProduto} className="hover:bg-gray-700 border-gray-700">
          <TableCell>{p.nomeProduto}</TableCell>
          <TableCell>R$ {p.preco.toFixed(2)}</TableCell>
          <TableCell>{p.estoque}</TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(p)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black" title="Editar Produto">
              <Edit className="h-4 w-4" />
            </Button>
            <BotaoExcluir onConfirm={() => onDelete(p.idProduto)} />
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
        // Usa idUsuario (Lógica 1)
        <TableRow key={c.idUsuario} className="hover:bg-gray-700 border-gray-700"> 
          <TableCell>{c.nomeUsuario}</TableCell>
          <TableCell>{c.email}</TableCell>
          <TableCell>{c.telefone}</TableCell>
          <TableCell className="text-right">
            <BotaoExcluir onConfirm={() => onDelete(c.idUsuario)} /> 
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
// (Estes são os Dialogs do CÓDIGO 1 - Lógica Avançada)

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
  servico: Partial<Servico> | null; 
}
const ServicoDialog: React.FC<ServicoDialogProps> = ({ open, onOpenChange, onSave, servico }) => {
  const [formData, setFormData] = useState<Partial<Servico>>({ idServico: undefined, nomeServico: '', preco: 0, duracao: 30 });

  useEffect(() => {
    if (open) {
      if (servico) {
        setFormData(servico);
      } else {
        setFormData({ idServico: undefined, nomeServico: '', preco: 0, duracao: 30 });
      }
    }
  }, [servico, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
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
// (Formulário de Produto do CÓDIGO 1 - Lógica Avançada)
const ProdutoDialog: React.FC<ProdutoDialogProps> = ({ open, onOpenChange, onSave, produto }) => {
  const [formData, setFormData] = useState<Partial<Produto>>({ 
    idProduto: undefined, 
    nomeProduto: '', 
    descricao: '', 
    preco: 0, 
    estoque: 0, 
    imgUrl: '' 
  });

  useEffect(() => {
    if (open) {
      if (produto) {
        setFormData(produto);
      } else {
        setFormData({ 
          idProduto: undefined, 
          nomeProduto: '', 
          descricao: '', 
          preco: 0, 
          estoque: 0, 
          imgUrl: '' 
        });
      }
    }
  }, [produto, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? 
        (name === 'preco' ? parseFloat(value) || 0 : parseInt(value, 10) || 0) 
        : value
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
            <DialogTitle className="text-yellow-400">{produto?.idProduto ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome-produto" className="text-right">Nome</Label>
              <Input id="nome-produto" name="nomeProduto" value={formData.nomeProduto} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao-produto" className="text-right">Descrição</Label>
              <textarea 
                id="descricao-produto" 
                name="descricao" 
                value={formData.descricao} 
                onChange={handleChange} 
                className="col-span-3 bg-gray-700 border-gray-600 rounded-md p-2 h-24" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preco-produto" className="text-right">Preço (R$)</Label>
              <Input id="preco-produto" name="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required min="0"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock-produto" className="text-right">Estoque</Label>
              <Input id="stock-produto" name="estoque" type="number" value={formData.estoque} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required min="0"/>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imagem-produto" className="text-right">URL da Imagem</Label>
              <Input id="imagem-produto" name="imgUrl" value={formData.imgUrl} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required placeholder="https://..."/>
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

