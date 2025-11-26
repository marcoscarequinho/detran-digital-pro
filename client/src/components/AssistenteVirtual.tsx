import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Search, 
  ChevronDown, 
  User, 
  Car,
  FileText,
  CreditCard,
  Clock,
  AlertCircle,
  Phone,
  Loader2,
  Type,
  Volume2,
  VolumeX,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Pergunta {
  id: string;
  categoria: string;
  titulo: string;
  pergunta: string;
}

interface AssistenteResponse {
  success: boolean;
  resposta: string;
  categoria: string;
}

const perguntasPreDefinidas: Pergunta[] = [
  {
    id: '1',
    categoria: 'Transferência',
    titulo: 'Como transferir um veículo?',
    pergunta: 'Quais documentos são necessários para fazer a transferência de propriedade de um veículo?'
  },
  {
    id: '2', 
    categoria: 'Transferência',
    titulo: 'Prazo para transferir veículo',
    pergunta: 'Qual o prazo para fazer a transferência de um veículo após a compra?'
  },
  {
    id: '3',
    categoria: 'Licenciamento',
    titulo: 'Como fazer licenciamento anual?',
    pergunta: 'Como fazer o licenciamento anual do meu veículo? Quais documentos preciso?'
  },
  {
    id: '4',
    categoria: 'Licenciamento', 
    titulo: 'Valor do licenciamento',
    pergunta: 'Quanto custa o licenciamento anual de um veículo no RJ?'
  },
  {
    id: '5',
    categoria: 'CNH',
    titulo: 'Renovar CNH vencida',
    pergunta: 'Como renovar uma CNH que já está vencida? Posso dirigir enquanto renovo?'
  },
  {
    id: '6',
    categoria: 'CNH',
    titulo: 'Mudança de categoria CNH',
    pergunta: 'Como fazer mudança de categoria da CNH de B para D?'
  },
  {
    id: '7',
    categoria: 'Documentação',
    titulo: 'Segunda via do CRV',
    pergunta: 'Como tirar segunda via do CRV (documento do veículo)?'
  },
  {
    id: '8',
    categoria: 'Documentação',
    titulo: 'Perdi minha CNH',
    pergunta: 'Perdi minha CNH. Como tirar uma segunda via?'
  },
  {
    id: '9',
    categoria: 'Regularização',
    titulo: 'Veículo com restrição',
    pergunta: 'Meu veículo tem restrição judicial. Como resolver?'
  },
  {
    id: '10',
    categoria: 'Regularização',
    titulo: 'Débitos em atraso',
    pergunta: 'Como quitar débitos de IPVA e multas em atraso?'
  }
];

