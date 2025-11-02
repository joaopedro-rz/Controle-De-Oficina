import { useState, useEffect, MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, UserCheck, UserX, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import VolunteerForm from "./VolunteerForm";
import VolunteerHistory from "./VolunteerHistory";
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
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Volunteer>>({});
  const [deleteVolunteerId, setDeleteVolunteerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleHistory = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowHistory(true);
  };

  const handleStartInlineEdit = (volunteer: Volunteer, e: MouseEvent) => {
    e.stopPropagation();
    setEditingId(volunteer.id);
    setEditFormData({
      full_name: volunteer.full_name,
      email: volunteer.email ?? '',
      phone: volunteer.phone ?? '',
      entry_date: volunteer.entry_date,
      exit_date: volunteer.exit_date ?? '',
      is_active: volunteer.is_active,
    });
  };

  const handleCancelInlineEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveInlineEdit = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!editFormData.full_name?.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        full_name: editFormData.full_name.trim(),
        email: editFormData.email?.trim() || null,
        phone: editFormData.phone?.trim() || null,
        entry_date: editFormData.entry_date,
        exit_date: editFormData.exit_date || null,
        is_active: editFormData.is_active,
      };
      const resp = await apiClient.put(`/volunteers/${id}`, payload);
      const updated = resp.data;
      setVolunteers((prev) => prev.map((v) => (v.id === id ? updated : v)));
      setFilteredVolunteers((prev) => prev.map((v) => (v.id === id ? updated : v)));
      toast.success('Voluntário atualizado');
      handleCancelInlineEdit();
    } catch (error: any) {
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartDelete = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setDeleteVolunteerId(id);
  };

  const handleCancelDelete = () => {
    setDeleteVolunteerId(null);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/volunteers/${id}`);
      setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: false, exit_date: new Date().toISOString() } : v)));
      setFilteredVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: false, exit_date: new Date().toISOString() } : v)));
      toast.success('Voluntário marcado como inativo');
      handleCancelDelete();
    } catch (error: any) {
      toast.error('Erro ao excluir voluntário');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateTerm = async (volunteer: Volunteer) => {
    try {
      setIsLoading(true);
      const resp = await apiClient.get(`/volunteers/${volunteer.id}/term`, { responseType: 'blob' });
      const blob = new Blob([resp.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `termo-${volunteer.full_name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado');
    } catch (error: any) {
      toast.error('Erro ao gerar termo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedVolunteer(null);
    fetchVolunteers();
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setSelectedVolunteer(null);
  };

  if (showForm) {
    return <VolunteerForm volunteer={selectedVolunteer} onClose={handleCloseForm} />;
  }

  if (showHistory && selectedVolunteer) {
    return (
      <VolunteerHistory
        volunteerId={selectedVolunteer.id}
        volunteerName={selectedVolunteer.full_name}
        onClose={handleCloseHistory}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={deleteVolunteerId !== null} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Inativação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja marcar este voluntário como inativo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteVolunteerId && handleConfirmDelete(deleteVolunteerId)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inativando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Card key={volunteer.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => !editingId && handleEdit(volunteer)}>
                  <CardContent className="pt-6">
                    {editingId === volunteer.id ? (
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 space-y-2">
                            <Input 
                              value={editFormData.full_name || ''} 
                              onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                              placeholder="Nome completo"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Input 
                              value={editFormData.email || ''} 
                              onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Email"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Input 
                              value={editFormData.phone || ''} 
                              onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Telefone"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <Badge
                            variant={volunteer.is_active ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {volunteer.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                            {volunteer.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1 mb-3">
                          <p>Entrada: {new Date(volunteer.entry_date).toLocaleDateString("pt-BR")}</p>
                          {volunteer.exit_date && (
                            <p>Saída: {new Date(volunteer.exit_date).toLocaleDateString("pt-BR")}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => handleSaveInlineEdit(volunteer.id, e)}
                            disabled={isSaving || !editFormData.full_name?.trim()}
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar'
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleCancelInlineEdit(); }}
                            disabled={isSaving}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={(e) => handleStartDelete(volunteer.id, e)}
                            disabled={isSaving}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                          <Badge
                            variant={volunteer.is_active ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {volunteer.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                            {volunteer.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1 mb-3">
                          <p>Entrada: {new Date(volunteer.entry_date).toLocaleDateString("pt-BR")}</p>
                          {volunteer.exit_date && (
                            <p>Saída: {new Date(volunteer.exit_date).toLocaleDateString("pt-BR")}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={(e) => handleStartInlineEdit(volunteer, e)}>
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleGenerateTerm(volunteer); }}>
                            Gerar Termo
                          </Button>
                          <Button variant="secondary" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); handleHistory(volunteer); }}>
                            <History className="h-3 w-3" /> Histórico
                          </Button>
                        </div>
                      </>
                    )}
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