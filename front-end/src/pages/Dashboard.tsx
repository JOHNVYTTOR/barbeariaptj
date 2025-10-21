// Local: front-end/src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { format } from "date-fns";
import api from "@/api"; // Importa o api
import { Sidebar } from "@/components/ui/sidebar"; // Importa o Sidebar

// --- INTERFACE (BOA PRÁTICA) ---
interface Agendamento {
  id: number;
  clientName: string;
  service: string;
  date: string; // O backend envia como "yyyy-MM-dd"
  time: string;
  status: string | null; // (Assumindo que o backend envia um status)
}
// ---------------------------------

// --- MUDE DE 'export function' PARA 'const' ---
const Dashboard = () => {
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CHAMADA GET: BUSCAR AGENDAMENTOS ---
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // O interceptor 'api.ts' adiciona o token de Admin automaticamente
        const response = await api.get('/api/appointments'); 
        setAppointments(response.data);
      } catch (error) {
        // O interceptor já trata 401 (Não Autorizado) ou 403 (Proibido)
        if (error instanceof AxiosError && error.response) {
           if (error.response.status !== 401 && error.response.status !== 403) {
              toast.error("Erro ao carregar agendamentos", {
                description: error.response.data.message || "Não foi possível buscar os dados.",
              });
           }
        } else if (error instanceof Error) {
            toast.error("Erro", { description: error.message });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // (Lógica de filtragem e stats...)
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(
    (a) => (a.status || "Pendente") === "Pendente"
  ).length;
  const concludedAppointments = appointments.filter(
    (a) => a.status === "Concluído"
  ).length;


  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* 1. Adiciona o Sidebar */}
      <Sidebar />

      {/* 2. Conteúdo Principal com padding para compensar o sidebar */}
      <main className="flex-1 p-8 ml-64"> {/* ml-64 é a largura do sidebar */}
        
        {loading ? (
            <div className="flex justify-center items-center h-full">
                <p>Carregando dados do dashboard...</p>
            </div>
        ) : (
          <div className="flex flex-col gap-8">
            <CardTitle className="text-3xl">Dashboard do Administrador</CardTitle>

            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Total de Agendamentos</CardTitle>
                  <CardDescription>Todos os agendamentos registrados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-400">{totalAppointments}</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Agendamentos Pendentes</CardTitle>
                  <CardDescription>Aguardando confirmação ou realização.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-400">{pendingAppointments}</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Agendamentos Concluídos</CardTitle>
                  <CardDescription>Serviços já realizados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-yellow-400">{concludedAppointments}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Próximos Agendamentos */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Todos os Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-white">Cliente</TableHead>
                      <TableHead className="text-white">Serviço(s)</TableHead>
                      <TableHead className="text-white">Data</TableHead>
                      <TableHead className="text-white">Hora</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length > 0 ? (
                      appointments.map((apt) => (
                        <TableRow key={apt.id} className="border-gray-700">
                          <TableCell className="font-medium">{apt.clientName}</TableCell>
                          <TableCell>{apt.service}</TableCell>
                          {/* Formata a data "yyyy-MM-dd" para "dd/MM/yyyy" */}
                          <TableCell>{format(new Date(apt.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{apt.time}</TableCell>
                          <TableCell>
                            <Badge variant={
                              (apt.status || "Pendente") === "Concluído" ? "default" : "secondary"
                            }>
                              {apt.status || "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Nenhum agendamento encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

// --- ESTA LINHA CORRIGE O ERRO ---
export default Dashboard;