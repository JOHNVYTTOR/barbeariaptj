import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Navigation } from "@/components/ui/navigation"; // Comentado caso não esteja em uso
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from '@/api'; // Corrigido o caminho da importação

// --- Interfaces ---

// Interface para o objeto de serviço
interface Servico {
  idServico: number;
  nomeServico: string;
  preco: number; 
}

// Interface (baseada no Dashboard.tsx) para o objeto de horário vindo da API
interface HorarioDisponivelAPI {
  idHorarioDisponivel: number;
  horarios: string; // Vem como string ISO, ex: "2025-10-28T09:30:00"
  disponivel: boolean;
}

// --- Tipo para o Horário Selecionado ---
// Guarda o objeto inteiro (ID + string de hora)
type HorarioSelecionado = {
  id: number;
  horarioString: string; // ex: "10:30"
  horarioISO: string;    // ex: "2025-10-30T10:30:00"
} | null;


// --- FUNÇÃO GERADORA DE TEMPLATE (MESMA DO DASHBOARD) ---
// (Colocada fora do componente)
/**
 * Gera um template de horários padrão para um dia específico.
 * @param selectedDate O dia para o qual gerar os horários.
 * @returns Um array de objetos HorarioDisponivelAPI (com IDs nulos).
 */
const generateDailyTemplate = (selectedDate: Date): HorarioDisponivelAPI[] => {
  const template: HorarioDisponivelAPI[] = [];
  const date = new Date(selectedDate);

  // Helper para formatar YYYY-MM-DD
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const dateString = `${yyyy}-${mm}-${dd}`;

  // Helper para criar o objeto HorarioDisponivelAPI
  const createEntry = (h: number, m: number): HorarioDisponivelAPI => {
    // Cria o horário no formato ISO local correto, sem conversão UTC
    const horarioISO = `${dateString}T${pad(h)}:${pad(m)}:00`;
    
    return {
      // ID é nulo, mas criamos um ID temporário negativo baseado no timestamp
      // para que o React possa usá-lo como 'key'
      idHorarioDisponivel: -(new Date(horarioISO).getTime()), 
      horarios: horarioISO,
      disponivel: true, // Padrão é disponível
    };
  };

  // Helper para incrementar 45 minutos
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


// --- Componente de Agendamento ---

const Agendamento = () => {
  // --- Estados de Controle ---
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // --- Estado de Horário Atualizado ---
  // Armazena o objeto completo { id, horarioString, horarioISO }
  const [selectedTime, setSelectedTime] = useState<HorarioSelecionado>(null); 
  
  const [nome, setClientNome] = useState(""); // Revertido para estado de string simples

  // --- Estados de Dados (Serviços) ---
  const [apiServices, setApiServices] = useState<Servico[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // --- Estados de Dados (Horários) ---
  // Armazena a lista de objetos HorarioSelecionado
  const [availableTimes, setAvailableTimes] = useState<HorarioSelecionado[]>([]); 
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);

  // Estado para controlar o botão de confirmação
  const [isConfirming, setIsConfirming] = useState(false); 

  // --- Efeitos (Hooks) ---

  // useEffect para buscar os serviços da API (Passo 1)
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
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // useEffect para buscar horários disponíveis quando a data (selectedDate) mudar (Passo 2)
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

      try {
        // Formata a data para o formato YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        // Endpoint baseado no Dashboard.tsx: /horarios/disponiveis/{data}
        const response = await api.get(`/horarios/disponiveis/${formattedDate}`);
        
        if (response.data && response.data.length > 0) {
          // 1. O dia já tem horários salvos no DB
          horariosDoDia = response.data;
        } else {
          // 2. Dia sem horários (200 OK, mas array vazio). Geramos o template.
          horariosDoDia = generateDailyTemplate(selectedDate);
        }

      } catch (error: any) {
        if (error.response?.status === 404) {
          // 3. Dia sem horários (404 Not Found). Geramos o template.
          horariosDoDia = generateDailyTemplate(selectedDate);
        } else {
          // 4. Erro real
          errorOccurred = true;
          console.error("Erro ao buscar horários:", error);
          setTimesError("Não foi possível carregar os horários. Tente outra data.");
        }
      } 
      
      if (!errorOccurred) {
        // Processa a lista (vinda da API ou do Template)
        const horariosDisponiveis = horariosDoDia
          // 1. Filtra apenas os que estão marcados como 'disponivel: true'
          .filter(horario => horario.disponivel === true)
          // 2. Ordena pela data/hora (string ISO)
          .sort((a, b) => new Date(a.horarios).getTime() - new Date(b.horarios).getTime())
          // 3. Mapeia para o formato que o estado precisa
          .map(horario => {
            const dataObj = new Date(horario.horarios);
            const horas = dataObj.getHours().toString().padStart(2, '0');
            const minutos = dataObj.getMinutes().toString().padStart(2, '0');
            return {
              id: horario.idHorarioDisponivel,
              horarioString: `${horas}:${minutos}`,
              horarioISO: horario.horarios
            };
          });

        setAvailableTimes(horariosDisponiveis); 
      }
      
      setIsLoadingTimes(false);
    };

    fetchAvailableTimes();
  }, [selectedDate]); // Array de dependência: roda sempre que 'selectedDate' mudar

  // --- Handlers (Funções de Ação) ---

  const handleServiceChange = (serviceId: number) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  };

  // Função helper para formatar o preço
  const formatCurrency = (preco: number) => {
    let numericPrice: number;
    if (typeof preco === 'number') {
      numericPrice = preco;
    } else {
      numericPrice = parseFloat(String(preco).replace("R$ ", "").replace(",", "."));
    }

    if (isNaN(numericPrice)) {
      return "R$ --"; // Valor inválido
    }

    return numericPrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Navegação entre os passos
  const handleNext = () => {
    if (step === 1 && selectedServices.length === 0) {
      toast.error("Selecione um serviço", {
        description: "Por favor, escolha pelo menos um serviço.",
      });
      return;
    }
    if (step === 2 && !selectedTime) { // Verifica se selectedTime (o objeto) é nulo
      toast.error("Selecione data e horário", {
        description: "Por favor, escolha uma data e horário.",
      });
      return;
    }
    setStep(step + 1);
  };

  // Confirmação final do agendamento (COM AUTOMAÇÃO)
  const handleConfirm = async () => {
    if (!nome) {
      toast.error("Campo obrigatório", {
        description: "Por favor, informe seu nome para o agendamento.",
      });
      return;
    }
    
    // Verifica se selectedTime não é nulo (necessário para o TypeScript)
    if (!selectedTime || !selectedServicesData.length) {
       toast.error("Erro interno", {
        description: "Informações de horário ou serviço perdidas. Tente novamente.",
      });
      return;
    }

    setIsConfirming(true); // Desativa o botão

    // 1. Payload para CRIAR o agendamento
    const payloadAgendamento = {
      // REVERTIDO: Usa um ID de usuário fixo (1)
      usuario: { idUsuario: 1 }, 
      servico: { idServico: selectedServicesData[0].idServico },
      dataHora: selectedTime.horarioISO, // Usa o ISO do objeto 'selectedTime'
      nomeCliente: nome // Adiciona o nome digitado
    };

    try {
      // --- AÇÃO 1: Criar o Agendamento ---
      await api.post('/agendamentos', payloadAgendamento);

      // --- AÇÃO 2: Marcar o Horário como Indisponível ---
      // Só executa se o ID do horário for válido (não for um template negativo)
      if (selectedTime.id > 0) {
        try {
          await api.put(`/horarios/${selectedTime.id}/disponibilidade`, null, { 
            params: { disponivel: false } 
          });
        } catch (error) {
          // Loga o erro mas não bloqueia o usuário, pois o agendamento principal funcionou
          console.error("Falha ao atualizar disponibilidade do horário:", error);
        }
      }

      toast.success("Agendamento confirmado!", {
        description: "Seu horário foi agendado com sucesso.",
      });

      // Resetar o formulário
      setStep(1);
      setSelectedServices([]);
      setSelectedDate(new Date());
      setSelectedTime(null);
      setClientNome("");

    } catch (error: any) {
      console.error("Erro ao confirmar agendamento:", error);
      const errorMsg = error.response?.data?.message || error.message || "Erro desconhecido";
      toast.error("Erro no agendamento", { description: `Falha ao criar agendamento: ${errorMsg}` });
    } finally {
      setIsConfirming(false); // Reativa o botão
    }
  };

  // Helper para formatar data no Resumo (Passo 3)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // --- Funções de Renderização ---

  // Renderiza o conteúdo do Passo 1 (Serviços)
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
      <div className="space-y-4">
        {apiServices.map((service) => (
          <Label
            key={service.idServico}
            htmlFor={`service-${service.idServico}`}
            className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer data-[state=checked]:border-primary"
          >
            <div className="flex items-center space-x-4">
              <Checkbox
                id={`service-${service.idServico}`}
                checked={selectedServices.includes(service.idServico)}
                onCheckedChange={() => handleServiceChange(service.idServico)}
              />
              <span className="font-medium">{service.nomeServico}</span>
            </div>
            <span className="text-yellow-400 font-bold">{formatCurrency(service.preco)}</span>
          </Label>
        ))}
      </div>
    );
  };

  // --- Cálculo de Totais (Memorização) ---
  const selectedServicesData = apiServices.filter(s => selectedServices.includes(s.idServico));

  const totalPrice = selectedServicesData.reduce((total, servico) => {
    let numericPrice: number;
    if (typeof servico.preco === 'number') {
      numericPrice = servico.preco;
    } else {
      numericPrice = parseFloat(String(servico.preco).replace("R$ ", "").replace(",", "."));
    }
    return total + (isNaN(numericPrice) ? 0 : numericPrice);
  }, 0);


  // --- Renderização Principal (JSX) ---

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors duration-300">
      {/* <Navigation /> */} 
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12 mt-20">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-yellow-400">Agendamento</span> Online
          </h1>
          <p className="text-xl text-gray-400">
            Reserve seu horário em apenas 3 passos simples
          </p>
        </div>

        {/* Indicador de Passos */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
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
                {stepNum < 3 && (
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
              {step === 1 && "Escolha os Serviços"}
              {step === 2 && "Escolha a Data e Horário"}
              {step === 3 && "Confirme seus Dados"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            
            {/* Conteúdo do Passo 1 */}
            {step === 1 && renderStepOne()}

            {/* Conteúdo do Passo 2 */}
            {step === 2 && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecione a Data</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null); // Reseta o horário ao mudar a data
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
                      <div className="col-span-3 text-center text-gray-400">Nenhum horário disponível para esta data.</div>
                    ) : (
                      // Mapeia sobre os horários filtrados e formatados
                      availableTimes.map((timeObj) => (
                        <Button
                          key={timeObj.id} // Usa o ID como chave
                          variant={selectedTime?.id === timeObj.id ? "default" : "outline"}
                          onClick={() => setSelectedTime(timeObj)} // Salva o objeto inteiro
                          className={`h-12 ${selectedTime?.id === timeObj.id ? "bg-yellow-400 text-black" : "border-gray-600 text-gray-200 hover:bg-gray-700"}`}
                        >
                          {timeObj.horarioString} {/* Mostra "10:30" */}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo do Passo 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Seu Nome:</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setClientNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                    // REVERTIDO: Campo de nome é sempre editável
                  />
                </div>
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-100">Resumo do Agendamento</h4>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p><strong>Serviços:</strong> {selectedServicesData.map(s => s.nomeServico).join(', ')}</p>
                    <p><strong>Valor Total:</strong> {formatCurrency(totalPrice)}</p>
                    <p><strong>Data:</strong> {selectedDate ? formatDate(selectedDate) : "Não selecionada"}</p>
                    <p><strong>Horário:</strong> {selectedTime?.horarioString}</p> {/* Mostra "10:30" */}
                  </div>
                </div>
              </div>
            )}

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
              
              {step < 3 ? (
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
                  disabled={isConfirming} // Desativa o botão ao confirmar
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


