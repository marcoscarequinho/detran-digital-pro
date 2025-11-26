import { 
  Car, 
  FileText, 
  RotateCcw, 
  Copy, 
  Fuel, 
  Truck,
  ArrowRight,
  CheckCircle,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import pixQrCode from "@/assets/pix-qr-code.png";

const PaymentButton = ({ link, text }: { link: string; text: string }) => {
  const handlePayment = () => {
    // Janela de pagamento do Mercado Pago com largura de 900px
    window.open(link, "_blank", "width=1200,height=700,scrollbars=yes,resizable=yes");
  };

  return (
    <Button 
      onClick={handlePayment}
      className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
    >
      <CreditCard className="w-4 h-4" />
      {text}
    </Button>
  );
};

const ServicesSection = () => {
  const handleWhatsApp = (service: string) => {
    const message = `Olá! Gostaria de mais informações sobre ${service}`;
    window.open(`https://wa.me/5522992090682?text=${encodeURIComponent(message)}`, "_blank");
  };

  const services = [
    {
      icon: Car,
      title: "Transferência de Propriedade",
      description: "Entre estados. Processo online completo.",
      price: "A partir de R$ 250,00",
      features: ["RJ, SP, ES, MG", "100% Digital", "Rápido e Seguro"],
      popular: true
    },
    {
      icon: FileText,
      title: "Licenciamento Digital",
      description: "Licenciamento anual digital e rápido.",
      price: "De R$ 120,00 a R$ 250,00",
      features: ["Processo Digital", "Entrega Rápida", "Sem Filas"]
    },
    {
      icon: RotateCcw,
      title: "CNH - Renovação e Reciclagem",
      description: "Renovação rápida e curso de reciclagem em 24h.",
      price: "Renovação: A partir de R$ 250,00\nReciclagem: R$ 3.000,00",
      features: ["Renovação Rápida", "Reciclagem 24h", "Processo Simplificado"]
    },
    {
      icon: Copy,
      title: "Segunda Via de Documentos",
      description: "CRV, CRLV e demais documentos veiculares.",
      price: "A partir de R$ 250,00",
      features: ["Todos os Documentos", "Processo Online", "Entrega Expressa"]
    },
    {
      icon: Fuel,
      title: "Conversão para GNV",
      description: "Regularização e documentação da instalação de GNV.",
      price: "De R$ 200,00 a R$ 450,00",
      features: ["Regularização", "Documentação", "Processo Legal"]
    },
    {
      icon: Truck,
      title: "Registro ANTT",
      description: "Documentação para empresas de transporte.",
      price: "Consulte valores",
      features: ["Empresas de Transporte", "Documentação Completa", "Suporte Total"]
    }
  ];

  return (
    <section id="servicos" className="py-12 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-primary">
            Nossos Serviços
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Oferecemos soluções completas em documentação veicular com processos 100% digitais
            para sua comodidade e agilidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`relative transition-smooth hover:shadow-medium ${
                service.popular ? 'ring-2 ring-primary shadow-medium' : 'hover:shadow-soft'
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-primary-foreground px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold shadow-soft">
                    Mais Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-3 md:pb-4 pt-4 md:pt-6">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-2xl flex items-center justify-center ${
                  service.popular ? 'bg-gradient-primary' : 'bg-primary/10'
                }`}>
                  <service.icon className={`w-6 h-6 md:w-8 md:h-8 ${
                    service.popular ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                </div>

                <CardTitle className="text-lg md:text-xl mb-2">{service.title}</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 md:space-y-6">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-primary whitespace-pre-line">
                    {service.price}
                  </p>
                </div>

                <div className="space-y-2 md:space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-success-green flex-shrink-0" />
                      <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleWhatsApp(service.title)}
                  className={`w-full gap-2 text-sm md:text-base ${
                    service.popular ? 'bg-gradient-primary hover:shadow-medium' : ''
                  }`}
                  variant={service.popular ? "default" : "outline"}
                >
                  Solicitar Orçamento
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>


        <div className="mt-8 md:mt-16 text-center">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-soft max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-primary">
              Por que escolher nossos serviços?
            </h3>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">100% Digital</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Processos totalmente online, sem necessidade de deslocamento
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Rapidez</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Agilidade nos processos com acompanhamento em tempo real
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Car className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Experiência</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Anos de experiência em documentação veicular
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;