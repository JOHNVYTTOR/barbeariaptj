import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input"; // Removido (não precisamos mais do input de nome)
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from '../api.ts'; 
import { format } from 'date-fns'; 
import { useAuth } from '../hooks/useAuth'; // 1. IMPORTAR AUTENTICAÇÃO

// --- Interfaces ---

interface Servico {
  idServico: number;
  nomeServico: string;
  preco: number; 
}

interface Usuario {
  idUsuario: number;
  nomeUsuario: string;
  email: string;
  cpf: string;
  telefone: string;
  fotoUrl: string; 
  tipoUsuario: {
    id: number;
    nomeTipoUsuario: string;
  };
}

interface AgendamentoSimples {
  idAgendamento: number;
  dataHora: string; 
  status: 'Pendente' | 'Concluído' | 'Cancelado';
}

interface HorarioDisponivelAPI {
  idHorarioDisponivel: number;
  horarios: string; 
  disponivel: boolean;
}

// --- Tipos para o Estado ---

interface HorarioParaLista { 
  id: number;
  horarioString: string;
  horarioISO: string;
  isPast: boolean; 
  estaAgendado: boolean; 
  disponivel: boolean;
}

type HorarioSelecionado = {
  id: number;
  horarioString: string; 
  horarioISO: string;
  isPast: boolean; 
} | null;


