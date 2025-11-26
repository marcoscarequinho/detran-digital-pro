import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Car, AlertCircle, FileText } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ConsultaFormProps {
  tipo: 'gravame' | 'crv-digital' | 'base-estadual' | 'atpv-e';
  titulo: string;
  descricao: string;
}

const ConsultaForm = ({ tipo, titulo, descricao }: ConsultaFormProps) => {
  const [placa, setPlaca] = useState("");
  const [chassis, setChassis] = useState("");
  const [renavam, setRenavam] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const { toast } = useToast();

  const formatarPlaca = (valor: string) => {
    // Remove caracteres não alfanuméricos e converte para maiúsculo
    const limpo = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Aplica formatação XXX-XXXX ou XXX-XXXX
    if (limpo.length <= 3) {
      return limpo;
    } else if (limpo.length <= 7) {
      return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
    } else {
      return `${limpo.slice(0, 3)}-${limpo.slice(3, 7)}`;
    }
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarPlaca(e.target.value);
    setPlaca(valorFormatado);
  };

  const realizarConsulta = async () => {
    // Validações específicas por tipo
    if (tipo === 'atpv-e') {
      const placaLimpa = placa.replace(/[^A-Z0-9]/gi, '');
      const chassisLimpo = chassis.replace(/[^A-Z0-9]/gi, '');
      
      if ((!placaLimpa || placaLimpa.length !== 7) && !chassisLimpo) {
        toast({
          title: "Dados inválidos",
          description: "Para ATPV-E, digite uma placa válida OU o chassi completo",
          variant: "destructive",
        });
        return;
      }
      
      if (!renavam || renavam.length < 9) {
        toast({
          title: "RENAVAM inválido",
          description: "Digite o RENAVAM completo (mínimo 9 dígitos)",
          variant: "destructive",
        });
        return;
      }
    } else {
      const placaLimpa = placa.replace(/[^A-Z0-9]/gi, '');
      
      if (placaLimpa.length !== 7) {
        toast({
          title: "Placa inválida",
          description: "Digite uma placa válida no formato ABC-1234 ou ABC-1D23",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    setResultado(null);

    try {
      const requestBody: any = { tipo };
      
      if (placa) {
        requestBody.placa = placa.replace(/[^A-Z0-9]/gi, '');
      }
      
      if (chassis) {
        requestBody.chassis = chassis.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      }
      
      if (renavam) {
        requestBody.renavam = renavam;
      }

      const response = await apiClient.consultarVeiculo(requestBody);

      if (!response.success) {
        throw new Error(response.error || 'Erro na consulta');
      }

      if (response.data.success) {
        const identificacao = requestBody.placa || requestBody.chassis || 'veículo';
        
        // Se é PDF, criar um link para download
        if (response.data.data.tipo === 'pdf') {
          const pdfBlob = new Blob([
            Uint8Array.from(atob(response.data.data.arquivo), c => c.charCodeAt(0))
          ], { type: 'application/pdf' });
          
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `consulta-${tipo}-${identificacao}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setResultado({ tipo: 'pdf', arquivo_baixado: true });
          
          toast({
            title: "PDF gerado com sucesso!",
            description: `O arquivo da consulta ${tipo} foi baixado.`,
          });
        } else {
          // Dados JSON normais
          setResultado(response.data.data);
          toast({
            title: "Consulta realizada com sucesso!",
            description: `Dados do ${identificacao} encontrados.`,
          });
        }
      } else {
        throw new Error(response.data.error || 'Erro na consulta');
      }
    } catch (error) {
      console.error('Erro na consulta:', error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível realizar a consulta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderResultado = () => {
    if (!resultado) return null;
    
    // Se é PDF que foi baixado
    if (resultado.tipo === 'pdf' && resultado.arquivo_baixado) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              PDF Baixado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">✅ O arquivo PDF foi baixado com sucesso!</p>
          </CardContent>
        </Card>
      );
    }

    switch (tipo) {
      case 'gravame':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Resultado da Consulta de Gravame
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Dados do Proprietário</h4>
                  <p><strong>Nome:</strong> {resultado.proprietario}</p>
                  <p><strong>CPF:</strong> {resultado.cpf}</p>
                  <p><strong>Cidade:</strong> {resultado.cidade}/{resultado.uf}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dados do Veículo</h4>
                  <p><strong>Marca:</strong> {resultado.marca}</p>
                  <p><strong>Modelo:</strong> {resultado.modelo}</p>
                  <p><strong>Cor:</strong> {resultado.cor}</p>
                  <p><strong>Ano:</strong> {resultado.ano}</p>
                  <p><strong>Combustível:</strong> {resultado.combustivel}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Informações Adicionais</h4>
                <p><strong>RENAVAM:</strong> {resultado.renavam}</p>
                <p><strong>Chassi:</strong> {resultado.chassi}</p>
                <p><strong>Score:</strong> {resultado.score}/10</p>
                <p><strong>Leilão:</strong> {resultado.leilao}</p>
                <p><strong>INMETRO:</strong> {resultado.inmetro}</p>
                <div className="mt-2">
                  <strong>Restrições:</strong>
                  {resultado.restricoes.length > 0 ? (
                    <div className="flex gap-2 mt-1">
                      {resultado.restricoes.map((restricao: string, index: number) => (
                        <Badge key={index} variant="destructive">{restricao}</Badge>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="secondary">Nenhuma restrição</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'crv-digital':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                CRV Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Códigos de Segurança</h4>
                <p className="text-green-700"><strong>Código Segurança:</strong> {resultado.codigo_seguranca}</p>
                <p className="text-green-700"><strong>Número CRV:</strong> {resultado.numero_crv}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Proprietário</h4>
                  <p><strong>Nome:</strong> {resultado.proprietario}</p>
                  <p><strong>Documento:</strong> {resultado.documento}</p>
                  <p className="text-sm text-muted-foreground mt-1">{resultado.endereco}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Veículo</h4>
                  <p><strong>Marca/Modelo:</strong> {resultado.veiculo.marca} {resultado.veiculo.modelo}</p>
                  <p><strong>Cor:</strong> {resultado.veiculo.cor}</p>
                  <p><strong>Ano:</strong> {resultado.veiculo.ano_fabricacao}/{resultado.veiculo.ano_modelo}</p>
                  <p><strong>Combustível:</strong> {resultado.veiculo.combustivel}</p>
                  <p><strong>RENAVAM:</strong> {resultado.veiculo.renavam}</p>
                  <p><strong>Chassi:</strong> {resultado.veiculo.chassi}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'base-estadual':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Base Estadual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Dados Cadastrais</h4>
                  <p><strong>Placa:</strong> {resultado.placa}</p>
                  <p><strong>RENAVAM:</strong> {resultado.renavam}</p>
                  <p><strong>Chassi:</strong> {resultado.chassi}</p>
                  <p><strong>Marca/Modelo:</strong> {resultado.marca} {resultado.modelo}</p>
                  <p><strong>Cor:</strong> {resultado.cor}</p>
                  <p><strong>Ano:</strong> {resultado.ano_fabricacao}/{resultado.ano_modelo}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Especificações</h4>
                  <p><strong>Espécie:</strong> {resultado.especie}</p>
                  <p><strong>Categoria:</strong> {resultado.categoria}</p>
                  <p><strong>Combustível:</strong> {resultado.combustivel}</p>
                  <p><strong>Cilindrada:</strong> {resultado.cilindrada}cc</p>
                  <p><strong>Potência:</strong> {resultado.potencia}cv</p>
                  <p><strong>Capacidade:</strong> {resultado.capacidade} pessoas</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Restrições</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Administrativas:</span>
                    <Badge variant={resultado.restricoes.administrativas === "Não" ? "secondary" : "destructive"}>
                      {resultado.restricoes.administrativas}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Financeiras:</span>
                    <Badge variant={resultado.restricoes.financeiras === "Não" ? "secondary" : "destructive"}>
                      {resultado.restricoes.financeiras}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Judiciais:</span>
                    <Badge variant={resultado.restricoes.judiciais === "Não" ? "secondary" : "destructive"}>
                      {resultado.restricoes.judiciais}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Tributárias:</span>
                    <Badge variant={resultado.restricoes.tributarias === "Não" ? "secondary" : "destructive"}>
                      {resultado.restricoes.tributarias}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Roubo/Furto:</span>
                    <Badge variant={resultado.restricoes.roubo_furto === "Não" ? "secondary" : "destructive"}>
                      {resultado.restricoes.roubo_furto}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Proprietário</h4>
                <p><strong>Nome:</strong> {resultado.proprietario.nome}</p>
                <p><strong>Documento:</strong> {resultado.proprietario.documento}</p>
                <p><strong>Tipo:</strong> {resultado.proprietario.tipo_proprietario}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Emplacamento</h4>
                <p><strong>Município:</strong> {resultado.emplacamento.municipio}/{resultado.emplacamento.uf}</p>
                <p><strong>Primeira Habilitação:</strong> {new Date(resultado.emplacamento.data_primeira_habilitacao).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'atpv-e':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Reemissão ATPV-E
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">ATPV Disponível</h4>
                <p className="text-green-700"><strong>Status:</strong> {resultado.status}</p>
                <p className="text-green-700"><strong>Protocolo:</strong> {resultado.protocolo}</p>
                {resultado.download_url && (
                  <a 
                    href={resultado.download_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 text-green-700 hover:text-green-800 underline"
                  >
                    📄 Baixar ATPV-E
                  </a>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Dados do Veículo</h4>
                  <p><strong>Placa:</strong> {resultado.veiculo.placa}</p>
                  <p><strong>Chassi:</strong> {resultado.veiculo.chassi}</p>
                  <p><strong>RENAVAM:</strong> {resultado.veiculo.renavam}</p>
                  <p><strong>Marca/Modelo:</strong> {resultado.veiculo.marca} {resultado.veiculo.modelo}</p>
                  <p><strong>Ano:</strong> {resultado.veiculo.ano}</p>
                  <p><strong>Cor:</strong> {resultado.veiculo.cor}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informações ATPV</h4>
                  <p><strong>Número ATPV:</strong> {resultado.atpv.numero}</p>
                  <p><strong>Data Emissão:</strong> {new Date(resultado.atpv.data_emissao).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Validade:</strong> {new Date(resultado.atpv.data_validade).toLocaleDateString('pt-BR')}</p>
                  <div className="mt-2">
                    <strong>Status do Veículo:</strong>
                    <Badge variant={resultado.comunicado_venda ? "destructive" : "secondary"} className="ml-2">
                      {resultado.comunicado_venda ? "Com Comunicado de Venda" : "Sem Comunicado de Venda"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Digite apenas a placa do veículo, nunca envie fotos</span>
          </div>
          
          {tipo === 'atpv-e' ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="ABC-1234 (Placa)"
                  value={placa}
                  onChange={handlePlacaChange}
                  maxLength={8}
                  className="font-mono text-lg tracking-wide"
                />
                <span className="flex items-center text-muted-foreground">OU</span>
                <Input
                  placeholder="17 dígitos do chassi"
                  value={chassis}
                  onChange={(e) => setChassis(e.target.value.toUpperCase())}
                  maxLength={17}
                  className="font-mono text-lg tracking-wide"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="RENAVAM (obrigatório)"
                  value={renavam}
                  onChange={(e) => setRenavam(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  className="font-mono text-lg tracking-wide"
                />
                <Button 
                  onClick={realizarConsulta}
                  disabled={loading || (!placa && !chassis) || !renavam}
                  className="gap-2 min-w-[120px]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {loading ? 'Consultando...' : 'Consultar'}
                </Button>
              </div>
            </div>
          ) : tipo === 'gravame' ? (
            <div className="flex gap-2">
              <Input
                placeholder="ABC-1234"
                value={placa}
                onChange={handlePlacaChange}
                maxLength={8}
                className="font-mono text-lg tracking-wide"
              />
              <Button 
                onClick={realizarConsulta}
                disabled={loading || placa.length < 8}
                className="gap-2 min-w-[120px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? 'Consultando...' : 'Consultar'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="ABC-1234"
                value={placa}
                onChange={handlePlacaChange}
                maxLength={8}
                className="font-mono text-lg tracking-wide"
              />
              <Input
                placeholder="RENAVAM"
                value={renavam}
                onChange={(e) => setRenavam(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                className="font-mono text-lg tracking-wide"
              />
              <Button 
                onClick={realizarConsulta}
                disabled={loading || placa.length < 8 || !renavam}
                className="gap-2 min-w-[120px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {loading ? 'Consultando...' : 'Consultar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {renderResultado()}
    </div>
  );
};

export default ConsultaForm;