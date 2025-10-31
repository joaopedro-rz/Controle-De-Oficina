import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/lib/api";

const workshopSchema = z.object({
  name: z.string().trim().nonempty({ message: "Nome da oficina é obrigatório" }).max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  schedule: z.string().trim().max(100).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
});

interface WorkshopFormProps {
  workshop?: any;
  onClose: () => void;
}

const WorkshopForm = ({ workshop, onClose }: WorkshopFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schedule: "",
    location: "",
    is_active: true,
  });

  useEffect(() => {
    if (workshop) {
      setFormData({
        name: workshop.name || "",
        description: workshop.description || "",
        schedule: workshop.schedule || "",
        location: workshop.location || "",
        is_active: workshop.is_active ?? true,
      });
    }
  }, [workshop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = workshopSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const dataToSave = {
        ...formData,
        description: formData.description || null,
        schedule: formData.schedule || null,
        location: formData.location || null,
      };

      if (workshop) {
        await apiClient.put(`/workshops/${workshop.id}`, dataToSave);
        toast.success("Oficina atualizada com sucesso!");
      } else {
        await apiClient.post(`/workshops`, dataToSave);
        toast.success("Oficina cadastrada com sucesso!");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar oficina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>{workshop ? "Editar Oficina" : "Nova Oficina"}</CardTitle>
            <CardDescription>Preencha os dados da oficina</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Oficina *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Horário</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => handleChange("schedule", e.target.value)}
                placeholder="Ex: Terças-feiras, 14h-16h"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Ex: Sala 203"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Oficina Ativa</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkshopForm;
