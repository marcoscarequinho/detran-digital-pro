import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";

const SecurityNotification = () => {
  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-900">
      <Shield className="h-4 w-4" />
      <AlertTitle>Melhorias de Segurança Implementadas</AlertTitle>
      <AlertDescription>
        Implementamos importantes melhorias de segurança em nosso sistema:
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Autenticação de clientes temporariamente desabilitada para revisão de segurança</li>
          <li>• Monitoramento avançado de tentativas de login</li>
          <li>• Prevenção contra escalação de privilégios</li>
          <li>• Logs de auditoria de segurança em tempo real</li>
        </ul>
        <p className="mt-2 text-sm font-medium">
          Para acesso como cliente, entre em contato com nossa equipe administrativa.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default SecurityNotification;