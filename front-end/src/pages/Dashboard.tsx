import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCheck, Trash2, Calendar as CalendarIcon, Users, CheckCircle, Clock, MoreVertical, CalendarX2, CalendarClock, PlusCircle, Edit, Package } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bgImage from "@/assets/cimento.jpg";

// --- Tipos e Funções Auxiliares ---
type Appointment = {
  _id: string;
  clientName: string;
  service: string;
  time: string;
  status: 'Confirmado' | 'Finalizado';
};

type Product = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

const isSameDay = (dateA: Date, dateB: Date) => {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
};

// --- Componente Principal ---
const Dashboard = () => {
  // Estados para Agendamentos
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);

  // Estados para Produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Lógica de Agendamentos ---
  const fetchAppointments = async (date: Date) => {
    setIsAppointmentsLoading(true);
    try {
      const dateString = date.toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5000/api/appointments?date=${dateString}`);
      if (!response.ok) throw new Error("Falha ao buscar agendamentos.");
      const data = await response.json();
      setAppointments(data.sort((a: Appointment, b: Appointment) => a.time.localeCompare(b.time)));
    } catch (error: any) {
      toast.error("Erro ao carregar agendamentos", { description: error.message });
    } finally {
      setIsAppointmentsLoading(false);
    }
  };

  // --- Lógica de Produtos ---
  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/products`);
      if (!response.ok) throw new Error("Falha ao buscar produtos.");
      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      toast.error("Erro ao carregar produtos", { description: error.message });
    } finally {
      setIsProductsLoading(false);
    }
  };

  // --- Efeitos ---
  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchProducts(); // Carrega os produtos uma vez
  }, []);

  // --- Handlers de Ações ---
  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
        const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Falha ao atualizar status.');
        toast.success("Status atualizado!", { description: `Agendamento marcado como ${status.toLowerCase()}.` });
        fetchAppointments(selectedDate);
    } catch (error: any) {
        toast.error("Erro", { description: error.message });
    }
  };

  const handleCancelAppointment = async (id: string) => {
      try {
          const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
              method: 'DELETE',
          });
          if (!response.ok) throw new Error('Falha ao cancelar o agendamento.');
          toast.info("Agendamento cancelado com sucesso.");
          fetchAppointments(selectedDate);
      } catch (error: any) {
          toast.error("Erro ao cancelar", { description: error.message });
      }
  };
  
  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      image: formData.get('image') as string,
    };

    const url = editingProduct ? `http://localhost:5000/api/products/${editingProduct._id}` : `http://localhost:5000/api/products`;
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error(`Falha ao ${editingProduct ? 'atualizar' : 'salvar'} o produto.`);
      
      toast.success(`Produto ${editingProduct ? 'atualizado' : 'salvo'} com sucesso!`);
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(`Erro ao ${editingProduct ? 'atualizar' : 'salvar'}`, { description: error.message });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir o produto.');
      
      toast.info('Produto excluído com sucesso.');
      fetchProducts();
    } catch (error: any) {
      toast.error('Erro ao excluir', { description: error.message });
    }
  };

  // --- Memos e Variáveis ---
  const appointmentSummary = useMemo(() => {
    const total = appointments.length;
    const finalizados = appointments.filter(apt => apt.status === 'Finalizado').length;
    const proximo = appointments.find(apt => apt.status !== 'Finalizado');
    return { total, finalizados, proximo };
  }, [appointments]);

  const isTodaySelected = isSameDay(selectedDate, new Date());
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Confirmado": return "default";
      case "Finalizado": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="min-h-screen bg-black/80 backdrop-blur-sm">
        <Navigation />
        <main className="container mx-auto px-4 pb-8 space-y-8 pt-28">
          
          <Tabs defaultValue="agenda" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/80 mb-6">
              <TabsTrigger value="agenda">Agenda do Dia</TabsTrigger>
              <TabsTrigger value="produtos">Gerenciar Produtos</TabsTrigger>
            </TabsList>

            {/* ABA DE AGENDA (CÓDIGO ORIGINAL RESTAURADO) */}
            <TabsContent value="agenda" className="space-y-6 mt-0">
              <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white font-display uppercase tracking-wider">
                    Dashboard do Barbeiro
                  </h1>
                  <p className="text-yellow-400 mt-1">
                    Agendamentos para {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" className="w-full sm:w-auto justify-center font-normal bg-card/80 border-border text-white hover:bg-card hover:text-white disabled:opacity-50" onClick={() => setSelectedDate(new Date())} disabled={isTodaySelected}>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <span>Hoje</span>
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal bg-card/80 border-border text-white hover:bg-card hover:text-white">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Alterar Data</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </header>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card/80 border-border text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total de Clientes</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        {isAppointmentsLoading ? <Skeleton className="h-8 w-1/3" /> : <div className="text-2xl font-bold">{appointmentSummary.total}</div>}
                    </CardContent>
                </Card>
                <Card className="bg-card/80 border-border text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Atendimentos Finalizados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        {isAppointmentsLoading ? <Skeleton className="h-8 w-1/3" /> : <div className="text-2xl font-bold">{appointmentSummary.finalizados}</div>}
                    </CardContent>
                </Card>
                <Card className="bg-card/80 border-border text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Próximo Cliente</CardTitle>
                        <Clock className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        {isAppointmentsLoading ? <Skeleton className="h-8 w-1/3" /> : <div className="text-2xl font-bold">{appointmentSummary.proximo?.time || '--:--'}</div>}
                    </CardContent>
                </Card>
              </div>
              
              <Card className="bg-card/80 border-border text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-display tracking-wider">Agenda do Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-white/5">
                        <TableHead className="text-white">Horário</TableHead>
                        <TableHead className="text-white">Cliente</TableHead>
                        <TableHead className="text-white">Serviço</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-right text-white">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isAppointmentsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} className="border-border"><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ))
                      ) : appointments.length > 0 ? (
                        appointments.map((apt) => (
                          <TableRow key={apt._id} className="border-border hover:bg-white/5">
                            <TableCell className="font-medium">{apt.time}</TableCell>
                            <TableCell>{apt.clientName}</TableCell>
                            <TableCell>{apt.service}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(apt.status)} className={apt.status === 'Confirmado' ? 'bg-yellow-400 text-black hover:bg-yellow-400/80' : ''}>
                                {apt.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card border-border text-white">
                                  <DropdownMenuItem onClick={() => handleUpdateAppointmentStatus(apt._id, 'Finalizado')} disabled={apt.status === 'Finalizado'} className="focus:bg-white/10">
                                    <CheckCheck className="mr-2 h-4 w-4 text-green-500" /><span>Finalizar</span>
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:bg-red-500/10 focus:text-red-400"><Trash2 className="mr-2 h-4 w-4" /><span>Cancelar</span></DropdownMenuItem></AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader><AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja cancelar o agendamento de {apt.clientName} às {apt.time}?</AlertDialogDescription></AlertDialogHeader>
                                      <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => handleCancelAppointment(apt._id)} className="bg-destructive hover:bg-destructive/80">Sim, cancelar</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-48 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2"><CalendarX2 className="h-10 w-10" /><span className="font-medium">Nenhum agendamento para esta data.</span></div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA DE PRODUTOS */}
            <TabsContent value="produtos" className="space-y-6 mt-0">
               <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white font-display uppercase tracking-wider">
                    Gerenciamento de Produtos
                  </h1>
                  <p className="text-yellow-400 mt-1">
                    Adicione, edite ou remova produtos da sua loja.
                  </p>
                </div>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500" onClick={() => setEditingProduct(null)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-card border-border text-white">
                    <form onSubmit={handleSaveProduct}>
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
                        <DialogDescription>Preencha as informações do produto abaixo.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">Nome</Label>
                          <Input id="name" name="name" defaultValue={editingProduct?.name} className="col-span-3 bg-input border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">Preço (R$)</Label>
                          <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="col-span-3 bg-input border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="image" className="text-right">URL da Imagem</Label>
                          <Input id="image" name="image" defaultValue={editingProduct?.image} className="col-span-3 bg-input border-border" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                        <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-500">Salvar</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </header>

              <Card className="bg-card/80 border-border text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-display tracking-wider">Produtos Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-white/5">
                        <TableHead className="text-white w-[80px]">Imagem</TableHead>
                        <TableHead className="text-white">Nome</TableHead>
                        <TableHead className="text-white">Preço</TableHead>
                        <TableHead className="text-right text-white">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isProductsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i} className="border-border"><TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                        ))
                      ) : products.length > 0 ? (
                        products.map((product) => (
                          <TableRow key={product._id} className="border-border hover:bg-white/5">
                            <TableCell>
                              <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-white hover:text-yellow-400" onClick={() => { setEditingProduct(product); setIsProductDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product._id)} className="bg-destructive hover:bg-destructive/80">Excluir</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2"><Package className="h-10 w-10" /><span className="font-medium">Nenhum produto cadastrado.</span></div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;