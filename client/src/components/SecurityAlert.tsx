import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

const SecurityAlert = () => {
  return (
    <div className="space-y-4">
      <Alert className="border-green-200 bg-green-50 text-green-900">
        <Shield className="h-4 w-4" />
        <AlertTitle>✅ Segurança Avançada Implementada</AlertTitle>
        <AlertDescription>
          Sistema atualizado com medidas de segurança críticas:
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Proteção avançada de dados pessoais (PII) com mascaramento inteligente</li>
            <li>• Controle de acesso baseado em função com auditoria</li>
            <li>• Rate limiting inteligente com detecção de ameaças</li>
            <li>• Logs de segurança sanitizados e criptografados</li>
            <li>• Monitoramento de violações de segurança em tempo real</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Alert className="border-orange-200 bg-orange-50 text-orange-900">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>⚠️ Configuração Manual Necessária</AlertTitle>
        <AlertDescription>
          <p className="font-medium">Ação requerida do administrador:</p>
          <p className="mt-1 text-sm">
            Configure OTP expiry para 600 segundos (10 minutos) em:
            <strong> Supabase Dashboard → Authentication → Settings</strong>
          </p>
          <p className="mt-2 text-xs text-orange-700">
            Esta configuração melhora significativamente a segurança do sistema.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityAlert;