import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CadastroClienteAdminProps {
  onCadastroSuccess: () => void;
}

const CadastroClienteAdmin = ({ onCadastroSuccess }: CadastroClienteAdminProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    placaVeiculo: "",
    cpfUltimos5: ""
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.placaVeiculo || !formData.cpfUltimos5) {
      toast({
        title: "Erro",
        description: "Nome, email, placa do veículo e últimos 5 dígitos do CPF são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.cpfUltimos5.replace(/\D/g, '').length !== 5) {
      toast({
        title: "Erro",
        description: "Os últimos 5 dígitos do CPF devem conter exatamente 5 números.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Gerar CPF completo fictício para armazenar (manter apenas os últimos 5 dígitos reais)
      const cpfCompleto = `*****${formData.cpfUltimos5.replace(/\D/g, '')}`;
      
      const { error } = await supabase
        .from('clientes')
        .insert({
          nome: formData.nome,
          email: formData.email,
          cpf: cpfCompleto,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
          placa_veiculo: formData.placaVeiculo.replace(/\D/g, '').toUpperCase(),
          account_status: 'active', // Admin-created accounts are active by default
          email_verified: true, // Admin verifies email during registration
          login_attempts: 0
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Cliente cadastrado com sucesso.",
      });
      
      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        endereco: "",
        placaVeiculo: "",
        cpfUltimos5: ""
      });
      
      setOpen(false);
      onCadastroSuccess();
    } catch (error: any) {
      // Log error securely without exposing sensitive data
      console.error('Client registration error occurred');
      
      if (error.code === '23505') {
        if (error.message.includes('email')) {
          toast({
            title: "Erro",
            description: "Email já cadastrado no sistema.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: "Dados já cadastrados no sistema.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível cadastrar o cliente. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPlaca = (value: string) => {
    const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (alphanumeric.length <= 3) return alphanumeric;
    if (alphanumeric.length <= 7) {
      return alphanumeric.replace(/([A-Z]{3})(\d{0,4})/, '$1-$2');
    }
    return alphanumeric.substring(0, 7).replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  };

  const formatCpfUltimos5 = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.substring(0, 5);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'placaVeiculo') {
      const formatted = formatPlaca(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else if (field === 'cpfUltimos5') {
      const formatted = formatCpfUltimos5(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Cadastrar Cliente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Nome completo do cliente"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="placaVeiculo">Placa do Veículo *</Label>
              <Input
                id="placaVeiculo"
                value={formData.placaVeiculo}
                onChange={(e) => handleInputChange('placaVeiculo', e.target.value)}
                placeholder="ABC-1234"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cpfUltimos5">Últimos 5 dígitos do CPF *</Label>
              <Input
                id="cpfUltimos5"
                value={formData.cpfUltimos5}
                onChange={(e) => handleInputChange('cpfUltimos5', e.target.value)}
                placeholder="12345"
                maxLength={5}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder="Endereço completo do cliente"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Cliente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CadastroClienteAdmin;