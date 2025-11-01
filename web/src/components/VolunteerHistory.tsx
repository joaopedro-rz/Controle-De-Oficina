import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface Participation {
  id: string;
  volunteer_id: string;
  workshop_id: string;
  date: string | null;
  role: string | null;
  hours: number | null;
  notes: string | null;
}

interface Workshop { id: string; name: string; is_active: boolean; }

interface Props {
  volunteerId: string;
  volunteerName: string;
  onClose: () => void;
}

const VolunteerHistory = ({ volunteerId, volunteerName, onClose }: Props) => {
  const [items, setItems] = useState<Participation[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let list: Participation[] = [];
        try {
          const histPt = await apiClient.get(`/participacoes/${volunteerId}`);
          list = histPt.data ?? [];
        } catch {
          // fallback para rota EN
          const histEn = await apiClient.get(`/participations/volunteer/${volunteerId}`);
          list = histEn.data ?? [];
        }
        const ws = await apiClient.get(`/workshops`);
        // garante ordenação desc por data
        list.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });
        setItems(list);
        setWorkshops(ws.data ?? []);
      } catch (e) {
        toast.error("Erro ao carregar histórico");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [volunteerId]);

  const workshopMap = useMemo(() => {
    const m = new Map<string, Workshop>();
    for (const w of workshops) m.set(w.id, w);
    return m;
  }, [workshops]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Histórico de Participações</CardTitle>
            <CardDescription>{volunteerName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhuma participação registrada</div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => {
                  const w = workshopMap.get(p.workshop_id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.date ? new Date(p.date).toLocaleDateString("pt-BR") : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{w?.name || p.workshop_id}</span>
                          {w && (
                            <Badge variant={w.is_active ? "default" : "secondary"}>
                              {w.is_active ? "Ativa" : "Inativa"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{p.role || '-'}</TableCell>
                      <TableCell>{p.hours ?? '-'}</TableCell>
                      <TableCell className="max-w-[400px] truncate" title={p.notes || undefined}>{p.notes || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VolunteerHistory;
