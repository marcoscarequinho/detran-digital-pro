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
    <section id="faq" className="py-12 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
            <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-primary">
            Perguntas Frequentes
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Esclarecemos as principais dúvidas sobre nossos serviços e processos
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className={`transition-smooth cursor-pointer ${
                  openIndex === index ? 'shadow-medium ring-2 ring-primary/20' : 'shadow-soft hover:shadow-medium'
                }`}
              >
                <CardHeader
                  className="pb-0 cursor-pointer p-4 md:p-6"
                  onClick={() => toggleFAQ(index)}
                >
                  <CardTitle className="flex items-center justify-between text-left">
                    <span className="text-sm md:text-lg pr-3 md:pr-4">{faq.question}</span>
                    <div className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                {openIndex === index && (
                  <CardContent className="pt-3 md:pt-4 px-4 md:px-6">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs md:text-sm">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-soft">
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-primary">
                Não encontrou sua resposta?
              </h3>
              <p className="text-muted-foreground mb-3 md:mb-4 text-xs md:text-sm">
                Entre em contato conosco via WhatsApp e teremos prazer em esclarecer suas dúvidas
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.open("https://wa.me/5522992090682", "_blank")}
                  className="bg-success-green hover:bg-success-green/90 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-smooth flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  Falar no WhatsApp
                </button>
                <button
                  onClick={() => window.open("tel:+5522992090682", "_blank")}
                  className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-smooth text-sm md:text-base"
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