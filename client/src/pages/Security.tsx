import SecurityAlert from "@/components/SecurityAlert";
import SecurityEnhanced from "@/components/dashboard/SecurityEnhanced";

const Security = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Segurança do Sistema</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Monitoramento e configurações de segurança avançadas para proteção de dados
        </p>
      </div>
      
      <SecurityAlert />
      <SecurityEnhanced />
    </div>
  );
};

export default Security;