// --- FUNÇÃO GERADORA DE TEMPLATE (Sem mudanças) ---
const generateDailyTemplate = (selectedDate: Date): HorarioDisponivelAPI[] => {
  const template: HorarioDisponivelAPI[] = [];
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  // --- Helpers ---
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const dateString = `${yyyy}-${mm}-${dd}`;

  const createEntry = (h: number, m: number): HorarioDisponivelAPI => {
    const horarioISO = `${dateString}T${pad(h)}:${pad(m)}:00`;
    return {
      idHorarioDisponivel: -(new Date(horarioISO).getTime()), 
      horarios: horarioISO,
      disponivel: true, 
    };
  };

  const incrementTime = (h: number, m: number): {h: number, m: number} => {
      m += 45; // Mantém o incremento de 45 minutos
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
      return {h, m};
  };

  // --- Definições de Horários por Dia ---
  let h: number, m: number;
  let morningStartH = 0, morningStartM = 0;
  let morningEndH = 0, morningEndM = 0;
  let afternoonStartH = 0, afternoonStartM = 0;
  let afternoonEndH = 0, afternoonEndM = 0;
  let hasLunchBreak = true;

  switch (dayOfWeek) {
    case 1: // Segunda
    case 2: // Terça
    case 4: // Quinta
      morningStartH = 9; morningStartM = 0;  // 09:00
      morningEndH = 12; morningEndM = 0;    // 12:00
      afternoonStartH = 13; afternoonStartM = 0; // 13:00
      afternoonEndH = 19; afternoonEndM = 30;  // 19:30
      break;
    
    case 3: // Quarta
      morningStartH = 9; morningStartM = 0;  // 09:00
      morningEndH = 12; morningEndM = 30;   // 12:30
      afternoonStartH = 13; afternoonStartM = 0; // 13:00
      afternoonEndH = 19; afternoonEndM = 30;  // 19:30
      break;

    case 5: // Sexta
      morningStartH = 9; morningStartM = 0;  // 09:00
      morningEndH = 12; morningEndM = 0;    // 12:00
      afternoonStartH = 13; afternoonStartM = 0; // 13:00
      afternoonEndH = 20; afternoonEndM = 0;   // 20:00
      break;

    case 6: // Sábado
      morningStartH = 10; morningStartM = 0; // 10:00
      morningEndH = 18; morningEndM = 0;   // 18:00
      hasLunchBreak = false; // Sem pausa para almoço
      break;

    case 0: // Domingo
    default:
      return []; // Fechado
  }

  // --- Geração de Slots ---

  // Manhã (ou dia todo, se não houver pausa)
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
    // Tarde
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


// --- Componente de Agendamento ---

const Agendamento = () => {
  const navigate = useNavigate(); 
  const { user } = useAuth(); // 2. PEGAR O USUÁRIO LOGADO

  // --- Estados de Controle ---
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedProfissional, setSelectedProfissional] = useState<number | null>(null); 
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [selectedTime, setSelectedTime] = useState<HorarioSelecionado>(null); 
  // const [nomeUsuario, setNomeUsuario] = useState(""); // 3. REMOVIDO (Não é mais necessário)

  // --- Estados de Dados (Serviços) ---
  const [apiServices, setApiServices] = useState<Servico[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // --- Estados de Dados (Profissionais) ---
  const [profissionais, setProfissionais] = useState<Usuario[]>([]);
  const [isLoadingProfissionais, setIsLoadingProfissionais] = useState(true);
  const [profissionaisError, setProfissionaisError] = useState<string | null>(null);

  // --- Estados de Dados (Horários) ---
  const [availableTimes, setAvailableTimes] = useState<HorarioParaLista[]>([]); 
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState(false); 

  // --- Efeitos (Hooks) ---

  // useEffect para buscar os serviços (Passo 1)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const response = await api.get('/servicos');
        setApiServices(response.data); 
        setServicesError(null);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        setServicesError("Não foi possível carregar os serviços. Tente novamente mais tarde.");
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []); 

  // useEffect para buscar os profissionais (Passo 2)
  useEffect(() => {
    const fetchProfissionais = async () => {
      try {
        setIsLoadingProfissionais(true);
        const response = await api.get('/usuarios');
        const admins = response.data.filter(
          (u: Usuario) => u.tipoUsuario?.nomeTipoUsuario === 'Admin'
        );
        setProfissionais(admins);
        setProfissionaisError(null);
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
        setProfissionaisError("Não foi possível carregar os profissionais. Tente novamente mais tarde.");
      } finally {
        setIsLoadingProfissionais(false);
      }
    };
    fetchProfissionais();
  }, []);

  // ===== ATUALIZADO: useEffect para buscar horários (Passo 3) =====
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      return;
    }

    const fetchAvailableTimes = async () => {
      setIsLoadingTimes(true);
      setTimesError(null);
      setAvailableTimes([]); 

      let horariosDoDia: HorarioDisponivelAPI[] = [];
      let errorOccurred = false;
      let currentAgendamentos: AgendamentoSimples[] = []; // <-- 1. Array para agendamentos

      const dateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      try {
        // 2. Busca TODOS os agendamentos existentes primeiro
        const agendamentosResponse = await api.get('/agendamentos');
        currentAgendamentos = agendamentosResponse.data;

        // 3. Busca os horários do dia (API ou Template)
        const formattedDate = dateOnly.toISOString().split('T')[0];
        const response = await api.get(`/horarios/disponiveis/${formattedDate}`);
        
        if (response.data && response.data.length > 0) {
          horariosDoDia = response.data;
        } else {
          horariosDoDia = generateDailyTemplate(dateOnly); 
        }

      } catch (error: any) {
        if (error.response?.status === 404) {
          // Se 404 (horários não cadastrados), usa o template
          horariosDoDia = generateDailyTemplate(dateOnly); 
        } else {
          errorOccurred = true;
          console.error("Erro ao buscar horários ou agendamentos:", error);
          setTimesError("Não foi possível carregar os horários. Tente outra data.");
        }
      } 
      
      if (!errorOccurred) {
        
        // 4. Cria o Set (lista) de horários JÁ OCUPADOS (Pendentes ou Concluídos)
        const horariosAgendados = new Set(
          currentAgendamentos
            // Filtra agendamentos do dia selecionado E que não estejam cancelados
            .filter(ag => 
              ag.status !== 'Cancelado' &&
              format(new Date(ag.dataHora), 'yyyy-MM-dd') === format(dateOnly, 'yyyy-MM-dd')
            )
            .map(ag => new Date(ag.dataHora).toISOString()) // Converte para ISO string (ex: ...T12:00:00Z)
        );

        const now = new Date();
        const isToday = dateOnly.toDateString() === now.toDateString(); 

        const horariosDisponiveis = horariosDoDia
          .map(horario => { // 5. Mapeia TODOS os horários do template/API
            const dataObj = new Date(horario.horarios);
            // Converte o horário do template para o MESMO formato ISO string
            const horarioIso = dataObj.toISOString(); 
            
            // 6. VERIFICA SE O HORÁRIO ESTÁ NA LISTA DE OCUPADOS
            const estaAgendado = horariosAgendados.has(horarioIso); 
            
            const isPast = isToday && dataObj < now; 
            const horas = dataObj.getHours().toString().padStart(2, '0');
            const minutos = dataObj.getMinutes().toString().padStart(2, '0');
            
            return {
              id: horario.idHorarioDisponivel,
              horarioString: `${horas}:${minutos}`,
              horarioISO: horario.horarios, // Envia o ISO local (ex: ...T09:00:00)
              isPast: isPast,
              estaAgendado: estaAgendado, // Flag para o botão
              disponivel: horario.disponivel // Disponibilidade do admin
            };
          })
          // 7. Filtra a lista final
          .filter(horario => 
            horario.disponivel === true && // Se o admin marcou como disponível
            !horario.estaAgendado         // E SE NÃO estiver na lista de agendados
          ) 
          .sort((a, b) => new Date(a.horarioISO).getTime() - new Date(b.horarioISO).getTime());

        setAvailableTimes(horariosDisponiveis); 
      }
      
      setIsLoadingTimes(false);
    };

    fetchAvailableTimes();
  }, [selectedDate]); // Roda sempre que a data mudar

  // --- Handlers (Funções de Ação) ---

  const handleServiceChange = (value: string) => {
    setSelectedService(parseInt(value, 10));
  };

  const formatCurrency = (preco: number | string) => { 
    let numericPrice: number;
    if (typeof preco === 'number') {
      numericPrice = preco;
    } else {
      numericPrice = parseFloat(String(preco).replace("R$ ", "").replace(",", "."));
    }
    if (isNaN(numericPrice)) return "R$ --"; 
    return numericPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getNumericPrice = (preco: number | string): number => {
    if (typeof preco === 'number') return preco;
    const numericPrice = parseFloat(String(preco).replace("R$ ", "").replace(",", "."));
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  // Validação handleNext (sem mudança)
  const handleNext = () => {
    if (step === 1 && !selectedService) { 
      toast.error("Selecione um serviço", { description: "Por favor, escolha um serviço." });
      return;
    }
    if (step === 2 && !selectedProfissional) {
      toast.error("Selecione um profissional", { description: "Por favor, escolha um profissional para o atendimento." });
      return;
    }
    if (step === 3 && !selectedTime) { 
      toast.error("Selecione data e horário", { description: "Por favor, escolha uma data e horário." });
      return;
    }
    setStep(step + 1);
  };

  const selectedServiceData = apiServices.find(s => s.idServico === selectedService);
  const totalPrice = selectedServiceData ? getNumericPrice(selectedServiceData.preco) : 0;


  // ===== 4. ATUALIZADO: handleConfirm =====
  const handleConfirm = async () => {
    
    // 4a. Verifica se o usuário está logado ANTES de tudo
    if (!user) {
      toast.error("Login Obrigatório", {
        description: "Você precisa estar logado para confirmar um agendamento.",
      });
      navigate('/login'); // Envia para a tela de login
      return;
    }
    
    // 4b. Remove a verificação de 'nomeUsuario'
    // if (!nomeUsuario) { ... } // REMOVIDO

    // 4c. A verificação de dados principais continua
    if (!selectedTime || !selectedServiceData || !selectedProfissional) {
        toast.error("Erro interno", { description: "Informações de horário, serviço ou profissional perdidas. Tente novamente." });
      return;
    }

    setIsConfirming(true); 

    // 4d. Payload atualizado para usar o 'user' logado
    const payloadAgendamento = {
      usuario: { idUsuario: user.idUsuario }, // Usa o ID do usuário logado
      servico: { idServico: selectedServiceData.idServico },
      profissional: { idUsuario: selectedProfissional },
      dataHora: selectedTime.horarioISO,
      nomeCliente: user.nomeUsuario, // Usa o NOME do usuário logado
      status: 'Pendente' 
    };

    try {
      await api.post('/agendamentos', payloadAgendamento);

      // Lógica para ATUALIZAR O HORÁRIO (colocada aqui)
      if (selectedTime.id > 0) {
        try {
          await api.put(`/horarios/${selectedTime.id}/disponibilidade`, null, { 
            params: { disponivel: false } 
          });
        } catch (error) {
          console.error("Falha ao atualizar disponibilidade do horário:", error);
        }
      }
      // ===== FIM DA CORREÇÃO DE BUG (bloco 'try' interno estava fechando o 'try' principal) =====

      toast.success("Agendamento confirmado!", { description: "Seu horário foi agendado com sucesso." });

      // LÓGICA DO WHATSAPP (Como pedida anteriormente)
      try {
        const numeroBarbearia = "5515999998888"; // 👈 MUDE ISSO PARA O SEU NÚMERO

        const servicoNome = selectedServiceData.nomeServico;
        const profSelecionado = profissionais.find(p => p.idUsuario === selectedProfissional);
        const profNome = profSelecionado ? profSelecionado.nomeUsuario : "Profissional";
        const dataString = selectedDate ? formatDate(selectedDate) : "Data";
        const horaString = selectedTime.horarioString;

        // 4e. Mensagem do WhatsApp usa o 'user' logado
        const mensagem = `Olá! Acabei de confirmar meu agendamento:\n\n*Cliente:* ${user.nomeUsuario}\n*Serviço:* ${servicoNome}\n*Profissional:* ${profNome}\n*Data:* ${dataString}\n*Horário:* ${horaString}\n\nObrigado!`;
        const urlWhatsApp = `https://wa.me/${numeroBarbearia}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsApp, '_blank'); // <-- Adicionado o window.open que estava faltando
      } catch (waError) {
        console.error("Erro ao tentar abrir WhatsApp:", waError);
      }

      // Resetar estados
      setStep(1);
      setSelectedService(null);
      setSelectedProfissional(null); 
      setSelectedDate(new Date());
      setSelectedTime(null);
      // setNomeUsuario(""); // 4f. REMOVIDO
      navigate('/'); 
    } catch (error: any) {
      console.error("Erro ao confirmar agendamento:", error);
      const errorMsg = error.response?.data?.message || error.message || "Erro desconhecido";
      toast.error("Erro no agendamento", { description: `Falha ao criar agendamento: ${errorMsg}` });
    } finally {
      setIsConfirming(false); 
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // --- Funções de Renderização ---

  // renderStepOne (Seleção Única - Sem mudança)
  const renderStepOne = () => {
    if (isLoadingServices) {
      return <div className="text-center p-8 text-gray-400">Carregando serviços...</div>;
    }
    if (servicesError) {
      return <div className="text-center p-8 text-red-400">{servicesError}</div>;
    }
    if (apiServices.length === 0) {
      return <div className="text-center p-8 text-gray-400">Nenhum serviço disponível no momento.</div>;
    }
    return (
      <RadioGroup
        value={selectedService?.toString()}
        onValueChange={handleServiceChange}
        className="space-y-4"
      >
        {apiServices.map((service) => (
          <Label
            key={service.idServico}
            htmlFor={`service-${service.idServico}`}
            className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer data-[state=checked]:border-yellow-400"
          >
            <div className="flex items-center space-x-4">
              <RadioGroupItem
                id={`service-${service.idServico}`}
                value={service.idServico.toString()}
              />
              <span className="font-medium">{service.nomeServico}</span>
            </div>
            <span className="text-yellow-400 font-bold">{formatCurrency(service.preco)}</span>
          </Label>
        ))}
      </RadioGroup>
    );
  };

  // renderStepTwo (Profissionais - Sem mudança)
  const renderStepTwo = () => {
    if (isLoadingProfissionais) {
      return <div className="text-center p-8 text-gray-400">Carregando profissionais...</div>;
    }
    if (profissionaisError) {
      return <div className="text-center p-8 text-red-400">{profissionaisError}</div>;
    }
    if (profissionais.length === 0) {
      return <div className="text-center p-8 text-gray-400">Nenhum profissional disponível no momento.</div>;
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {profissionais.map((prof) => (
          <div
            key={prof.idUsuario}
            onClick={() => setSelectedProfissional(prof.idUsuario)}
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${selectedProfissional === prof.idUsuario
                ? 'border-yellow-400 bg-gray-700 shadow-lg' 
                : 'border-gray-700 hover:bg-gray-700'
              }
            `}
          >
            <img
              src={prof.fotoUrl || `https://placehold.co/80x80/333/FFF?text=${prof.nomeUsuario.charAt(0)}`}
              alt={prof.nomeUsuario}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-600 mb-3"
              onError={(e) => (e.currentTarget.src = `https://placehold.co/80x80/333/FFF?text=${prof.nomeUsuario.charAt(0)}`)}
            />
            <span className="font-medium text-center">{prof.nomeUsuario}</span>
          </div>
        ))}
      </div>
    );
  };

  // ===== ATUALIZADO: renderStepThree (Horários) =====
  const renderStepThree = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Selecione a Data</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            setSelectedTime(null); 
          }}
          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
          className="rounded-md border border-gray-700 bg-gray-800 text-gray-100"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Selecione o Horário</h3>
        <div className="grid grid-cols-3 gap-3">
          {isLoadingTimes ? (
            <div className="col-span-3 text-center text-gray-400">Carregando horários...</div>
          ) : timesError ? (
            <div className="col-span-3 text-center text-red-400">{timesError}</div>
          ) : availableTimes.length === 0 ? (
            // Mensagem atualizada: agora sabemos que é porque estão ocupados ou fechados
            <div className="col-span-3 text-center text-gray-400">Nenhum horário disponível. (Ocupados ou Fechado)</div>
          ) : (
            // A lista 'availableTimes' agora SÓ CONTÉM horários disponíveis
            availableTimes.map((timeObj) => ( 
              <Button
                key={timeObj.id} 
                variant={selectedTime?.id === timeObj.id ? "default" : "outline"}
                onClick={() => setSelectedTime(timeObj)} 
                // A lógica de 'estaAgendado' já foi tratada no filtro,
                // mas mantemos 'isPast' para horários de hoje que já passaram.
                disabled={timeObj.isPast} 
                className={`h-12 ${
                  selectedTime?.id === timeObj.id 
                    ? "bg-yellow-400 text-black" 
                    : "border-gray-600 text-gray-200 hover:bg-gray-700"
                } ${
                  // Desabilita e risca se for passado
                  timeObj.isPast ? "opacity-50 line-through cursor-not-allowed" : "" 
                }`}
              >
                {timeObj.horarioString} 
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
  // ========================================================

  // ===== 5. ATUALIZADO: renderStepFour (Resumo) =====
  // (Removida a definição duplicada que estava no seu código)
  const renderStepFour = () => {
    const profSelecionado = profissionais.find(p => p.idUsuario === selectedProfissional);
    
    // Se o usuário não estiver logado (embora o 'handleConfirm' vá bloquear),
    // é bom ter uma verificação aqui.
    if (!user) {
      return (
        <div className="text-center p-8 text-yellow-400">
          <p>Carregando dados do usuário...</p>
          <p>Se você não for redirecionado, por favor, faça o login.</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-6">
        
        {/* 5a. REMOVIDO o Input de "Seu Nome" */}
        {/* <div className="space-y-2">
          <Label htmlFor="nomeUsuario">Seu Nome:</Label>
          <Input ... />
        </div> */}

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-100">Resumo do Agendamento</h4>
          <div className="space-y-1 text-sm text-gray-400">
            {/* 5b. Resumo atualizado para usar o 'user' logado */}
            <p><strong>Cliente:</strong> {user.nomeUsuario}</p> 
            <p><strong>Serviço:</strong> {selectedServiceData?.nomeServico || "Não selecionado"}</p>
            <p><strong>Valor Total:</strong> {formatCurrency(totalPrice)}</p>
            <p><strong>Profissional:</strong> {profSelecionado?.nomeUsuario || "Não selecionado"}</p>
            <p><strong>Data:</strong> {selectedDate ? formatDate(selectedDate) : "Não selecionada"}</p>
            <p><strong>Horário:</strong> {selectedTime?.horarioString}</p> 
          </div>
        </div>
      </div>
    );
  };


  // --- Renderização Principal (JSX) ---

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12 mt-20">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-yellow-400">Agendamento</span> Online
          </h1>
          <p className="text-xl text-gray-400">
            Reserve seu horário em apenas 4 passos simples
          </p>
        </div>

        {/* Indicador de Passos */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step > stepNum ? <Check size={20} /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNum ? "bg-yellow-400" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card Principal */}
        <Card className="border-gray-700 bg-gray-800 shadow-lg">
          <CardHeader className="bg-gray-800">
            <CardTitle className="text-2xl text-center text-gray-100">
              {step === 1 && "Escolha o Serviço"}
              {step === 2 && "Escolha o Profissional"}
              {step === 3 && "Escolha a Data e Horário"}
              {step === 4 && "Confirme seus Dados"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
            {step === 4 && renderStepFour()}

            {/* Botões de Navegação */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="border-gray-600 text-gray-200 hover:bg-gray-700"
              >
                <ChevronLeft size={20} className="mr-2" />
                Voltar
              </Button>
              
              {step < 4 ? (
                <Button
                  onClick={handleNext} 
                  className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
                >
                  Próximo
                  <ChevronRight size={20} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleConfirm} 
                  className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
                  disabled={isConfirming} 
                >
                  {isConfirming ? "Confirmando..." : "Confirmar Agendamento"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Agendamento;