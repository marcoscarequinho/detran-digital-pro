import { MapPin, Clock, Phone, MessageCircle, Mail, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import pixQrCode from "@/assets/pix-qr-code.png";

const ContactSection = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      info: "Av. Getúlio Vargas, 1575",
      secondary: "Centro, Araruama – RJ, 28979-129"
    },
    {
      icon: Clock,
      title: "Horário de Funcionamento",
      info: "Segunda a Sexta",
      secondary: "Das 9:30h às 17h"
    },
    {
      icon: Phone,
      title: "Contato",
      info: "(22) 99209-0682",
      secondary: "WhatsApp e Telefone"
    }
  ];

  return (
    <section id="contato" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-primary">
            Entre em Contato
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos prontos para atender você e resolver suas questões de documentação veicular
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-foreground">
                Informações de Contato
              </h3>

              <div className="space-y-4 md:space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                        {item.title}
                      </h4>
                      <p className="text-foreground font-medium text-sm md:text-base">{item.info}</p>
                      <p className="text-muted-foreground text-xs md:text-sm">{item.secondary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-subtle p-4 md:p-6 rounded-2xl border">
              <h4 className="font-bold text-base md:text-lg mb-3 md:mb-4 text-foreground">
                Formas de Pagamento
              </h4>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <QrCode className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <p className="text-xs md:text-sm font-medium">PIX</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <p className="text-xs md:text-sm font-medium">Cartão</p>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 text-sm md:text-base">
                    <QrCode className="w-4 h-4" />
                    Ver QR Code PIX
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Pagamento via PIX</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={pixQrCode}
                      alt="QR Code PIX"
                      className="w-40 h-40 md:w-48 md:h-48 border rounded-lg shadow-medium"
                    />
                    <div className="text-center">
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">Chave PIX:</p>
                      <p className="font-mono font-bold text-primary text-sm md:text-base">22992090682</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-foreground">
                Fale Conosco Agora
              </h3>

              <div className="space-y-3 md:space-y-4">
                <Card className="border-success-green/20 bg-success-green/5">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="flex items-center gap-2 md:gap-3 text-success-green text-base md:text-lg">
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                      WhatsApp
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Atendimento rápido e direto via WhatsApp
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => window.open("https://wa.me/5522992090682", "_blank")}
                      className="w-full bg-success-green hover:bg-success-green/90 text-white gap-2 text-sm md:text-base"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Iniciar Conversa
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-lg">
                      <Phone className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      Telefone
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Ligue diretamente para nosso atendimento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => window.open("tel:+5522992090682", "_blank")}
                      variant="outline"
                      className="w-full gap-2 text-sm md:text-base"
                    >
                      <Phone className="w-4 h-4" />
                      (22) 99209-0682
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-primary/5 p-4 md:p-6 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-base md:text-lg mb-3 text-primary">
                Atendimento Especializado
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>• Consultoria gratuita via WhatsApp</li>
                <li>• Orçamento sem compromisso</li>
                <li>• Acompanhamento em tempo real</li>
                <li>• Suporte técnico especializado</li>
                <li>• Orientação sobre documentação</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-16">
          <div className="bg-gradient-primary p-6 md:p-8 rounded-2xl shadow-medium text-center text-primary-foreground">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
              Pronto para Resolver seus Documentos?
            </h3>
            <p className="mb-4 md:mb-6 text-primary-foreground/90 text-sm md:text-base">
              Entre em contato agora e deixe nossa equipe cuidar de toda a burocracia para você
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button
                onClick={() => window.open("https://wa.me/5522992090682", "_blank")}
                variant="secondary"
                size="lg"
                className="gap-2 text-sm md:text-base"
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                Falar no WhatsApp
              </Button>
              <Button
                onClick={() => window.open("tel:+5522992090682", "_blank")}
                variant="outline"
                size="lg"
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm md:text-base"
              >
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
                Ligar Agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;