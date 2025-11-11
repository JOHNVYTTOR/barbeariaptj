import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./button";
// 1. IMPORTA O ÍCONE DO DASHBOARD
import { Menu, X, User, LayoutDashboard } from "lucide-react"; 
import logoImage from "../../assets/logo.png"; 
import { useAuth } from "../../hooks/useAuth";  

export const Navigation = () => {
  const { user } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // 2. CRIA A VARIÁVEL 'isAdmin' (PELO AMOR DE DEUS)
  const isAdmin = user?.tipoUsuario?.nomeTipoUsuario === "Admin";

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Agendamento", href: "/agendamento" },
    { name: "Loja", href: "/loja" },
    { name: "Sobre Mim", href: "/sobre" },
  ];

  const isActive = (href: string) => location.pathname === href;

  const firstPart = navItems.slice(0, 2);
  const secondPart = navItems.slice(2);

  // Adiciona fundo no scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <nav
      className={`fixed w-full top-0 left-0 transition-all duration-300 z-50 ${
        isScrolled ? "bg-black/50 backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      {/* 👇 Deslocamento suave para a direita */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 translate-x-4">
        <div className="flex justify-between h-20 items-center">
          {/* Logo no mobile */}
          <div className="md:hidden flex-1">
            <Link to="/">
              <img className="h-16 w-auto" src={logoImage} alt="Logo" />
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8 w-full justify-center">
            {firstPart.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-white hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Logo central */}
            <Link
              to="/"
              className="flex-shrink-0 mx-4 transform hover:scale-110 transition-transform"
            >
              <img className="h-20 w-auto" src={logoImage} alt="Logo" />
            </Link>

            {secondPart.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-white hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Lado direito (perfil e login) */}
          <div className="flex items-center flex-1 justify-end space-x-3">
            
            {/* --- 3. BOTÃO DASHBOARD (DESKTOP) --- */}
            {/* SÓ APARECE SE FOR ADMIN */}
            {isAdmin && (
              <Link
                to="/dashboard"
                className="hidden md:flex text-white hover:text-primary transition-colors"
                title="Dashboard Admin"
              >
                <LayoutDashboard size={24} />
              </Link>
            )}
            {/* --- Fim da alteração 3 --- */}

            {/* Ícone de perfil — aparece SOMENTE se estiver logado */}
            {user && (
              <Link
                to="/profile"
                className="hidden md:flex text-white hover:text-primary transition-colors"
                title="Meu Perfil"
              >
                <User size={24} />
              </Link>
            )}

            {/* Botão Entrar — aparece SOMENTE se NÃO estiver logado */}
            {!user && (
              <div className="hidden md:block">
                <Link to="/login">
                  <Button
                    size="sm"
                    className="border border-primary text-primary bg-transparent hover:bg-primary hover:text-black font-medium"
                  >
                    Entrar
                  </Button>
                </Link>
              </div>
            )}

            {/* Menu Mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-primary hover:bg-white/10"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-lg border-t border-border">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-md text-center ${
                  isActive(item.href)
                    ? "text-primary bg-secondary"
                    : "text-white hover:text-primary hover:bg-secondary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}


            {/* Ícone de perfil — só aparece se estiver logado */}
            {user && (
              <Link
                to="/profile"
                className="flex items-center justify-center gap-2 text-white hover:text-primary mt-2"
                onClick={() => setIsOpen(false)}
              >
                <User size={20} /> Meu Perfil
              </Link>
            )}

            {/* --- 4. BOTÃO DASHBOARD (MOBILE) --- */}
            {/* SÓ APARECE SE FOR ADMIN */}
            {isAdmin && (
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 text-white hover:text-primary mt-2"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={20} /> Dashboard
              </Link>
            )}
            {/* --- Fim da alteração 4 --- */}


            {/* Botão Entrar Mobile — só aparece se NÃO estiver logado */}
            {!user && (
              <div className="border-t border-border pt-4 mt-2">
                <Link to="/login">
                  <Button className="w-full bg-primary text-black font-medium hover:bg-primary/90">
                    Entrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};