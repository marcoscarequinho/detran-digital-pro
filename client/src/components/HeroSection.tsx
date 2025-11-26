import { MessageCircle, Shield, Clock, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const HeroSection = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/5522992090682", "_blank");
  };

  const scrollToServices = () => {
    const element = document.querySelector("#servicos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen pt-16 sm:pt-20 flex items-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-primary/5"></div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-3 sm:mb-4">
              <p className="text-sm sm:text-base lg:text-xl text-white/90 font-medium">
                Despachante Marcos Carequinho
              </p>
              <p className="text-[10px] sm:text-xs lg:text-base text-white/80">
                Credenciado ao DETRAN RJ • ES • MG • SP
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 text-primary-foreground leading-tight">
              Transferência de Veículos
              <span className="text-gradient block">100% Digital</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8 text-primary-foreground/90 font-medium">
              Entre Estados RJ, SP, ES, MG
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 md:gap-4 mb-4 sm:mb-6 md:mb-8">
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                <Shield className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-white flex-shrink-0" />
                <span className="text-white font-medium text-[11px] sm:text-sm md:text-base">Seguro</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                <Clock className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-white flex-shrink-0" />
                <span className="text-white font-medium text-[11px] sm:text-sm md:text-base">Rápido</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                <CheckCircle className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-white flex-shrink-0" />
                <span className="text-white font-medium text-[11px] sm:text-sm md:text-base">Confiável</span>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-2xl mb-4 sm:mb-6 md:mb-8 border border-white/20">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                A partir de R$ 250,00
              </p>
              <p className="text-white/80 text-xs sm:text-sm md:text-base">
                Preço justo e transparente
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleWhatsApp}
                className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 h-auto bg-success-green hover:bg-success-green/90 transition-bounce shadow-medium hover:shadow-large"
              >
                <MessageCircle className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 mr-1.5 sm:mr-2" />
                <span>WhatsApp</span>
              </Button>

              <Button
                onClick={scrollToServices}
                variant="outline"
                className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 h-auto bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm transition-smooth"
              >
                Ver Serviços
              </Button>
            </div>

            <p className="text-[10px] sm:text-xs md:text-sm text-white/70 mt-3 sm:mt-4 md:mt-6">
              Atendimento: Segunda a Sexta, 9:30h às 17h
            </p>
          </div>

          {/* Visual Elements */}
          <div className="relative space-y-3 sm:space-y-4 md:space-y-6 mt-6 sm:mt-8 lg:mt-0">
            {/* Links Úteis DETRAN */}
            <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-2xl border border-white/20 text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base">
                    🔗 Links Úteis DETRAN: RJ, MG, ES, SP
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4">
                      Links Úteis DETRAN por Estado
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                    {/* Rio de Janeiro */}
                    <div className="space-y-2 md:space-y-3">
                      <h3 className="text-base md:text-lg font-bold text-primary border-b pb-2">Rio de Janeiro</h3>
                      <div className="space-y-2">
                        <a href="https://www.detran.rj.gov.br/" target="_blank" rel="noopener noreferrer" 
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          DETRAN RJ - Site Principal
                        </a>
                        <div className="ml-4 space-y-1">
                          <p className="font-semibold text-sm">Agendamentos:</p>
                          <a href="https://www.detran.rj.gov.br/todos-os-agendamentos/agendamento-drv.html" target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                            <ExternalLink className="w-3 h-3" />
                            Veículos
                          </a>
                          <a href="https://www.detran.rj.gov.br/todos-os-agendamentos/agendamento-hab.html" target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                            <ExternalLink className="w-3 h-3" />
                            Habilitação
                          </a>
                          <a href="https://www.detran.rj.gov.br/todos-os-agendamentos/agendamento-dic.html" target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                            <ExternalLink className="w-3 h-3" />
                            Identificação Civil
                          </a>
                        </div>
                        <a href="https://radar.serpro.gov.br/main.html#/cidadao" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          Multas Carioca
                        </a>
                        <a href="https://cpag.prf.gov.br/multas" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          CPAG - Consulta e Pagamento de Multas
                        </a>
                        <a href="https://servicos.dnit.gov.br/multas/" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          DENIT
                        </a>
                      </div>
                    </div>

                    {/* Minas Gerais */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-primary border-b pb-2">Minas Gerais</h3>
                      <div className="space-y-2">
                        <a href="https://www.mg.gov.br/" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          Portal do Governo de MG
                        </a>
                        <a href="https://veiculosmg.fazenda.mg.gov.br/" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          IPVA e Licenciamento
                        </a>
                      </div>
                    </div>

                    {/* Espírito Santo */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-primary border-b pb-2">Espírito Santo</h3>
                      <div className="space-y-2">
                        <a href="https://detran.es.gov.br/" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          DETRAN ES - Site Principal
                        </a>
                        <a href="https://publicodetran.es.gov.br/ConsultaVeiculo/NovoConsultaVeiculoES.asp" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          IPVA e Licenciamento
                        </a>
                      </div>
                    </div>

                    {/* São Paulo */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-primary border-b pb-2">São Paulo</h3>
                      <div className="space-y-2">
                        <a href="https://www.detran.sp.gov.br/detransp" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          DETRAN SP - Site Principal
                        </a>
                        <a href="https://www.ipva.fazenda.sp.gov.br/IPVANET_Consulta/Consulta.aspx" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          Consultas de Débitos
                        </a>
                        <a href="https://pixveiculos.fazenda.sp.gov.br/auth/" target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                          <ExternalLink className="w-4 h-4" />
                          IPVA, Débitos de Veículos e Taxas DETRAN
                        </a>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Download App Section */}
            <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-2xl border border-white/20 text-center">
              <Button
                onClick={() => window.open("https://onlinedespachante.net.br/app.apk", "_blank", "noopener,noreferrer")}
                className="w-full mb-2 sm:mb-3 md:mb-4 bg-success-green hover:bg-success-green/90 text-white font-semibold py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base"
              >
                📱 Baixar App para Celular
              </Button>
              <p className="text-[10px] sm:text-xs md:text-sm text-white/80 leading-relaxed">
                Não esquecer de dar permissão nas configurações de seu aparelho, pois não é spam, é padrão, pois ainda não está no App Store.
              </p>
            </div>

            <div className="relative bg-white/10 backdrop-blur-sm p-3 sm:p-4 md:p-8 rounded-3xl border border-white/20">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 text-center">
                Estados Atendidos
              </h3>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-white/15 p-2 sm:p-3 md:p-4 rounded-xl text-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-white block">RJ</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-white/80">Rio de Janeiro</span>
                </div>
                <div className="bg-white/15 p-2 sm:p-3 md:p-4 rounded-xl text-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-white block">SP</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-white/80">São Paulo</span>
                </div>
                <div className="bg-white/15 p-2 sm:p-3 md:p-4 rounded-xl text-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-white block">ES</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-white/80">Espírito Santo</span>
                </div>
                <div className="bg-white/15 p-2 sm:p-3 md:p-4 rounded-xl text-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-white block">MG</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-white/80">Minas Gerais</span>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 md:mt-6 text-center">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-success-green/20 text-success-green px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full border border-success-green/30">
                  <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span className="font-medium text-xs sm:text-sm md:text-base">Processo Aprovado</span>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="hidden lg:block absolute -top-4 -left-4 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <div className="hidden lg:block absolute -bottom-4 -right-4 w-16 h-16 bg-success-green/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-success-green/30">
              <CheckCircle className="w-6 h-6 text-success-green" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;