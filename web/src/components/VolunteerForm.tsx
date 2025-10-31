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

const volunteerSchema = z.object({
  full_name: z.string().trim().nonempty({ message: "Nome completo é obrigatório" }).max(100),
  email: z.string().trim().email({ message: "Email inválido" }).max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  cpf: z.string().trim().max(14).optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  entry_date: z.string().nonempty({ message: "Data de entrada é obrigatória" }),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),
  zip_code: z.string().trim().max(10).optional().or(z.literal("")),
  emergency_contact: z.string().trim().max(100).optional().or(z.literal("")),
  emergency_phone: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

interface VolunteerFormProps {
  volunteer?: any;
  onClose: () => void;
}

const VolunteerForm = ({ volunteer, onClose }: VolunteerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    birth_date: "",
    entry_date: new Date().toISOString().split("T")[0],
    exit_date: "",
    is_active: true,
    address: "",
    city: "",
    state: "",
    zip_code: "",
    emergency_contact: "",
    emergency_phone: "",
    notes: "",
  });

  useEffect(() => {
    if (volunteer) {
      setFormData({
        full_name: volunteer.full_name || "",
        email: volunteer.email || "",
        phone: volunteer.phone || "",
        cpf: volunteer.cpf || "",
        birth_date: volunteer.birth_date || "",
        entry_date: volunteer.entry_date || "",
        exit_date: volunteer.exit_date || "",
        is_active: volunteer.is_active ?? true,
        address: volunteer.address || "",
        city: volunteer.city || "",
        state: volunteer.state || "",
        zip_code: volunteer.zip_code || "",
        emergency_contact: volunteer.emergency_contact || "",
        emergency_phone: volunteer.emergency_phone || "",
        notes: volunteer.notes || "",
      });
    }
  }, [volunteer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = volunteerSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      const dataToSave = {
        ...formData,
        email: formData.email || null,
        phone: formData.phone || null,
        cpf: formData.cpf || null,
        birth_date: formData.birth_date || null,
        exit_date: formData.exit_date || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
        notes: formData.notes || null,
      };

      if (volunteer) {
        await apiClient.put(`/volunteers/${volunteer.id}`, dataToSave);
        toast.success("Voluntário atualizado com sucesso!");
      } else {
        await apiClient.post(`/volunteers`, dataToSave);
        toast.success("Voluntário cadastrado com sucesso!");
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar voluntário");
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
            <CardTitle>{volunteer ? "Editar Voluntário" : "Novo Voluntário"}</CardTitle>
            <CardDescription>Preencha os dados do voluntário</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange("birth_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_date">Data de Entrada *</Label>
              <Input
                id="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={(e) => handleChange("entry_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit_date">Data de Saída</Label>
              <Input
                id="exit_date"
                type="date"
                value={formData.exit_date}
                onChange={(e) => handleChange("exit_date", e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Voluntário Ativo</Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Endereço</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleChange("zip_code", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contato de Emergência</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Nome</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => handleChange("emergency_contact", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Telefone</Label>
                <Input
                  id="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={(e) => handleChange("emergency_phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={4}
            />
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

export default VolunteerForm;