const AssistenteVirtual: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [perguntaCustom, setPerguntaCustom] = useState('');
  const [resposta, setResposta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState('text-sm');
  const [highContrast, setHighContrast] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const initialPosition = { x: 20, y: window.innerHeight - 500 };

  // Agrupar perguntas por categoria
  const categorias = Array.from(new Set(perguntasPreDefinidas.map(p => p.categoria)));

  const resetPosition = () => {
    setPosition(initialPosition);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const fazerPergunta = async (pergunta: string, cat: string = 'geral') => {
    setIsLoading(true);
    setResposta('');
    setCategoria(cat);

    try {
      const response = await fetch('/api/assistente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pergunta, categoria: cat }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro HTTP:', response.status, errorText);
        throw new Error(`Erro na consulta: ${response.status}`);
      }

      const data: AssistenteResponse = await response.json();
      setResposta(data.resposta);
      setCategoria(data.categoria);

      if (!isMuted) {
        // Text-to-speech se não estiver mudo
        const utterance = new SpeechSynthesisUtterance(data.resposta);
        utterance.lang = 'pt-BR';
        speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Erro no assistente:', error);
      setResposta('Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente ou entre em contato conosco.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerguntaPreDefinida = (pergunta: Pergunta) => {
    fazerPergunta(pergunta.pergunta, pergunta.categoria);
    setShowMenu(false);
  };

  const handlePerguntaCustom = () => {
    if (perguntaCustom.trim()) {
      fazerPergunta(perguntaCustom.trim());
      setPerguntaCustom('');
    }
  };

  const handleWhatsApp = () => {
    const message = "Olá! Preciso de ajuda com serviços veiculares. Gostaria de falar com um atendente.";
    window.open(`https://wa.me/5522992090682?text=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleFontSize = () => {
    setFontSize(fontSize === 'text-sm' ? 'text-lg' : 'text-sm');
  };

  return (
    <>
      {/* Botão flutuante principal */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary shadow-xl hover:scale-110 transition-transform duration-200"
          aria-label="Abrir Assistente Virtual"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Interface do assistente */}
      {isOpen && (
        <div
          ref={cardRef}
          className={`fixed z-50 transition-all duration-300 ${
            highContrast ? 'contrast-125' : ''
          }`}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {/* Menu suspenso de perguntas */}
          {showMenu && !isMinimized && (
            <Card className="mb-2 w-80 max-h-64 overflow-y-auto shadow-xl border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Perguntas Frequentes
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {categorias.map((cat) => (
                  <div key={cat} className="mb-3">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {cat}
                    </Badge>
                    <div className="space-y-1">
                      {perguntasPreDefinidas
                        .filter(p => p.categoria === cat)
                        .map((pergunta) => (
                          <Button
                            key={pergunta.id}
                            variant="ghost"
                            size="sm"
                            className={`w-full text-left justify-start h-auto p-2 ${fontSize}`}
                            onClick={() => handlePerguntaPreDefinida(pergunta)}
                          >
                            <div className="text-wrap">
                              {pergunta.titulo}
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Caixa principal do assistente */}
          <Card className={`w-80 lg:w-96 shadow-2xl border-2 ${isMinimized ? 'h-12' : 'h-auto max-h-96'} ${
            highContrast ? 'border-black bg-white text-black' : ''
          }`}>
            {/* Header da caixa */}
            <CardHeader 
              className={`pb-2 cursor-move ${isMinimized ? 'pb-1' : ''}`}
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center gap-2 ${fontSize}`}>
                  <Car className="w-5 h-5 text-primary" />
                  <span className={isMinimized ? 'text-xs' : fontSize}>
                    Assistente Virtual
                  </span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFontSize}
                    className="h-6 w-6 p-0"
                    title="Alterar tamanho da fonte"
                  >
                    <Type className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHighContrast(!highContrast)}
                    className="h-6 w-6 p-0"
                    title="Alto contraste"
                  >
                    <Palette className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="h-6 w-6 p-0"
                    title={isMuted ? "Ativar áudio" : "Desativar áudio"}
                  >
                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPosition}
                    className="h-6 w-6 p-0"
                    title="Resetar posição"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-6 w-6 p-0"
                  >
                    {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className={`pt-0 ${fontSize}`}>
                {/* Botões de ação */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex-1 gap-2"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Perguntas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWhatsApp}
                    className="gap-2 bg-green-50 hover:bg-green-100"
                  >
                    <Phone className="w-4 h-4" />
                    Atendente
                  </Button>
                </div>

                {/* Campo de pesquisa customizada */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Digite sua pergunta sobre serviços veiculares..."
                      value={perguntaCustom}
                      onChange={(e) => setPerguntaCustom(e.target.value)}
                      className="flex-1 resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePerguntaCustom();
                        }
                      }}
                    />
                    <Button
                      onClick={handlePerguntaCustom}
                      disabled={!perguntaCustom.trim() || isLoading}
                      className="px-3"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Área de resposta */}
                {(resposta || isLoading) && (
                  <div className="border rounded-lg p-3 bg-muted/50 max-h-48 overflow-y-auto">
                    {categoria && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {categoria}
                      </Badge>
                    )}
                    
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando sua pergunta...
                      </div>
                    ) : (
                      <div className={`whitespace-pre-wrap ${fontSize}`}>
                        {resposta}
                      </div>
                    )}
                  </div>
                )}

                {/* Informações de acessibilidade */}
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>💡 Use as perguntas frequentes ou digite sua dúvida</p>
                  <p>♿ Suporte para leitores de tela ativo</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default AssistenteVirtual;