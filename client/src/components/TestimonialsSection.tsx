import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      location: "Rio de Janeiro - RJ",
      service: "Transferência de Propriedade",
      rating: 5,
      text: "Excelente atendimento! Conseguiram resolver a transferência do meu carro do RJ para SP em poucos dias. Processo totalmente digital, sem complicações.",
      date: "Dezembro 2024"
    },
    {
      name: "João Santos",
      location: "São Paulo - SP",
      service: "Licenciamento Digital",
      rating: 5,
      text: "Muito profissionais e rápidos. O licenciamento foi feito online e recebi os documentos em casa. Recomendo demais!",
      date: "Novembro 2024"
    },
    {
      name: "Ana Costa",
      location: "Espírito Santo - ES",
      service: "CNH Renovação",
      rating: 5,
      text: "Renovei minha CNH de forma super rápida. Atendimento via WhatsApp foi perfeito, tiraram todas as minhas dúvidas.",
      date: "Dezembro 2024"
    },
    {
      name: "Carlos Oliveira",
      location: "Minas Gerais - MG",
      service: "Segunda Via de Documentos",
      rating: 5,
      text: "Precisava urgentemente da segunda via do meu documento. Resolveram tudo rapidamente e o preço foi justo. Muito satisfeito!",
      date: "Novembro 2024"
    },
    {
      name: "Fernanda Lima",
      location: "Rio de Janeiro - RJ",
      service: "Conversão GNV",
      rating: 5,
      text: "Processo de regularização do GNV foi simples e bem orientado. Equipe muito competente e prestativa.",
      date: "Outubro 2024"
    },
    {
      name: "Roberto Mendes",
      location: "São Paulo - SP",
      service: "Registro ANTT",
      rating: 5,
      text: "Para minha empresa de transporte, conseguiram toda documentação ANTT sem problemas. Profissionais sérios e confiáveis.",
      date: "Dezembro 2024"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-warning-amber fill-current' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <section id="depoimentos" className="py-8 sm:py-12 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-primary">
            Depoimentos de Clientes
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Veja o que nossos clientes falam sobre nossos serviços e a qualidade do nosso atendimento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative transition-smooth hover:shadow-medium border-0 shadow-soft">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="absolute -top-1.5 sm:-top-2 md:-top-3 left-3 sm:left-4 md:left-6">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center">
                    <Quote className="w-2.5 sm:w-3 md:w-4 h-2.5 sm:h-3 md:h-4 text-primary-foreground" />
                  </div>
                </div>

                <div className="pt-2 sm:pt-3 md:pt-4 space-y-2 sm:space-y-3 md:space-y-4">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {renderStars(testimonial.rating)}
                  </div>

                  <p className="text-muted-foreground leading-relaxed text-[10px] sm:text-xs md:text-sm">
                    "{testimonial.text}"
                  </p>

                  <div className="pt-2 sm:pt-3 md:pt-4 border-t border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground text-xs sm:text-sm md:text-base">
                          {testimonial.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                          {testimonial.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                          {testimonial.date}
                        </p>
                      </div>
                    </div>

                    <div className="mt-1.5 sm:mt-2">
                      <span className="inline-block bg-primary/10 text-primary text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        {testimonial.service}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 md:mt-16 text-center">
          <div className="bg-gradient-primary p-4 sm:p-6 md:p-8 rounded-2xl shadow-medium max-w-4xl mx-auto">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-primary-foreground">
              Mais de 1000+ Clientes Satisfeitos
            </h3>
            <p className="text-primary-foreground/90 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base">
              Junte-se aos nossos clientes que já confiam em nossos serviços para
              resolver suas questões de documentação veicular de forma rápida e segura.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-0.5 sm:mb-1">1000+</div>
                <div className="text-primary-foreground/80 text-[10px] sm:text-xs md:text-sm">Clientes Atendidos</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-0.5 sm:mb-1">4.9</div>
                <div className="text-primary-foreground/80 text-[10px] sm:text-xs md:text-sm">Nota Média</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-0.5 sm:mb-1">98%</div>
                <div className="text-primary-foreground/80 text-[10px] sm:text-xs md:text-sm">Recomendação</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;