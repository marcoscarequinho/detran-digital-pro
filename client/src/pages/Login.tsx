import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Car, User, Lock, Home } from "lucide-react";
import SecurityNotification from "@/components/SecurityNotification";

const Login = () => {
  const [clienteData, setClienteData] = useState({
    placa: "",
    cpf: "",
  });
  const [adminData, setAdminData] = useState({
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const formatPlaca = (value: string) => {
    // Remove todos os caracteres que não são letras ou números
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Aplica a formatação ABC-1234 ou ABC1D23
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.substring(0, 3) + '-' + cleaned.substring(3);
    } else {
      return cleaned.substring(0, 3) + '-' + cleaned.substring(3, 7);
    }
  };

  const formatCPF = (value: string) => {
    // Remove todos os caracteres que não são números
    const cleaned = value.replace(/\D/g, '');
    
    // Pega apenas os últimos 5 dígitos
    if (cleaned.length > 5) {
      return cleaned.slice(-5);
    }
    return cleaned;
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttempt;
    
    if (loginAttempts >= 5 && timeSinceLastAttempt < 300000) { // 5 minutes
      return false;
    }
    
    if (timeSinceLastAttempt > 300000) {
      setLoginAttempts(0);
    }
    
    return true;
  };

  const generateSecurePassword = (placa: string, cpf: string) => {
    // Generate a more secure password with additional entropy and cryptographic randomness
    const timestamp = Date.now().toString();
    const placaCleaned = placa.replace(/[^A-Za-z0-9]/g, '');
    // Use crypto.getRandomValues for cryptographically secure randomness
    const randomArray = new Uint8Array(8);
    crypto.getRandomValues(randomArray);
    const randomSalt = Array.from(randomArray, byte => byte.toString(16).padStart(2, '0')).join('');
    const additionalEntropy = Math.random().toString(36).substring(2, 10);
    return `MC_${placaCleaned}_${cpf}_${timestamp}_${randomSalt}_${additionalEntropy}`;
  };

  const validateInputs = (placa: string, cpf: string) => {
    // Validate license plate format
    const placaRegex = /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;
    if (!placaRegex.test(placa.replace('-', ''))) {
      return "Formato de placa inválido";
    }
    
    // Validate CPF last 5 digits
    if (!/^\d{5}$/.test(cpf)) {
      return "CPF deve conter exatamente 5 dígitos";
    }
    
    return null;
  };

  const handleClienteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!checkRateLimit()) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde 5 minutos antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }
    
    // Input validation
    const validationError = validateInputs(clienteData.placa, clienteData.cpf);
    if (validationError) {
      toast({
        title: "Dados inválidos",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setLoginAttempts(prev => prev + 1);
    setLastAttempt(Date.now());

    try {
      const response = await apiClient.loginCliente({
        placa: clienteData.placa.replace('-', ''),
        cpf: clienteData.cpf
      });

      if (!response.success) {
        toast({
          title: "Erro",
          description: response.error || "Credenciais inválidas",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });
      navigate("/dashboard");

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.loginAdmin({
        email: adminData.email,
        senha: adminData.senha,
      });

      if (!response.success) {
        toast({
          title: "Erro",
          description: response.error || "Email ou senha incorretos.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Login administrativo realizado com sucesso!",
      });
      navigate("/dashboard");

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 mb-4">
            <Home className="h-5 w-5" />
            <span>Voltar ao Site</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">MC Despachante</h1>
          <p className="text-muted-foreground">Acesse sua área exclusiva</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fazer Login</CardTitle>
            <CardDescription>
              Escolha o tipo de acesso abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cliente" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cliente" className="flex items-center space-x-2">
                  <Car className="h-4 w-4" />
                  <span>Cliente</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Administrador</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cliente" className="space-y-4 mt-6">
                <SecurityNotification />
                <form onSubmit={handleClienteLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="placa">Placa do Veículo</Label>
                    <Input
                      id="placa"
                      type="text"
                      placeholder="ABC-1234"
                      value={clienteData.placa}
                      onChange={(e) => 
                        setClienteData({ 
                          ...clienteData, 
                          placa: formatPlaca(e.target.value) 
                        })
                      }
                      maxLength={8}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">Últimos 5 dígitos do CPF</Label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="12345"
                      value={clienteData.cpf}
                      onChange={(e) => 
                        setClienteData({ 
                          ...clienteData, 
                          cpf: formatCPF(e.target.value) 
                        })
                      }
                      maxLength={5}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar como Cliente"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@mcdespachadoria.com.br"
                      value={adminData.email}
                      onChange={(e) => 
                        setAdminData({ 
                          ...adminData, 
                          email: e.target.value 
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      placeholder="Digite sua senha"
                      value={adminData.senha}
                      onChange={(e) => 
                        setAdminData({ 
                          ...adminData, 
                          senha: e.target.value 
                        })
                      }
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar como Administrador"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Problemas para acessar? Entre em contato conosco</p>
          <p className="font-medium text-primary">mcdespachadoria.com.br</p>
        </div>
      </div>
    </div>
  );
};

export default Login;