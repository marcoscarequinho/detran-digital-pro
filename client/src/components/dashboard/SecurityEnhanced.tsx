import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, Clock, Database, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SecurityRecommendation {
  category: string;
  status: string;
  priority: string;
  recommendation: string;
}

interface SecurityViolation {
  violation_type: string;
  count_last_hour: number;
  severity: string;
  recommendation: string;
}

const SecurityEnhanced = () => {
  const [recommendations, setRecommendations] = useState<SecurityRecommendation[]>([]);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      const [recsResponse, violationsResponse] = await Promise.all([
        supabase.rpc('get_security_recommendations'),
        supabase.rpc('check_security_violations')
      ]);

      if (recsResponse.data) setRecommendations(recsResponse.data);
      if (violationsResponse.data) setViolations(violationsResponse.data);
    } catch (error) {
      console.error('Security data fetch error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status.includes('⚠️')) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const highViolations = violations.filter(v => v.severity === 'high');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Segurança Avançada</h2>
          <p className="text-muted-foreground">
            Monitoramento e recomendações de segurança em tempo real
          </p>
        </div>
      </div>

      {/* Critical Alerts */}
      {(criticalViolations.length > 0 || highViolations.length > 0) && (
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas de Segurança Críticos</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {criticalViolations.map((violation, index) => (
                <div key={index} className="text-sm">
                  • <strong>{violation.violation_type}</strong>: {violation.count_last_hour} ocorrências na última hora
                </div>
              ))}
              {highViolations.map((violation, index) => (
                <div key={index} className="text-sm">
                  • <strong>{violation.violation_type}</strong>: {violation.count_last_hour} ocorrências na última hora
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Status da Configuração</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(rec.status)}
                      <div>
                        <h4 className="font-medium">{rec.category}</h4>
                        <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={getPriorityColor(rec.priority) as any} className="text-xs">
                        {rec.priority}
                      </Badge>
                      <span className="text-xs">{rec.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Violações de Segurança</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : violations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma violação detectada na última hora</p>
                <p className="text-sm text-muted-foreground mt-1">Sistema funcionando normalmente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {violations.map((violation, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{violation.violation_type}</h4>
                      <Badge variant={getSeverityColor(violation.severity) as any}>
                        {violation.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {violation.count_last_hour} ocorrências na última hora
                    </p>
                    <p className="text-sm">{violation.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Features Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos de Segurança Implementados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🛡️ Proteção PII Avançada</h4>
              <p className="text-sm text-muted-foreground">
                Mascaramento automático de dados pessoais baseado em função do usuário
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🚦 Rate Limiting Inteligente</h4>
              <p className="text-sm text-muted-foreground">
                Detecção de padrões suspeitos com limites dinâmicos
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">📊 Auditoria Completa</h4>
              <p className="text-sm text-muted-foreground">
                Log detalhado de todas as ações e acessos ao sistema
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🔐 Controle de Acesso</h4>
              <p className="text-sm text-muted-foreground">
                RLS (Row Level Security) com políticas baseadas em função
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">⚡ Monitoramento Tempo Real</h4>
              <p className="text-sm text-muted-foreground">
                Detecção automática de violações e alertas de segurança
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🔒 Sessões Seguras</h4>
              <p className="text-sm text-muted-foreground">
                Gerenciamento seguro de sessões com expiração configurável
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityEnhanced;