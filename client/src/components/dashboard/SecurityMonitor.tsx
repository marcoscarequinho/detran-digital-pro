import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";

interface AuthAttempt {
  id: string;
  email: string | null;
  identifier: string | null;
  attempt_type: string;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

interface SecurityAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  details: any;
  created_at: string;
}

const SecurityMonitor = () => {
  const [authAttempts, setAuthAttempts] = useState<AuthAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent authentication attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('auth_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (attemptsError) {
        console.error('Error fetching auth attempts:', attemptsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar tentativas de autenticação",
          variant: "destructive",
        });
      } else {
        setAuthAttempts(attempts || []);
      }

      // Fetch recent audit logs
      const { data: logs, error: logsError } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Error fetching audit logs:', logsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar logs de auditoria",
          variant: "destructive",
        });
      } else {
        setAuditLogs(logs || []);
      }

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de segurança",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getAttemptTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'client_blocked':
        return 'bg-red-100 text-red-800';
      case 'client_lookup':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'user_created':
        return 'bg-green-100 text-green-800';
      case 'role_change':
        return 'bg-orange-100 text-orange-800';
      case 'login_success':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const recentFailedAttempts = authAttempts.filter(attempt => !attempt.success).length;
  const recentSuccessfulAttempts = authAttempts.filter(attempt => attempt.success).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Tentativas</p>
                <p className="text-2xl font-bold">{authAttempts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Login Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{recentSuccessfulAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tentativas Falharam</p>
                <p className="text-2xl font-bold text-red-600">{recentFailedAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authentication Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Tentativas de Autenticação Recentes</span>
          </CardTitle>
          <CardDescription>
            Últimas 50 tentativas de login (atualiza automaticamente a cada 30 segundos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {authAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {attempt.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAttemptTypeColor(attempt.attempt_type)}>
                          {attempt.attempt_type}
                        </Badge>
                        <span className="text-sm font-medium">
                          {attempt.email || attempt.identifier || 'N/A'}
                        </span>
                      </div>
                      {attempt.error_message && (
                        <p className="text-xs text-red-600 mt-1">{attempt.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(attempt.created_at)}
                  </div>
                </div>
              ))}
              {authAttempts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma tentativa de autenticação recente
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Logs de Auditoria de Segurança</span>
          </CardTitle>
          <CardDescription>
            Registro de ações de segurança importantes no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm font-medium">{log.resource_type}</span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.details, null, 0)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(log.created_at)}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum log de auditoria recente
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;