"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Bell,
  Building,
  Calendar,
  Check,
  Clock,
  Copy,
  CreditCard,
  Edit2,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Lock,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { currentTenant } from "@/lib/mock-data"
import {
  bookingRules,
  customForms,
  notificationTemplates,
  rolePermissions,
  safetyRules,
  teamMembers,
} from "@/lib/mock-data-extra"
import type { BookingRules, CustomForm, NotificationTemplate, SafetyRule, TeamMember, UserRole } from "@/lib/types"

const settingsTabs = [
  { id: "barbershop", label: "Barbearia", icon: Building },
  { id: "hours", label: "Horário de Funcionamento", icon: Clock },
  { id: "booking-rules", label: "Regras de Agendamento", icon: Calendar },
  { id: "payments", label: "Pagamentos", icon: CreditCard },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "booking-public", label: "Booking Público", icon: Globe },
  { id: "integrations", label: "Integrações", icon: Link2 },
  { id: "team", label: "Equipe", icon: Users },
  { id: "safety", label: "Saúde e Segurança", icon: Shield },
  { id: "forms", label: "Formulários Personalizados", icon: FileText },
]

const integrations = [
  { id: "google-calendar", name: "Google Calendar", description: "Sincronize sua agenda", icon: "/google-calendar.svg", connected: true },
  { id: "instagram", name: "Instagram", description: "Exiba fotos e stories", icon: "/instagram.svg", connected: false },
  { id: "facebook", name: "Facebook", description: "Agendamento via Facebook", icon: "/facebook.svg", connected: false },
  { id: "google-reserve", name: "Reservar com Google", description: "Apareça na busca do Google", icon: "/google-reserve.svg", connected: true },
  { id: "whatsapp", name: "WhatsApp Business", description: "Notificações automáticas", icon: "/whatsapp.svg", connected: true },
]

const days = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

const defaultSchedule = {
  monday: { open: true, start: "09:00", end: "20:00", lunch_start: "12:00", lunch_end: "13:00" },
  tuesday: { open: true, start: "09:00", end: "20:00", lunch_start: "12:00", lunch_end: "13:00" },
  wednesday: { open: true, start: "09:00", end: "20:00", lunch_start: "12:00", lunch_end: "13:00" },
  thursday: { open: true, start: "09:00", end: "20:00", lunch_start: "12:00", lunch_end: "13:00" },
  friday: { open: true, start: "09:00", end: "21:00", lunch_start: "12:00", lunch_end: "13:00" },
  saturday: { open: true, start: "09:00", end: "18:00" },
  sunday: { open: false, start: "09:00", end: "18:00" },
}

