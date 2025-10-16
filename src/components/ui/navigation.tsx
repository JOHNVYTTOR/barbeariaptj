import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./button";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/logo.png";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Agendamento", href: "/agendamento" },
    { name: "Loja", href: "/loja" },
    { name: "Sobre Mim", href: "/sobre" },
  ];

  const isActive = (href: string) => location.pathname === href;

  const firstPart = navItems.slice(0, 2);
  const secondPart = navItems.slice(2);

  // Detecta o scroll para adicionar fundo ao header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo no mobile - ajustado para a esquerda para dar espaço ao menu */}
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
                // REMOVIDO: font-display, tracking-wider, uppercase
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-white hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Logo no meio */}
            <Link to="/" className="flex-shrink-0 mx-4 transform hover:scale-110 transition-transform">
              <img className="h-20 w-auto" src={logoImage} alt="Logo" />
            </Link>

            {secondPart.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                // REMOVIDO: font-display, tracking-wider, uppercase
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

          {/* Botão Entrar e Menu Hamburger */}
          <div className="flex items-center flex-1 justify-end">
            <div className="hidden md:block">
              <Link to="/login">
                <Button
                  size="sm"
                  // REMOVIDO: font-display, tracking-wider
                  className="border border-primary text-primary bg-transparent hover:bg-primary hover:text-black font-medium"
                >
                  Entrar
                </Button>
              </Link>
            </div>
            
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
                // REMOVIDO: font-display, tracking-wider
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
            <div className="border-t border-border pt-4 mt-2">
              <Link to="/login">
                <Button className="w-full bg-primary text-black font-medium hover:bg-primary/90">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};