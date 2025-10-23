import { Route, Routes, Navigate } from 'react-router-dom' // 1. Importe o 'Navigate'
import Index from './pages/Index'
import Home from './pages/Home'
import Agendamento from './pages/Agendamento'
import Sobre from './pages/Sobre'
import Loja from './pages/Loja'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { useAuth } from './hooks/useAuth';
import { SidebarProvider } from "@/components/ui/sidebar"; // 1. Importe o SidebarProvider
import Unauthorized from './pages/Unauthorized'

const App = () => {
  const { user } = useAuth(); // Pega o usuário do contexto de autenticação

  // Determina se o usuário é Admin (ajuste conforme sua lógica)
  const isAdmin = user?.tipoUsuario?.nomeTipoUsuario === 'Admin';

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agendamento" element={<Agendamento />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/loja" element={<Loja />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rota condicional para o Dashboard */}
      {isAdmin ? (
        <Route
          path="/dashboard"
          element={
            // 2. Envolva o Dashboard com o SidebarProvider
            <SidebarProvider>
              <Dashboard />
            </SidebarProvider>
          }
        />
      ) : (
        // Se não for admin, a rota /dashboard leva para NotFound
        <Route path="/dashboard" element={<Unauthorized />} />
      )}

      {/* Rota para qualquer outro caminho não encontrado */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;