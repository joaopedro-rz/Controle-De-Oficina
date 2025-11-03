import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface Volunteer { id: string; full_name: string; }
interface Workshop { id: string; name: string; is_active: boolean; }
interface Participation { id: string; volunteer_id: string; workshop_id: string; date: string | null; role: string | null; hours: number | null; notes: string | null; }

const Participations = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);

  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [newVolunteerId, setNewVolunteerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [w, v] = await Promise.all([
          apiClient.get("/workshops"),
          apiClient.get("/volunteers"),
        ]);
        const ws = (w.data ?? []) as Workshop[];
        const vs = (v.data ?? []) as Volunteer[];
        setWorkshops(ws);
        setVolunteers(vs);
        const firstActive = ws.find(x => x.is_active) ?? ws[0];
        if (firstActive) setSelectedWorkshopId(firstActive.id);
      } catch (e) {
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadParts = async () => {
      if (!selectedWorkshopId) return;
      try {
        const r = await apiClient.get(`/participations`, { params: { workshopId: selectedWorkshopId } });
        setParticipations(r.data ?? []);
      } catch (e) {
        toast.error("Erro ao carregar participações");
      }
    };
    loadParts();
  }, [selectedWorkshopId]);

  const volunteerMap = useMemo(() => {
    const m = new Map<string, Volunteer>();
    for (const v of volunteers) m.set(v.id, v);
    return m;
  }, [volunteers]);

  const filtered = useMemo(() => {
    if (!search) return participations;
    return participations.filter(p => (volunteerMap.get(p.volunteer_id)?.full_name || "").toLowerCase().includes(search.toLowerCase()));
  }, [participations, volunteerMap, search]);

  const handleAdd = async () => {
    if (!selectedWorkshopId || !newVolunteerId) return;
    setIsSaving(true);
    try {
      await apiClient.post('/participations', { workshop_id: selectedWorkshopId, volunteer_id: newVolunteerId });
      toast.success("Voluntário vinculado à oficina");
      setNewVolunteerId("");
      const r = await apiClient.get(`/participations`, { params: { workshopId: selectedWorkshopId } });
      setParticipations(r.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erro ao vincular voluntário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiClient.delete(`/participations/${id}`);
      setParticipations(prev => prev.filter(p => p.id !== id));
      toast.success("Vínculo removido");
    } catch (e) {
      toast.error("Erro ao remover vínculo");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Participações</CardTitle>
              <CardDescription>Visualize e gerencie voluntários por oficina</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <Select value={selectedWorkshopId} onValueChange={setSelectedWorkshopId}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Carregando oficinas..." : "Selecione a oficina"} />
                </SelectTrigger>
                <SelectContent>
                  {workshops.map(w => (
                    <SelectItem key={w.id} value={w.id}>
                      <div className="flex items-center gap-2">
                        <span>{w.name}</span>
                        <Badge variant={w.is_active ? "default" : "secondary"}>{w.is_active ? "Ativa" : "Inativa"}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Input placeholder="Filtrar por voluntário..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={newVolunteerId} onValueChange={setNewVolunteerId}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Selecionar voluntário para adicionar" />
              </SelectTrigger>
              <SelectContent>
                {volunteers
                  .filter(v => !participations.some(p => p.volunteer_id === v.id))
                  .map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!newVolunteerId || !selectedWorkshopId || isSaving} className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voluntário</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum voluntário nesta oficina</TableCell>
                  </TableRow>
                ) : (
                  filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{volunteerMap.get(p.volunteer_id)?.full_name || p.volunteer_id}</TableCell>
                      <TableCell>{p.date ? new Date(p.date).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell>{p.role || '-'}</TableCell>
                      <TableCell>{p.hours ?? '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(p.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Participations;