const roleLabels: Record<UserRole, string> = {
  owner: "Proprietário",
  manager: "Gerente",
  senior_barber: "Barbeiro Sênior",
  barber: "Barbeiro",
  reception: "Recepção",
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("barbershop")
  const [schedule, setSchedule] = useState(defaultSchedule)
  const [rules, setRules] = useState<BookingRules>(bookingRules)
  const [templates, setTemplates] = useState<NotificationTemplate[]>(notificationTemplates)
  const [team, setTeam] = useState<TeamMember[]>(teamMembers)
  const [safety, setSafety] = useState<SafetyRule[]>(safetyRules)
  const [forms, setForms] = useState<CustomForm[]>(customForms)
  const [paymentMethods, setPaymentMethods] = useState({
    dinheiro: true,
    pix: true,
    debito: true,
    credito: true,
  })
  const [pixKey, setPixKey] = useState("barbearia@tiao.com")

  // Dialogs
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null)

  const bookingUrl = `https://aftbarber.com/booking/${currentTenant.slug}`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado para a área de transferência")
  }

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso")
  }

  const toggleIntegration = (id: string) => {
    toast.success("Integração atualizada")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Configurações" description="Gerencie todas as configurações da sua barbearia" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs - vertical on desktop */}
        <div className="lg:w-64 shrink-0">
          <ScrollArea className="lg:h-[calc(100vh-200px)]">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors text-left w-full",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </ScrollArea>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tab: Barbearia */}
          {activeTab === "barbershop" && (
            <Card>
              <CardHeader>
                <CardTitle>Informações da Barbearia</CardTitle>
                <CardDescription>Dados que aparecem no seu perfil público</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="relative h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden group cursor-pointer">
                      <Image src={currentTenant.logo_url || "/placeholder.svg"} alt="Logo" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Capa</Label>
                    <div className="relative h-24 w-full max-w-xs rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden group cursor-pointer">
                      <Image src={currentTenant.cover_url || "/placeholder.svg"} alt="Capa" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <FieldGroup>
                  <Field>
                    <FieldLabel>Nome da Barbearia</FieldLabel>
                    <Input defaultValue={currentTenant.name} />
                  </Field>
                  <Field>
                    <FieldLabel>CNPJ</FieldLabel>
                    <Input defaultValue="12.345.678/0001-90" placeholder="00.000.000/0001-00" />
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel>Endereço</FieldLabel>
                  <Input defaultValue={currentTenant.address} />
                </Field>

                <FieldGroup>
                  <Field>
                    <FieldLabel>Telefone</FieldLabel>
                    <Input defaultValue={currentTenant.phone} />
                  </Field>
                  <Field>
                    <FieldLabel>Instagram</FieldLabel>
                    <Input defaultValue={currentTenant.instagram} placeholder="@suabarbearia" />
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel>Descrição</FieldLabel>
                  <Textarea defaultValue={currentTenant.description} rows={3} />
                </Field>

                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Horário de Funcionamento */}
          {activeTab === "hours" && (
            <Card>
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>Configure os dias e horários de atendimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {days.map((day) => {
                  const daySchedule = schedule[day.key as keyof typeof schedule]
                  return (
                    <div key={day.key} className="flex flex-wrap items-center gap-4 p-3 rounded-lg border">
                      <div className="flex items-center gap-3 w-32">
                        <Switch
                          checked={daySchedule.open}
                          onCheckedChange={(checked) =>
                            setSchedule((prev) => ({
                              ...prev,
                              [day.key]: { ...prev[day.key as keyof typeof prev], open: checked },
                            }))
                          }
                        />
                        <span className={cn("text-sm font-medium", !daySchedule.open && "text-muted-foreground")}>
                          {day.label}
                        </span>
                      </div>
                      {daySchedule.open ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={daySchedule.start}
                              onChange={(e) =>
                                setSchedule((prev) => ({
                                  ...prev,
                                  [day.key]: { ...prev[day.key as keyof typeof prev], start: e.target.value },
                                }))
                              }
                              className="w-28"
                            />
                            <span className="text-muted-foreground">às</span>
                            <Input
                              type="time"
                              value={daySchedule.end}
                              onChange={(e) =>
                                setSchedule((prev) => ({
                                  ...prev,
                                  [day.key]: { ...prev[day.key as keyof typeof prev], end: e.target.value },
                                }))
                              }
                              className="w-28"
                            />
                          </div>
                          {"lunch_start" in daySchedule && (daySchedule as { lunch_start?: string }).lunch_start && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Intervalo:</span>
                              <Input
                                type="time"
                                value={(daySchedule as { lunch_start?: string }).lunch_start ?? ""}
                                onChange={(e) =>
                                  setSchedule((prev) => ({
                                    ...prev,
                                    [day.key]: { ...prev[day.key as keyof typeof prev], lunch_start: e.target.value },
                                  }))
                                }
                                className="w-24"
                              />
                              <span>-</span>
                              <Input
                                type="time"
                                value={(daySchedule as { lunch_end?: string }).lunch_end ?? ""}
                                onChange={(e) =>
                                  setSchedule((prev) => ({
                                    ...prev,
                                    [day.key]: { ...prev[day.key as keyof typeof prev], lunch_end: e.target.value },
                                  }))
                                }
                                className="w-24"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Fechado</span>
                      )}
                    </div>
                  )
                })}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar horários
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Regras de Agendamento */}
          {activeTab === "booking-rules" && (
            <Card>
              <CardHeader>
                <CardTitle>Regras de Agendamento</CardTitle>
                <CardDescription>Configure antecedências e políticas de cancelamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <Label>Antecedência mínima para agendar</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Cliente precisa agendar com pelo menos {rules.min_advance_minutes} minutos de antecedência
                    </p>
                    <Slider
                      value={[rules.min_advance_minutes]}
                      onValueChange={([v]) => setRules((prev) => ({ ...prev, min_advance_minutes: v }))}
                      min={0}
                      max={480}
                      step={15}
                      className="max-w-md"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground max-w-md mt-1">
                      <span>Imediato</span>
                      <span>{rules.min_advance_minutes} min</span>
                      <span>8h</span>
                    </div>
                  </div>

                  <div>
                    <Label>Antecedência máxima para agendar</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Cliente pode agendar até {rules.max_advance_days} dias no futuro
                    </p>
                    <Slider
                      value={[rules.max_advance_days]}
                      onValueChange={([v]) => setRules((prev) => ({ ...prev, max_advance_days: v }))}
                      min={7}
                      max={180}
                      step={7}
                      className="max-w-md"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground max-w-md mt-1">
                      <span>7 dias</span>
                      <span>{rules.max_advance_days} dias</span>
                      <span>180 dias</span>
                    </div>
                  </div>

                  <div>
                    <Label>Antecedência mínima para cancelar</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Cliente pode cancelar até {rules.cancel_min_advance_hours}h antes do horário
                    </p>
                    <Slider
                      value={[rules.cancel_min_advance_hours]}
                      onValueChange={([v]) => setRules((prev) => ({ ...prev, cancel_min_advance_hours: v }))}
                      min={1}
                      max={48}
                      step={1}
                      className="max-w-md"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground max-w-md mt-1">
                      <span>1h</span>
                      <span>{rules.cancel_min_advance_hours}h</span>
                      <span>48h</span>
                    </div>
                  </div>

                  <div>
                    <Label>Antecedência mínima para reagendar</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Cliente pode reagendar até {rules.reschedule_min_advance_hours}h antes
                    </p>
                    <Slider
                      value={[rules.reschedule_min_advance_hours]}
                      onValueChange={([v]) => setRules((prev) => ({ ...prev, reschedule_min_advance_hours: v }))}
                      min={1}
                      max={24}
                      step={1}
                      className="max-w-md"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground max-w-md mt-1">
                      <span>1h</span>
                      <span>{rules.reschedule_min_advance_hours}h</span>
                      <span>24h</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Políticas</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Exigir confirmação</p>
                      <p className="text-sm text-muted-foreground">Cliente precisa confirmar agendamento 24h antes</p>
                    </div>
                    <Switch
                      checked={rules.require_confirmation}
                      onCheckedChange={(checked) => setRules((prev) => ({ ...prev, require_confirmation: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Exigir cartão cadastrado</p>
                      <p className="text-sm text-muted-foreground">Cliente precisa ter cartão para agendar</p>
                    </div>
                    <Switch
                      checked={rules.require_card}
                      onCheckedChange={(checked) => setRules((prev) => ({ ...prev, require_card: checked }))}
                    />
                  </div>
                  <div>
                    <Label>Taxa de no-show</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cobrar R$ {rules.no_show_fee} em caso de falta sem aviso
                    </p>
                    <div className="flex items-center gap-2 max-w-xs">
                      <span className="text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        value={rules.no_show_fee}
                        onChange={(e) => setRules((prev) => ({ ...prev, no_show_fee: Number(e.target.value) }))}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar regras
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Pagamentos */}
          {activeTab === "payments" && (
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos</CardTitle>
                <CardDescription>Configure os métodos de pagamento aceitos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Métodos aceitos</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries({ dinheiro: "Dinheiro", pix: "Pix", debito: "Débito", credito: "Crédito" }).map(
                      ([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                          <span className="font-medium">{label}</span>
                          <Switch
                            checked={paymentMethods[key as keyof typeof paymentMethods]}
                            onCheckedChange={(checked) =>
                              setPaymentMethods((prev) => ({ ...prev, [key]: checked }))
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Configuração Pix</h3>
                  <Field>
                    <FieldLabel>Chave Pix</FieldLabel>
                    <div className="flex gap-2">
                      <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="E-mail, CPF, CNPJ ou chave aleatória" />
                      <Button variant="outline" onClick={() => handleCopy(pixKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </Field>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar pagamentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Notificações */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure os templates de mensagens automáticas</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="whatsapp">
                  <TabsList className="mb-4">
                    <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                    <TabsTrigger value="email">E-mail</TabsTrigger>
                  </TabsList>

                  {["whatsapp", "sms", "email"].map((channel) => (
                    <TabsContent key={channel} value={channel} className="space-y-4">
                      {templates
                        .filter((t) => t.channel === channel)
                        .map((t) => (
                          <div key={t.id} className="p-4 rounded-lg border space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium capitalize">{t.event.replace(/_/g, " ")}</p>
                                {t.subject && <p className="text-sm text-muted-foreground">Assunto: {t.subject}</p>}
                              </div>
                              <Switch
                                checked={t.active}
                                onCheckedChange={(checked) =>
                                  setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, active: checked } : x)))
                                }
                              />
                            </div>
                            <Textarea
                              value={t.body}
                              onChange={(e) =>
                                setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, body: e.target.value } : x)))
                              }
                              rows={3}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Variáveis: {"{nome}"}, {"{data}"}, {"{hora}"}, {"{barbeiro}"}, {"{endereco}"}, {"{link}"}
                            </p>
                          </div>
                        ))}
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Booking Público */}
          {activeTab === "booking-public" && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Público</CardTitle>
                <CardDescription>Compartilhe sua página de agendamento online</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Field>
                  <FieldLabel>Link público</FieldLabel>
                  <div className="flex gap-2">
                    <Input value={bookingUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" onClick={() => handleCopy(bookingUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </Field>

                <div className="space-y-2">
                  <Label>QR Code</Label>
                  <div className="w-48 h-48 bg-muted rounded-lg border flex items-center justify-center">
                    <div className="w-40 h-40 bg-white p-2 rounded">
                      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTEgMWg3djdIMXpNMyAzaDN2M0gzek0xIDEzaDd2N0gxek0zIDE1aDN2M0gzek0xMyAxaDd2N2gtN3pNMTUgM2gzdjNoLTN6TTExIDExaDJ2MmgtMnpNMTMgMTFoMnYyaC0yek0xNSAxMWgydjJoLTJ6TTExIDEzaDJ2MmgtMnpNMTUgMTNoMnYyaC0yek0xNyAxM2gydjJoLTJ6TTExIDE1aDJ2MmgtMnpNMTcgMTVoMnYyaC0yek0xMSAxN2gydjJoLTJ6TTEzIDE3aDJ2MmgtMnpNMTUgMTdoMnYyaC0yek0xNyAxN2gydjJoLTJ6Ii8+PC9zdmc+')] bg-contain bg-center bg-no-repeat" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Baixar QR Code
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Widget para seu site</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione o código abaixo no HTML do seu site para incorporar o botão de agendamento.
                  </p>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-x-auto">
{`<script src="https://aftbarber.com/widget.js"></script>
<div data-aft-booking="${currentTenant.slug}"></div>`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(`<script src="https://aftbarber.com/widget.js"></script>\n<div data-aft-booking="${currentTenant.slug}"></div>`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Integrações */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>Conecte sua barbearia a outras ferramentas</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        {integration.id === "google-calendar" && "📅"}
                        {integration.id === "instagram" && "📸"}
                        {integration.id === "facebook" && "👤"}
                        {integration.id === "google-reserve" && "🔍"}
                        {integration.id === "whatsapp" && "💬"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{integration.description}</p>
                      </div>
                      {integration.connected ? (
                        <Badge variant="secondary" className="shrink-0">
                          <Check className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => toggleIntegration(integration.id)}>
                          Conectar
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab: Equipe */}
          {activeTab === "team" && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Equipe</CardTitle>
                  <CardDescription>Gerencie usuários e permissões</CardDescription>
                </div>
                <Button onClick={() => { setEditingMember(null); setTeamDialogOpen(true) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Convidar
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último acesso</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{roleLabels[member.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.active ? "default" : "secondary"}>
                            {member.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(member.last_login).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingMember(member); setTeamDialogOpen(true) }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Níveis de acesso</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(rolePermissions).map(([key, role]) => (
                      <div key={key} className="p-3 rounded-lg border">
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Saúde e Segurança */}
          {activeTab === "safety" && (
            <Card>
              <CardHeader>
                <CardTitle>Saúde e Segurança</CardTitle>
                <CardDescription>Medidas exibidas na página de agendamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {safety.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Input
                        value={rule.title}
                        onChange={(e) =>
                          setSafety((prev) =>
                            prev.map((r) => (r.id === rule.id ? { ...r, title: e.target.value } : r))
                          )
                        }
                        className="font-medium mb-1"
                      />
                      <Textarea
                        value={rule.description}
                        onChange={(e) =>
                          setSafety((prev) =>
                            prev.map((r) => (r.id === rule.id ? { ...r, description: e.target.value } : r))
                          )
                        }
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={(checked) =>
                          setSafety((prev) =>
                            prev.map((r) => (r.id === rule.id ? { ...r, active: checked } : r))
                          )
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setSafety((prev) => prev.filter((r) => r.id !== rule.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() =>
                    setSafety((prev) => [
                      ...prev,
                      { id: `sr_${Date.now()}`, title: "Nova medida", description: "Descrição da medida", icon: "shield", active: true },
                    ])
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar medida
                </Button>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar medidas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Formulários Personalizados */}
          {activeTab === "forms" && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Formulários Personalizados</CardTitle>
                  <CardDescription>Crie formulários para coletar informações dos clientes</CardDescription>
                </div>
                <Button onClick={() => { setEditingForm(null); setFormDialogOpen(true) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo formulário
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forms.map((form) => (
                    <div key={form.id} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{form.name}</p>
                        <p className="text-sm text-muted-foreground">{form.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{form.fields.length} campos</Badge>
                          {form.required && <Badge variant="secondary">Obrigatório</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={form.active}
                          onCheckedChange={(checked) =>
                            setForms((prev) => prev.map((f) => (f.id === form.id ? { ...f, active: checked } : f)))
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingForm(form); setFormDialogOpen(true) }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setForms((prev) => prev.filter((f) => f.id !== form.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Team Member Dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? "Editar membro" : "Convidar membro"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Atualize as informações do membro da equipe." : "Envie um convite por e-mail."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <Input defaultValue={editingMember?.name} placeholder="Nome completo" />
            </Field>
            <Field>
              <FieldLabel>E-mail</FieldLabel>
              <Input defaultValue={editingMember?.email} placeholder="email@exemplo.com" type="email" />
            </Field>
            <Field>
              <FieldLabel>Função</FieldLabel>
              <Select defaultValue={editingMember?.role || "barber"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { toast.success(editingMember ? "Membro atualizado" : "Convite enviado"); setTeamDialogOpen(false) }}>
              {editingMember ? "Salvar" : "Enviar convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingForm ? "Editar formulário" : "Novo formulário"}</DialogTitle>
            <DialogDescription>
              Crie campos personalizados para coletar informações dos clientes.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Nome do formulário</FieldLabel>
              <Input defaultValue={editingForm?.name} placeholder="Ex: Anamnese" />
            </Field>
            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <Textarea defaultValue={editingForm?.description} placeholder="Breve descrição" rows={2} />
            </Field>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="required" defaultChecked={editingForm?.required} />
                <Label htmlFor="required">Obrigatório</Label>
              </div>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { toast.success(editingForm ? "Formulário atualizado" : "Formulário criado"); setFormDialogOpen(false) }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
