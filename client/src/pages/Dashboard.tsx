import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User as UserIcon, FileText, Settings } from "lucide-react";
import ClienteDashboard from "@/components/dashboard/ClienteDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (!apiClient.isAuthenticated()) {
        navigate("/login");
        return;
      }

      const userData = apiClient.getUser();
      if (userData) {
        setUser(userData);
        setIsAdmin(userData.type === 'admin');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    apiClient.logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/placeholder.svg" 
              alt="MC Despachante" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">MC Despachante</h1>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {isAdmin ? "Administrador" : "Cliente"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <ClienteDashboard userEmail={user?.email || ""} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;