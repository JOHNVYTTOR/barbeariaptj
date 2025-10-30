import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "./hooks/CartContext"; // <-- 1. IMPORTADO

import Index from "./pages/Index";
import Home from "./pages/Home";
import Agendamento from "./pages/Agendamento";
import Sobre from "./pages/Sobre";
import Loja from "./pages/Loja";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import Profile from "./pages/Profile"; // ✅ Importa a página de perfil
import { Navigation } from "@/components/ui/navigation"; // ✅ Importa o Navigation
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "./pages/NotFound";
import Carrinho from "./pages/Carrinho";


const App = () => {
  const { user, login } = useAuth(); // Usuário autenticado
  const isAdmin = user?.tipoUsuario?.nomeTipoUsuario === "Admin"; // Verifica se é admin

  return (
    //  <-- 2. "EMBRULHE" TUDO COM O CARTPROVIDER
    <CartProvider>
      <>
        {/* ✅ Navbar global (aparece em todas as páginas) */}
        <Navigation />

        <div className="pt-20"> {/* padding-top para não sobrepor o menu fixo */}
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/sobre" element={<Sobre/>} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/login" element={<Login loginFn={login} />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/carrinho" element={<Carrinho />} />
            {/* ✅ Nova rota para o perfil do usuário */}
            <Route path="/profile" element={<Profile />} />

            {/* Rotas protegidas (somente admin) */}
            {isAdmin ? (
              <Route
                path="/dashboard"
                element={
                  <SidebarProvider>
                    <Dashboard />
                  </SidebarProvider>
                }
              />
            ) : (
              <Route path="/dashboard" element={<Unauthorized />} />
            )}

            {/* Página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </>
    </CartProvider> // <-- 3. FECHE O CARTPROVIDER
  );
};

export default App;
