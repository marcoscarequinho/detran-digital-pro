import { MessageCircle, Menu, X, Users, Car } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Início", href: "#inicio" },
    { label: "Serviços", href: "#servicos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "FAQ", href: "#faq" },
    { label: "Contato", href: "#contato" },
  ];

  const handleWhatsApp = () => {
    window.open("https://wa.me/5522992090682", "_blank");
  };


  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm shadow-soft">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 flex-1 min-w-0 mr-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-base sm:text-lg md:text-xl">D</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm sm:text-base md:text-xl text-primary truncate">DETRAN Digital</h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">M. Carequinho</p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground/80 hidden md:block truncate">Credenciado DETRAN</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contact Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              onClick={() => window.open("https://comunidade.mcdespachadoria.com.br/", "_blank")}
              variant="outline" 
              size="sm" 
              className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500 hover:border-yellow-600"
            >
              <Users className="w-4 h-4" />
              COMUNIDADE
            </Button>
            
            <Button 
              onClick={() => window.open("https://consultas.mcdespachadoria.com.br/", "_blank")}
              variant="outline" 
              size="sm" 
              className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500 hover:border-yellow-600"
            >
              <Car className="w-4 h-4" />
              CONSULTAS DE VEÍCULOS
            </Button>
            
            <Button onClick={handleWhatsApp} className="gap-2 bg-gradient-primary">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            
            <Button 
              onClick={() => window.open("https://gestao.mcdespachadoria.com.br/", "_blank")}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase"
            >
              PAINEL
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden p-1 sm:p-2">
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-80">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="text-center">
                  <h2 className="font-bold text-xl text-primary">DETRAN Digital</h2>
                  <p className="text-sm text-muted-foreground">Marcos Carequinho</p>
                  <p className="text-xs text-muted-foreground/80">Credenciado DETRAN RJ • ES • MG • SP</p>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.href)}
                      className="text-left py-3 text-lg font-medium hover:text-primary transition-smooth"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="flex flex-col space-y-3 pt-6 border-t">
                  <Button 
                    onClick={() => window.open("https://comunidade.mcdespachadoria.com.br/", "_blank")}
                    variant="outline" 
                    className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500 hover:border-yellow-600"
                  >
                    <Users className="w-4 h-4" />
                    Comunidade
                  </Button>
                  
                  <Button 
                    onClick={() => window.open("https://consultas.mcdespachadoria.com.br/", "_blank")}
                    variant="outline" 
                    className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500 hover:border-yellow-600"
                  >
                    <Car className="w-4 h-4" />
                    Consultas de Veículos
                  </Button>
                  
                  <Button onClick={handleWhatsApp} className="gap-2 bg-gradient-primary">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                  
                  <Button 
                    onClick={() => window.open("https://gestao.mcdespachadoria.com.br/", "_blank")}
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase"
                  >
                    PAINEL
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;