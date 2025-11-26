import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Como funciona o processo de transferência entre estados?",
      answer: "Nosso processo é 100% digital. Você nos envia a documentação via WhatsApp, nós cuidamos de toda a burocracia junto aos órgãos competentes (DETRAN) e você recebe os documentos em casa. O processo leva de 15 a 30 dias úteis dependendo do estado."
    },
    {
      question: "Quais documentos preciso enviar para iniciar o processo?",
      answer: "Para transferência de propriedade você precisa: RG, CPF, comprovante de residência atual, CRLV (documento do veículo), comprovante de quitação de financiamento (se houver). Todos podem ser enviados por foto via WhatsApp."
    },
    {
      question: "Os valores incluem todas as taxas?",
      answer: "Nossos valores incluem nossa taxa de serviço e orientação completa. As taxas dos órgãos públicos (DETRAN, cartório) são cobradas à parte e informadas previamente. Sempre trabalhamos com total transparência nos custos."
    },
    {
      question: "Quanto tempo demora cada tipo de serviço?",
      answer: "• Transferência entre estados: 15-30 dias úteis\n• Licenciamento digital: 5-10 dias úteis\n• Renovação CNH: 10-15 dias úteis\n• Segunda via documentos: 7-15 dias úteis\n• Conversão GNV: 20-30 dias úteis\n• Registro ANTT: 30-45 dias úteis"
    },
    {
      question: "Como é feito o pagamento?",
      answer: "Aceitamos pagamento via PIX (chave: 22992090682), transferência bancária, cartão de débito/crédito. O pagamento pode ser feito em parcelas dependendo do valor do serviço. QR Code PIX disponível no site."
    },
    {
      question: "Vocês atendem em quais estados?",
      answer: "Atendemos nos estados do Rio de Janeiro (RJ), São Paulo (SP), Espírito Santo (ES) e Minas Gerais (MG). Nosso escritório fica em Araruama-RJ, mas o atendimento é 100% digital."
    },
    {
      question: "E se houver algum problema com o documento?",
      answer: "Oferecemos suporte completo durante todo o processo. Se houver qualquer irregularidade ou problema, entramos em contato imediatamente e orientamos sobre os próximos passos. Nossa responsabilidade vai até a conclusão do serviço."
    },
    {
      question: "Como acompanhar o andamento do meu processo?",
      answer: "Você recebe atualizações constantes via WhatsApp sobre o andamento do seu processo. Também pode entrar em contato a qualquer momento durante nosso horário de atendimento (Segunda a Sexta, 9:30h às 17h)."
    },
    {
      question: "Preciso ir até o DETRAN ou cartório?",
      answer: "Na maioria dos casos, NÃO! Nosso processo é digital e cuidamos de toda a documentação para você. Em casos específicos (raros), podemos orientar sobre alguma etapa presencial, mas sempre buscamos soluções totalmente digitais."
    },
    {
      question: "Qual a diferença entre vocês e fazer diretamente no DETRAN?",
      answer: "Nós oferecemos comodidade, rapidez e expertise. Evitamos filas, burocracias desnecessárias e orientamos sobre todos os passos. Nosso conhecimento dos processos agiliza significativamente os prazos comparado ao atendimento padrão dos órgãos."
    }
  ];

  return (
    <section id="faq" className="py-8 sm:py-12 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-16">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-primary">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Esclarecemos as principais dúvidas sobre nossos serviços e processos
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className={`transition-smooth cursor-pointer ${
                  openIndex === index ? 'shadow-medium ring-2 ring-primary/20' : 'shadow-soft hover:shadow-medium'
                }`}
              >
                <CardHeader
                  className="pb-0 cursor-pointer p-3 sm:p-4 md:p-6"
                  onClick={() => toggleFAQ(index)}
                >
                  <CardTitle className="flex items-center justify-between text-left">
                    <span className="text-xs sm:text-sm md:text-lg pr-2 sm:pr-3 md:pr-4">{faq.question}</span>
                    <div className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUp className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-primary" />
                      ) : (
                        <ChevronDown className="w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                {openIndex === index && (
                  <CardContent className="pt-2 sm:pt-3 md:pt-4 px-3 sm:px-4 md:px-6">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-[10px] sm:text-xs md:text-sm">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 md:mt-12 text-center">
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl shadow-soft">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 md:mb-3 text-primary">
                Não encontrou sua resposta?
              </h3>
              <p className="text-muted-foreground mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm">
                Entre em contato conosco via WhatsApp e teremos prazer em esclarecer suas dúvidas
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => window.open("https://wa.me/5522992090682", "_blank")}
                  className="bg-success-green hover:bg-success-green/90 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-smooth flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                >
                  Falar no WhatsApp
                </button>
                <button
                  onClick={() => window.open("tel:+5522992090682", "_blank")}
                  className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-smooth text-xs sm:text-sm md:text-base"
                >
                  Ligar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;