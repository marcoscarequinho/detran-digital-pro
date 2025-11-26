import { MapPin, Clock, Phone, MessageCircle, Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    "Transferência de Propriedade",
    "Licenciamento Digital", 
    "CNH - Renovação",
    "Segunda Via de Documentos",
    "Conversão para GNV",
    "Registro ANTT"
  ];

  const quickLinks = [
    { label: "Início", href: "#inicio" },
    { label: "Serviços", href: "#servicos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "FAQ", href: "#faq" },
    { label: "Contato", href: "#contato" }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg md:text-xl">D</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base md:text-xl truncate">DETRAN Digital</h3>
                <p className="text-xs md:text-sm text-primary-foreground/80 truncate">Despachante Marcos Carequinho</p>
                <p className="text-[10px] md:text-xs text-primary-foreground/70 hidden sm:block">Credenciado DETRAN RJ • ES • MG • SP</p>
              </div>
            </div>

            <p className="text-primary-foreground/90 mb-4 md:mb-6 text-xs md:text-sm leading-relaxed">
              Despachante Marcos Carequinho, credenciado ao DETRAN nos estados RJ, SP, ES e MG.
              Especialista em documentação veicular com processos 100% digitais, oferecendo
              agilidade e confiança em todos os serviços.
            </p>

            <div className="flex space-x-3 md:space-x-4">
              <a
                href="#"
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-smooth"
              >
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-smooth"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-smooth"
              >
                <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6">Nossos Serviços</h4>
            <ul className="space-y-2 md:space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection("#servicos")}
                    className="text-primary-foreground/90 hover:text-white text-xs md:text-sm transition-smooth text-left"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6">Links Rápidos</h4>
            <ul className="space-y-2 md:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-primary-foreground/90 hover:text-white text-xs md:text-sm transition-smooth"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6">Contato</h4>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start gap-2 md:gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground/80 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm">
                  <p className="text-primary-foreground/90">Av. Getúlio Vargas, 1575</p>
                  <p className="text-primary-foreground/80">Centro, Araruama – RJ</p>
                  <p className="text-primary-foreground/80">28979-129</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground/80 flex-shrink-0" />
                <div className="text-xs md:text-sm">
                  <p className="text-primary-foreground/90">Segunda a Sexta</p>
                  <p className="text-primary-foreground/80">9:30h às 17h</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground/80 flex-shrink-0" />
                <div className="text-xs md:text-sm">
                  <p className="text-primary-foreground/90">(22) 99209-0682</p>
                  <p className="text-primary-foreground/80">WhatsApp e Telefone</p>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
              <button
                onClick={() => window.open("https://wa.me/5522992090682", "_blank")}
                className="w-full bg-success-green hover:bg-success-green/90 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-smooth flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-primary-foreground/20">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-3 md:gap-4">
            <div className="text-xs md:text-sm text-primary-foreground/80 text-center lg:text-left">
              <p>© {currentYear} DETRAN Digital - Despachante Marcos Carequinho</p>
              <p className="mt-1">CNPJ: 00.000.000/0001-00</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 text-xs md:text-sm text-center">
              <button className="text-primary-foreground/80 hover:text-white transition-smooth">
                Termos de Uso
              </button>
              <button className="text-primary-foreground/80 hover:text-white transition-smooth">
                Política de Privacidade
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;