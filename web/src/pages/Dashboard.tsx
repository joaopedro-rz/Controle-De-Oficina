import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import VolunteersList from "@/components/VolunteersList";
import WorkshopsList from "@/components/WorkshopsList";
import { apiClient } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session by calling backend /auth/me using token from localStorage
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const resp = await apiClient.get("/auth/me");
        const user = resp.data ?? null;
        if (!user) {
          localStorage.removeItem("token");
          navigate("/auth");
          return;
        }
        setUser(user);
        setSession({ user });
      } catch (err) {
        // invalid session
        localStorage.removeItem("token");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Remove token locally; if backend needs a revoke call implement it
      localStorage.removeItem("token");
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-xl">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ELLP Voluntários</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="volunteers" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="volunteers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Voluntários
            </TabsTrigger>
            <TabsTrigger value="workshops" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Oficinas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="volunteers">
            <VolunteersList />
          </TabsContent>

          <TabsContent value="workshops">
            <WorkshopsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
