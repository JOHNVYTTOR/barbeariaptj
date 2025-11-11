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
import { toast } from "sonner";
import { api } from '../api.ts'; // Corrigido: Usando o caminho relativo
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale'; 

// ... (Interfaces, generateDailyTemplate, etc. - Sem mudanças) ...

interface TipoUsuario {
  id: number;
  nomeTipoUsuario: string;
}

interface Usuario {
  idUsuario: number;
  nomeUsuario: string; 
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  fotoUrl: string; 
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
  dataHora: string; 
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  usuario: Usuario; 
  servico: Servico;
  nomeCliente?: string; 
  profissional?: Usuario; // Campo para o profissional
}

interface HorarioDisponivel {
  idHorarioDisponivel: number | null; 
  horarios: string; 
  disponivel: boolean;
  data: Date;
  isBooked?: boolean; 
}

// --- FUNÇÃO GERADORA DE TEMPLATE (Horários baseados na foto) ---
const generateDailyTemplate = (selectedDate: Date): HorarioDisponivel[] => {
  const template: HorarioDisponivel[] = [];
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay(); 

  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const dateString = `${yyyy}-${mm}-${dd}`;

  const createEntry = (h: number, m: number): HorarioDisponivel => {
    const horarioISO = `${dateString}T${pad(h)}:${pad(m)}:00`;
    return {
      idHorarioDisponivel: -(new Date(horarioISO).getTime()), 
      horarios: horarioISO,
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

  let h: number, m: number;
  let morningStartH = 0, morningStartM = 0;
  let morningEndH = 0, morningEndM = 0;
  let afternoonStartH = 0, afternoonStartM = 0;
  let afternoonEndH = 0, afternoonEndM = 0;
  let hasLunchBreak = true;

  switch (dayOfWeek) {
    case 1: case 2: case 4:
      morningStartH = 9; morningStartM = 0;  
      morningEndH = 12; morningEndM = 0;    
      afternoonStartH = 13; afternoonStartM = 0; 
      afternoonEndH = 19; afternoonEndM = 30;  
      break;
    case 3: 
      morningStartH = 9; morningStartM = 0;  
      morningEndH = 12; morningEndM = 30;   
      afternoonStartH = 13; afternoonStartM = 0; 
      afternoonEndH = 19; afternoonEndM = 30;  
      break;
    case 5: 
      morningStartH = 9; morningStartM = 0;  
      morningEndH = 12; morningEndM = 0;    
      afternoonStartH = 13; afternoonStartM = 0; 
      afternoonEndH = 20; afternoonEndM = 0;   
      break;
    case 6: 
      morningStartH = 10; morningStartM = 0; 
      morningEndH = 18; morningEndM = 0;   
      hasLunchBreak = false; 
      break;
    case 0: 
    default:
      return []; 
  }

  h = morningStartH;
  m = morningStartM;
  
  while (h < morningEndH || (h === morningEndH && m <= morningEndM)) {
    const nextSlot = incrementTime(h, m);
    if (nextSlot.h > morningEndH || (nextSlot.h === morningEndH && nextSlot.m > morningEndM)) {
      if (h === morningEndH && m === morningEndM) {
          template.push(createEntry(h, m)); 
      }
      break; 
    }
    template.push(createEntry(h, m));
    h = nextSlot.h;
    m = nextSlot.m;
  }
  
  if (hasLunchBreak) {
    h = afternoonStartH;
    m = afternoonStartM;
    while (h < afternoonEndH || (h === afternoonEndH && m <= afternoonEndM)) {
      const nextSlot = incrementTime(h, m);
      if (nextSlot.h > afternoonEndH || (nextSlot.h === afternoonEndH && nextSlot.m > afternoonEndM)) {
          if (h === afternoonEndH && m === afternoonEndM) {
            template.push(createEntry(h, m)); 
          }
        break; 
      }
      template.push(createEntry(h, m));
      h = nextSlot.h;
      m = nextSlot.m;
    }
  }
  return template;
};


// --- Componente Principal do Dashboard ---
const Dashboard = () => {
// ... (Estados, fetch functions, etc. - Sem mudanças) ...
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [profissionais, setProfissionais] = useState<Usuario[]>([]); 

  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [servicoDialogAberto, setServicoDialogAberto] = useState(false);
  const [produtoDialogAberto, setProdutoDialogAberto] = useState(false);
  const [profissionalDialogAberto, setProfissionalDialogAberto] = useState(false); 
  
  const [servicoEditando, setServicoEditando] = useState<Partial<Servico> | null>(null); 
  const [produtoEditando, setProdutoEditando] = useState<Partial<Produto> | null>(null);
  const [profissionalEditando, setProfissionalEditando] = useState<Partial<Usuario> | null>(null); 
  
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());

  // --- Lógica de Filtro de Histórico ---
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  const agendamentosFiltrados = agendamentos.filter(ag => {
    if (mostrarHistorico) {
      return true; 
    }
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(0, 0, 0, 0); 
    const dataAg = new Date(ag.dataHora);
    return dataAg >= ontem;
  });
  // --- Fim da Lógica de Filtro ---


  // --- Funções de Busca (Fetch) ---
  const fetchAgendamentos = useCallback(async () => {
    try {
      const response = await api.get('/agendamentos'); 
      setAgendamentos(response.data);
      return response.data; 
    } catch (error) {
      console.error("Erro fetchAgendamentos:", error);
      toast.error('Erro ao buscar agendamentos.');
      return []; 
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
  
  const fetchProfissionais = useCallback(async () => {
    try {
      const response = await api.get('/usuarios'); 
      setProfissionais(response.data.filter((u: Usuario) => u.tipoUsuario?.nomeTipoUsuario === 'Admin'));
    } catch (error) {
      console.error("Erro fetchProfissionais:", error);
      toast.error('Erro ao buscar profissionais.');
    }
  }, []);

  const fetchHorarios = useCallback(async (data: Date, currentAgendamentos: Agendamento[]) => {
    let horariosDoDia: HorarioDisponivel[] = [];
    let errorOccurred = false;
    const dateOnly = new Date(data.getFullYear(), data.getMonth(), data.getDate());

    try {
      const dataFormatada = format(dateOnly, 'yyyy-MM-dd'); 
      const response = await api.get(`/horarios/disponiveis/${dataFormatada}`);
      
      if (response.data && response.data.length > 0) {
        horariosDoDia = response.data;
      } else {
        horariosDoDia = generateDailyTemplate(dateOnly); 
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        horariosDoDia = generateDailyTemplate(dateOnly); 
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
        const horarioDate = new Date(h.horarios);
        const horarioIso = horarioDate.toISOString();
        const estaAgendado = horariosAgendados.has(horarioIso);

        return {
          ...h,
          disponivel: estaAgendado ? false : h.disponivel, 
          isBooked: estaAgendado,
          data: dateOnly 
        };
      })
      .sort((a, b) => new Date(a.horarios).getTime() - new Date(b.horarios).getTime());

      setHorarios(horariosAtualizados);
    }
  }, []); 


  // --- Efeito de Carregamento Inicial ---
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      const [agendamentosData] = await Promise.all([
        fetchAgendamentos(),
        fetchServicos(),
        fetchProdutos(),
        fetchClientes(),
        fetchProfissionais() 
      ]);
      
      if (dataSelecionada) {
          await fetchHorarios(dataSelecionada, agendamentosData);
      }
      setLoading(false);
    };
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Efeito para recarregar horários quando a data selecionada muda
  useEffect(() => {
    if (dataSelecionada) {
      fetchHorarios(dataSelecionada, agendamentos);
    }
  }, [dataSelecionada, fetchHorarios, agendamentos]);

  // --- Handlers de Ações (CRUD) ---

  // Agendamentos
  const handleUpdateAgendamentoStatus = async (agendamento: Agendamento, status: 'Concluído' | 'Cancelado') => {
    try {
      // ===== CORREÇÃO AQUI =====
      // Em vez de enviar o objeto 'agendamento' inteiro (que pode dar erro 500),
      // enviamos um payload limpo, apenas com os IDs das relações.
      // O back-end (AgendamentoService.java) já espera por isso.
      const payload = {
        idAgendamento: agendamento.idAgendamento,
        dataHora: agendamento.dataHora,
        nomeCliente: agendamento.nomeCliente,
        status: status, // O novo status
        
        // Envia apenas os IDs das entidades relacionadas
        usuario: agendamento.usuario ? { idUsuario: agendamento.usuario.idUsuario } : null,
        servico: agendamento.servico ? { idServico: agendamento.servico.idServico } : null,
        profissional: agendamento.profissional ? { idUsuario: agendamento.profissional.idUsuario } : null
      };
      
      await api.put(`/agendamentos/${agendamento.idAgendamento}`, payload);
      // ===== FIM DA CORREÇÃO =====

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
      toast.error('Erro ao excluir serviço.', {
        description: 'Verifique se este serviço não está sendo usado em agendamentos PENDENTES.'
      });
    }
  };

  // Produtos
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
  
  // Profissionais
  const handleSaveProfissional = async (formData: Partial<Usuario>) => {
    if (!formData.nomeUsuario || !formData.email || (!formData.idUsuario && !formData.senha) || !formData.cpf || !formData.telefone || !formData.fotoUrl) {
        toast.error("Preencha todos os campos do profissional (senha é obrigatória ao criar).");
        return;
    }

    try {
      if (formData.idUsuario) {
        // Editar (PUT)
        const payload = {
            idUsuario: formData.idUsuario,
            nomeUsuario: formData.nomeUsuario, 
            email: formData.email,
            cpf: formData.cpf,
            telefone: formData.telefone,
            fotoUrl: formData.fotoUrl,
            tipoUsuario: formData.tipoUsuario 
        };
        await api.put(`/usuarios/${formData.idUsuario}`, payload); // Assumindo que seu back-end aceita PUT em /usuarios
        toast.success('Profissional atualizado com sucesso!');
      } else {
        // Criar (POST) - Usando /usuarios/registerAdmin
        const payload = {
            nomeUsuario: formData.nomeUsuario, 
            email: formData.email,
            senha: formData.senha, 
            cpf: formData.cpf,
            telefone: formData.telefone,
            fotoUrl: formData.fotoUrl
        };
        await api.post('/usuarios/registerAdmin', payload); 
        toast.success('Profissional criado com sucesso!');
      }
      setProfissionalDialogAberto(false);
      fetchProfissionais(); 
    } catch (error) {
      console.error("Erro handleSaveProfissional:", error);
      toast.error('Erro ao salvar profissional.');
    }
  };

  const handleDeleteProfissional = async (idUsuario: number) => {
    try {
      await api.delete(`/usuarios/${idUsuario}`);
      toast.success('Profissional excluído com sucesso!');
      fetchProfissionais(); 
    } catch (error) {
      console.error("Erro handleDeleteProfissional:", error);
      // ATUALIZADO: Mensagem de erro mais específica
      toast.error('Erro ao excluir profissional.', {
        description: 'Verifique se este profissional não possui agendamentos PENDENTES.'
      });
    }
  };


  // Horários
  const handleToggleHorario = (index: number) => {
    const novosHorarios = [...horarios];
    novosHorarios[index].disponivel = !novosHorarios[index].disponivel;
    setHorarios(novosHorarios);
  };

  const handleSalvarHorarios = async () => {
    if (!dataSelecionada) return;

    const dateOnly = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dataSelecionada.getDate());

    const promises = horarios.map(h => {
      const horarioDate = new Date(h.horarios);
      horarioDate.setFullYear(dateOnly.getFullYear(), dateOnly.getMonth(), dateOnly.getDate());
      const isoLocalString = format(horarioDate, "yyyy-MM-dd'T'HH:mm:ss");

      if (h.idHorarioDisponivel) {
        return api.put(`/horarios/${h.idHorarioDisponivel}/disponibilidade`, null, { 
          params: { disponivel: h.disponivel } 
        });
      } else {
        return api.post('/horarios', { 
          horarios: isoLocalString, 
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
  
  const handleEditarProfissionalClick = (profissional: Usuario) => {
    setProfissionalEditando(profissional);
    setProfissionalDialogAberto(true);
  };

  const handleNovoProfissionalClick = () => {
    setProfissionalEditando(null); 
    setProfissionalDialogAberto(true);
  };


  // ----- JSX DO DASHBOARD -----
  if (loading && !servicoDialogAberto && !produtoDialogAberto && !profissionalDialogAberto) { 
    return (
      <main className="flex-1 p-4 md:p-6 text-center text-white">Carregando Dashboard...</main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
      <header className="grid grid-cols-3 items-center mb-4">
        
        <div></div>
        
        <h1 className="text-3xl font-bold text-yellow-400 text-center">
          Dashboard
        </h1>
        
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
            <TabsTrigger value="profissionais">Profissionais</TabsTrigger> 
          </TabsList>
        </div>

        {/* === Aba: Visão Geral === */}
        <TabsContent value="overview" className="mt-4">
          <div className="mb-4">
            <Card className="bg-gray-800 border-gray-700 text-white max-w-sm mx-auto"> 
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
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="mostrar-historico"
                  checked={mostrarHistorico}
                  onCheckedChange={setMostrarHistorico}
                  className="data-[state=checked]:bg-yellow-400"
                />
                <Label htmlFor="mostrar-historico" className="text-sm text-gray-300">
                  Mostrar histórico (mais de 1 dia)
                </Label>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <TabelaAgendamentos data={agendamentosFiltrados} onUpdateStatus={handleUpdateAgendamentoStatus} />
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
                        disabled={h.isBooked} 
                      />
                    </div>
                  )) : (
                    <p className='text-gray-400'>Nenhum horário encontrado ou cadastrado para este dia.</p>
                  )}
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

        {/* === Aba: Profissionais === */}
        <TabsContent value="profissionais" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-yellow-400">Gerenciar Profissionais (Admins)</CardTitle>
              <Button onClick={handleNovoProfissionalClick} className="bg-yellow-400 text-black hover:bg-yellow-300">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Profissional
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <TabelaProfissionais data={profissionais} onEdit={handleEditarProfissionalClick} onDelete={handleDeleteProfissional} />
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
        key={produtoEditando?.idProduto || 'new-produto'} 
        open={produtoDialogAberto}
        onOpenChange={setProdutoDialogAberto}
        onSave={handleSaveProduto}
        produto={produtoEditando}
      />
      <ProfissionalDialog
        key={profissionalEditando?.idUsuario || 'new-profissional'}
        open={profissionalDialogAberto}
        onOpenChange={setProfissionalDialogAberto}
        onSave={handleSaveProfissional}
        profissional={profissionalEditando}
      />
    </main>
  );
};

// --- Componentes de Tabela ---

interface TabelaAgendamentosProps {
  data: Agendamento[];
  onUpdateStatus: (agendamento: Agendamento, status: 'Concluído' | 'Cancelado') => void;
}
const TabelaAgendamentos: React.FC<TabelaAgendamentosProps> = ({ data, onUpdateStatus }) => {
  const now = new Date(); 
  
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-gray-700 border-gray-700">
          <TableHead className="text-white">Cliente</TableHead>
          <TableHead className="text-white">Profissional</TableHead> 
          <TableHead className="text-white">Data / Hora</TableHead>
          <TableHead className="text-white">Serviço</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-right text-white">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? data.map((ag) => {
          const dataAgendamento = new Date(ag.dataHora);
          const horarioJaPassou = dataAgendamento < now;

          let statusLabel = "";
          let statusClass = "";
          let acoes = null; 

          if (ag.status === 'Cancelado') {
            statusLabel = "Cancelado";
            statusClass = "bg-red-500 text-white";
          } else if (ag.status === 'Concluído') {
            statusLabel = "Concluído (M)";
            statusClass = "bg-green-500 text-white";
          } else if (ag.status === 'Pendente' && horarioJaPassou) {
            statusLabel = "Concluído (A)";
            statusClass = "bg-blue-500 text-white";
          } else if (ag.status === 'Pendente' && !horarioJaPassou) {
            statusLabel = "Pendente";
            statusClass = "bg-yellow-400 text-black";
            
            acoes = (
              <>
                <Button onClick={() => onUpdateStatus(ag, 'Concluído')} variant="outline" size="icon" className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white" title="Marcar como Concluído">
                  <Check className="h-4 w-4" />
                </Button>
                <Button onClick={() => onUpdateStatus(ag, 'Cancelado')} variant="outline" size="icon" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white" title="Cancelar Agendamento">
                  <X className="h-4 w-4" />
                </Button>
              </>
            );
          } else {
            // Este caso captura 'Pendente' && horarioJaPassou se a lógica acima falhar,
            // ou qualquer outro status inesperado.
            statusLabel = ag.status;
            statusClass = "bg-gray-500 text-white";
          }

          return (
            <TableRow key={ag.idAgendamento} className="hover:bg-gray-700 border-gray-700">
              <TableCell>{ag.nomeCliente || (ag.usuario?.tipoUsuario?.nomeTipoUsuario !== 'Admin' ? ag.usuario?.nomeUsuario : 'Cliente Avulso')}</TableCell> 
              <TableCell>{ag.profissional?.nomeUsuario || 'N/A'}</TableCell>
              <TableCell>{dataAgendamento.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
              <TableCell>{ag.servico?.nomeServico || 'Serviço não encontrado'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                  {statusLabel}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {acoes || <span className="text-xs text-gray-500 italic">Nenhuma ação</span>}
              </TableCell>
            </TableRow>
          );
        }) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-400">Nenhum agendamento encontrado.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

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

interface TabelaProfissionaisProps {
  data: Usuario[];
  onEdit: (p: Usuario) => void;
  onDelete: (id: number) => void;
}
const TabelaProfissionais: React.FC<TabelaProfissionaisProps> = ({ data, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow className="hover:bg-gray-700 border-gray-700">
        <TableHead className="text-white">Foto</TableHead>
        <TableHead className="text-white">Nome</TableHead>
        <TableHead className="text-white">Email</TableHead>
        <TableHead className="text-white">Telefone</TableHead>
        <TableHead className="text-right text-white">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.length > 0 ? data.map((p) => (
        <TableRow key={p.idUsuario} className="hover:bg-gray-700 border-gray-700"> 
          <TableCell>
            <img 
              src={p.fotoUrl || 'https://placehold.co/40x40/333/FFF?text=Foto'} 
              alt={p.nomeUsuario} 
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/40x40/333/FFF?text=Erro')}
            />
          </TableCell>
          <TableCell>{p.nomeUsuario}</TableCell> 
          <TableCell>{p.email}</TableCell>
          <TableCell>{p.telefone}</TableCell>
          <TableCell className="text-right space-x-2">
             <Button variant="outline" size="icon" onClick={() => onEdit(p)} className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black" title="Editar Profissional">
              <Edit className="h-4 w-4" />
            </Button>
            <BotaoExcluir onConfirm={() => onDelete(p.idUsuario)} /> 
          </TableCell>
        </TableRow>
      )) : (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-gray-400">Nenhum profissional encontrado.</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);


// --- Componentes de Dialog ---

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

interface ProfissionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Usuario>) => void;
  profissional: Partial<Usuario> | null;
}
const ProfissionalDialog: React.FC<ProfissionalDialogProps> = ({ open, onOpenChange, onSave, profissional }) => {
  
  const [formData, setFormData] = useState<Partial<Usuario>>({
    nomeUsuario: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: '',
    fotoUrl: ''
  });

  useEffect(() => {
    if (open) {
      if (profissional) {
        setFormData({...profissional, senha: ''}); 
      } else {
        setFormData({
          nomeUsuario: '',
          email: '',
          senha: '',
          cpf: '',
          telefone: '',
          fotoUrl: ''
        });
      }
    }
  }, [profissional, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profissional?.idUsuario && !formData.senha) {
      const { senha, ...dataSemSenha } = formData;
      onSave(dataSemSenha);
    } else {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              {profissional?.idUsuario ? 'Editar Profissional' : 'Adicionar Novo Profissional'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomeUsuario" className="text-right">Nome</Label>
              <Input id="nomeUsuario" name="nomeUsuario" value={formData.nomeUsuario} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="senha" className="text-right">Senha</Label>
              <Input 
                id="senha" 
                name="senha" 
                type="password" 
                value={formData.senha} 
                onChange={handleChange} 
                className="col-span-3 bg-gray-700 border-gray-600"
                placeholder={profissional?.idUsuario ? 'Deixe em branco para não alterar' : 'Senha obrigatória'}
                required={!profissional?.idUsuario} 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpf" className="text-right">CPF</Label>
              <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">Telefone</Label>
              <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fotoUrl" className="text-right">URL da Foto</Label>
              <Input id="fotoUrl" name="fotoUrl" value={formData.fotoUrl} onChange={handleChange} className="col-span-3 bg-gray-700 border-gray-600" required />
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