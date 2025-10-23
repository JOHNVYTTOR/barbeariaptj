import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // 1. Importar o Checkbox
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from '../api.ts';

const Agendamento = () => {
  const [step, setStep] = useState(1);
  // 2. O estado agora é um array de strings para guardar vários IDs
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");

  const services = [
    { id: "corte", name: "Corte", price: "R$ 35" },
    { id: "barba", name: "Barba", price: "R$ 35" },
    { id: "sobrancelha", name: "Sobrancelha", price: "R$ 10" },
    { id: "corte+barba", name: "Corte e Barba", price: "R$ 60" },
    { id: "corte+barba+sobrancelha", name: "Corte, Barba e Sobrancelha", price: "R$ 70" },
    { id: "corte+sobrancelha", name: "Corte e Sobrancelha", price: "R$ 45" },
    { id: "corte+platinado", name: "Corte + Platinado", price: "R$ 130" },
    { id: "corte+platinado+sobrancelha", name: "Corte + Platinado, e Sobrancelha", price: "R$ 140" },
    { id: "corte+platinado+barba+sobrancelha", name: "Corte + Platinado, Barba e Sobrancelha", price: "R$ 160" },
  ];

  const timeSlots = [
    "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  // 3. Lógica para lidar com a seleção/desseleção de serviços
  const handleServiceChange = (serviceId: string) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId] 
    );
  };

  const selectedServicesData = services.filter(s => selectedServices.includes(s.id));
  const totalPrice = selectedServicesData.reduce((total, service) => {
    const price = parseFloat(service.price.replace("R$ ", "").replace(",", "."));
    return total + price;
  }, 0);

  const handleNext = () => {
    if (step === 1 && selectedServices.length === 0) { // Validação para o array
      toast.error("Selecione um serviço", {
        description: "Por favor, escolha pelo menos um serviço.",
      });
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast.error("Selecione data e horário", {
        description: "Por favor, escolha uma data e horário.",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleConfirm = async () => {
    if (!clientName) {
      toast.error("Campo obrigatório", {
        description: "Por favor, informe seu nome para o agendamento.",
      });
      return;
    }

    try {
        const serviceNames = selectedServicesData.map(s => s.name).join(', ');
        const response = await api.post('/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientName: clientName,
                service: serviceNames,
                date: selectedDate?.toISOString().split('T')[0],
                time: selectedTime,
            })
        });

        toast.success("Agendamento confirmado!", {
            description: "Seu horário foi agendado com sucesso. Você receberá uma confirmação.",
        });

        setStep(1);
        setSelectedServices([]); // Limpa o array de serviços
        setSelectedDate(new Date());
        setSelectedTime("");
        setClientName("");

    } catch (error: any) {
        toast.error("Erro no agendamento", { description: error.message });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors duration-300">
      <Navigation />
     
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12 mt-20">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-yellow-400">Agendamento</span> Online
          </h1>
          <p className="text-xl text-gray-400">
            Reserve seu horário em apenas 3 passos simples
          </p>
        </div>

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

        <Card className="border-gray-700 bg-gray-800 shadow-lg">
          <CardHeader className="bg-gray-800">
            <CardTitle className="text-2xl text-center text-gray-100">
              {step === 1 && "Escolha os Serviços"}
              {step === 2 && "Escolha a Data e Horário"}
              {step === 3 && "Confirme seus Dados"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-4">
                {/* 5. A UI agora usa Checkbox em vez de RadioGroup */}
                {services.map((service) => (
                  <Label
                    key={service.id}
                    htmlFor={service.id}
                    className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer data-[state=checked]:border-primary"
                  >
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceChange(service.id)}
                      />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <span className="text-yellow-400 font-bold">{service.price}</span>
                  </Label>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecione a Data</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    className="rounded-md border border-gray-700 bg-gray-800 text-gray-100"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecione o Horário</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className={`h-12 ${selectedTime === time ? "bg-yellow-400 text-black" : "border-gray-600 text-gray-200 hover:bg-gray-700"}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Seu Nome:</Label>
                  <Input
                      id="clientName"
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                  />
                </div>
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-100">Resumo do Agendamento</h4>
                  <div className="space-y-1 text-sm text-gray-400">
                    {/* 6. Exibição dos serviços e preço total atualizados */}
                    <p><strong>Serviços:</strong> {selectedServicesData.map(s => s.name).join(', ')}</p>
                    <p><strong>Valor Total:</strong> {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p><strong>Data:</strong> {selectedDate ? formatDate(selectedDate) : "Não selecionada"}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                  </div>
                </div>
              </div>
            )}

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
                 >
                  Confirmar Agendamento
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