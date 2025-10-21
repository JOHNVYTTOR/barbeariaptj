import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Agendamento from "./pages/Agendamento";
import Sobre from "./pages/Sobre";
import Login from "./pages/Login";
import  Loja  from "./pages/Loja";
import Cadastro  from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import NotFound  from "./pages/NotFound";

// Remova todos os outros imports (BrowserRouter, QueryClient, etc.) daqui!

const App = () => (
  // O <Routes> é o único componente que deve ficar aqui
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/agendamento" element={<Agendamento />} />
    <Route path="/sobre" element={<Sobre />} />
    <Route path="/loja" element={<Loja />} />
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;