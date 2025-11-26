import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Car, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface SenatranResult {
  ApiResultType: string;
  HasPdf: boolean;
  Message: string;
  PdfUrl?: string;
  Result?: {
    AnoFabricacao: number;
    AnoModelo: number;
    MarcaModelo: { Descricao: string };
    Cor: { Descricao: string };
    Combustivel: { Descricao: string };
    Situacao: string;
    Chassi: string;
    NumeroMotor: string;
    Placa: string;
    NomeProprietario: string;
    MunicipioEmplacamento: { Descricao: string };
    UfJurisdicao: string;
    CodigoRenavam: string;
    IndicadorRouboFurto: boolean;
    IndicadorAlarme: boolean;
  };
}

const SenatranConsulta = () => {
  const [placa, setPlaca] = useState("");
  const [renavam, setRenavam] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SenatranResult | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleConsulta = async () => {
    if (!placa || !renavam || !cpf) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.consultarVeiculo({
        placa: placa.toUpperCase(),
        renavam,
        tipo: 'base-estadual'
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro na consulta');
      }

      if (response.data.success && response.data.data.Result) {
        setResult(response.data.data);
        toast({
          title: "Consulta realizada",
          description: "Dados do veículo obtidos com sucesso"
        });
      } else {
        throw new Error(response.data.error || "Erro na consulta");
      }
    } catch (error) {
      console.error('Erro na consulta:', error);
      toast({
        variant: "destructive",
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Não foi possível realizar a consulta. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPlaca = (value: string) => {
    // Remove caracteres não alfanuméricos e converte para maiúsculo
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Formato padrão ABC-1234 ou ABC1D23 (Mercosul)
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    }
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="lg"
          className="fixed bottom-4 left-4 z-[9999] shadow-lg"
        >
          <Car className="mr-2 h-5 w-5" />
          Consulta Senatran
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consulta Veicular - Senatran
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulário de Consulta */}
          <Card>
            <CardHeader>
              <CardTitle>Dados para Consulta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="placa">Placa do Veículo *</Label>
                <Input
                  id="placa"
                  placeholder="ABC-1234"
                  value={placa}
                  onChange={(e) => setPlaca(formatPlaca(e.target.value))}
                  maxLength={8}
                />
              </div>

              <div>
                <Label htmlFor="renavam">RENAVAM *</Label>
                <Input
                  id="renavam"
                  placeholder="12345678901"
                  value={renavam}
                  onChange={(e) => setRenavam(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF do Proprietário *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                />
              </div>
              
              <Button 
                onClick={handleConsulta}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Consultando..." : "Realizar Consulta"}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado da Consulta */}
          {result && result.Result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resultado da Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Placa:</strong> {result.Result.Placa}
                  </div>
                  <div>
                    <strong>RENAVAM:</strong> {result.Result.CodigoRenavam}
                  </div>
                  <div>
                    <strong>Marca/Modelo:</strong> {result.Result.MarcaModelo.Descricao}
                  </div>
                  <div>
                    <strong>Ano Fab/Modelo:</strong> {result.Result.AnoFabricacao}/{result.Result.AnoModelo}
                  </div>
                  <div>
                    <strong>Cor:</strong> {result.Result.Cor.Descricao}
                  </div>
                  <div>
                    <strong>Combustível:</strong> {result.Result.Combustivel.Descricao}
                  </div>
                  <div>
                    <strong>Situação:</strong> {result.Result.Situacao}
                  </div>
                  <div>
                    <strong>UF:</strong> {result.Result.UfJurisdicao}
                  </div>
                  <div>
                    <strong>Município:</strong> {result.Result.MunicipioEmplacamento.Descricao}
                  </div>
                  <div>
                    <strong>Proprietário:</strong> {result.Result.NomeProprietario}
                  </div>
                  <div>
                    <strong>Chassi:</strong> {result.Result.Chassi}
                  </div>
                  <div>
                    <strong>Motor:</strong> {result.Result.NumeroMotor}
                  </div>
                </div>

                {/* Indicadores de Alerta */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Situação do Veículo:</h4>
                  <div className="flex gap-4 text-sm">
                    <span className={`px-2 py-1 rounded ${result.Result.IndicadorRouboFurto ? 'bg-destructive text-destructive-foreground' : 'bg-green-100 text-green-800'}`}>
                      {result.Result.IndicadorRouboFurto ? 'Roubo/Furto: SIM' : 'Roubo/Furto: NÃO'}
                    </span>
                    <span className={`px-2 py-1 rounded ${result.Result.IndicadorAlarme ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {result.Result.IndicadorAlarme ? 'Alarme: SIM' : 'Alarme: NÃO'}
                    </span>
                  </div>
                </div>

                {/* Link para PDF */}
                {result.HasPdf && result.PdfUrl && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(result.PdfUrl, '_blank')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar Relatório PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SenatranConsulta;