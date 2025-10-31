import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import VolunteerForm from "./VolunteerForm";
import { apiClient } from "@/lib/api";

interface Volunteer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  entry_date: string;
  exit_date: string | null;
  is_active: boolean;
  created_at: string;
}

const VolunteersList = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    const filtered = volunteers.filter((v) =>
      v.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVolunteers(filtered);
  }, [searchQuery, volunteers]);

  const fetchVolunteers = async () => {
    try {
      setIsLoading(true);
      const resp = await apiClient.get("/volunteers");
      const data = resp.data ?? [];
      setVolunteers(data);
      setFilteredVolunteers(data);
    } catch (error: any) {
      toast.error("Erro ao carregar voluntários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedVolunteer(null);
    fetchVolunteers();
  };

  if (showForm) {
    return <VolunteerForm volunteer={selectedVolunteer} onClose={handleCloseForm} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Voluntários</CardTitle>
              <CardDescription>Gerencie os voluntários do projeto ELLP</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Voluntário
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Nenhum voluntário encontrado" : "Nenhum voluntário cadastrado"}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredVolunteers.map((volunteer) => (
                <Card key={volunteer.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEdit(volunteer)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{volunteer.full_name}</h3>
                        {volunteer.email && (
                          <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                        )}
                        {volunteer.phone && (
                          <p className="text-sm text-muted-foreground">{volunteer.phone}</p>
                        )}
                      </div>
                      <Badge variant={volunteer.is_active ? "default" : "secondary"}>
                        {volunteer.is_active ? (
                          <><UserCheck className="h-3 w-3 mr-1" />Ativo</>
                        ) : (
                          <><UserX className="h-3 w-3 mr-1" />Inativo</>
                        )}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Entrada: {new Date(volunteer.entry_date).toLocaleDateString("pt-BR")}</p>
                      {volunteer.exit_date && (
                        <p>Saída: {new Date(volunteer.exit_date).toLocaleDateString("pt-BR")}</p>
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

export default VolunteersList;
