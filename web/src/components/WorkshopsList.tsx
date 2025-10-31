import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import WorkshopForm from "./WorkshopForm";
import { apiClient } from "@/lib/api";

interface Workshop {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

const WorkshopsList = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  useEffect(() => {
    const filtered = workshops.filter((w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWorkshops(filtered);
  }, [searchQuery, workshops]);

  const fetchWorkshops = async () => {
    try {
      setIsLoading(true);
      const resp = await apiClient.get("/workshops");
      // Assumimos que a resposta possui um array no body
      const data = resp.data ?? [];
      setWorkshops(data);
      setFilteredWorkshops(data);
    } catch (error: any) {
      toast.error("Erro ao carregar oficinas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedWorkshop(null);
    fetchWorkshops();
  };

  if (showForm) {
    return <WorkshopForm workshop={selectedWorkshop} onClose={handleCloseForm} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Oficinas</CardTitle>
              <CardDescription>Gerencie as oficinas do projeto ELLP</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Oficina
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Nenhuma oficina encontrada" : "Nenhuma oficina cadastrada"}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkshops.map((workshop) => (
                <Card key={workshop.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEdit(workshop)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{workshop.name}</h3>
                        {workshop.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{workshop.description}</p>
                        )}
                      </div>
                      <Badge variant={workshop.is_active ? "default" : "secondary"}>
                        {workshop.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {workshop.schedule && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{workshop.schedule}</span>
                        </div>
                      )}
                      {workshop.location && (
                        <p>📍 {workshop.location}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkshopsList;
