"use client"

import { useState } from "react"
import { Plus, Mail, MessageSquare, MessageCircle, MoreHorizontal, Send, Pencil, Copy, Trash2, Search } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend, FieldDescription } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { campaigns } from "@/lib/mock-data-extra"
import type { Campaign, CampaignChannel } from "@/lib/types"
import { formatDateTime } from "@/lib/format"

const channelMeta: Record<CampaignChannel, { label: string; icon: typeof Mail; color: string }> = {
  email: { label: "E-mail", icon: Mail, color: "text-blue-500" },
  sms: { label: "SMS", icon: MessageSquare, color: "text-orange-500" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-emerald-500" },
}

const statusMeta = {
  draft: { label: "Rascunho", variant: "outline" as const },
  scheduled: { label: "Agendada", variant: "secondary" as const },
  sent: { label: "Enviada", variant: "default" as const },
}

export default function CampaignsPage() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | Campaign["status"]>("all")

  const filtered = campaigns.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campanhas"
        description="Envie mensagens segmentadas para grupos de clientes."
      >
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova campanha
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Enviadas</p><p className="text-2xl font-bold">{campaigns.filter((c) => c.status === "sent").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Agendadas</p><p className="text-2xl font-bold">{campaigns.filter((c) => c.status === "scheduled").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Taxa abertura média</p><p className="text-2xl font-bold">62%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Mensagens enviadas</p><p className="text-2xl font-bold">485</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-4 p-4 border-b">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="draft">Rascunho</TabsTrigger>
                <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
                <TabsTrigger value="sent">Enviadas</TabsTrigger>
              </TabsList>
            </Tabs>
            <InputGroup className="max-w-xs">
              <InputGroupAddon><Search className="h-4 w-4" /></InputGroupAddon>
              <InputGroupInput placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Audiência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Métricas</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const cm = channelMeta[c.channel]
                const Icon = cm.icon
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${cm.color}`} />
                        {cm.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{c.audience}</p>
                        <p className="text-xs text-muted-foreground">{c.audience_count} contatos</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={statusMeta[c.status].variant}>{statusMeta[c.status].label}</Badge></TableCell>
                    <TableCell>
                      {c.open_rate ? (
                        <div className="text-sm">
                          <p>{Math.round(c.open_rate * 100)}% abertura</p>
                          <p className="text-xs text-muted-foreground">{Math.round((c.click_rate ?? 0) * 100)}% cliques</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.sent_at ? formatDateTime(c.sent_at) : c.scheduled_at ? formatDateTime(c.scheduled_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicar</DropdownMenuItem>
                          <DropdownMenuItem><Send className="h-4 w-4 mr-2" />Enviar agora</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova campanha</DialogTitle>
            <DialogDescription>Envie uma mensagem segmentada para seus clientes.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cname">Nome interno</FieldLabel>
              <Input id="cname" placeholder="Ex: Promoção de Outono" />
            </Field>
            <FieldSet>
              <FieldLegend>Canal de envio</FieldLegend>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(["whatsapp", "sms", "email"] as CampaignChannel[]).map((ch) => {
                  const meta = channelMeta[ch]
                  const Icon = meta.icon
                  return (
                    <button
                      key={ch}
                      type="button"
                      className="flex flex-col items-center gap-2 rounded-md border p-3 hover:bg-accent transition-colors"
                    >
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                      <span className="text-sm">{meta.label}</span>
                    </button>
                  )
                })}
              </div>
            </FieldSet>
            <Field>
              <FieldLabel>Audiência</FieldLabel>
              <Select defaultValue="vip">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes (312)</SelectItem>
                  <SelectItem value="vip">Clientes VIP (45)</SelectItem>
                  <SelectItem value="inactive">Inativos há 60+ dias (28)</SelectItem>
                  <SelectItem value="birthday">Aniversariantes do mês (12)</SelectItem>
                  <SelectItem value="new">Novos clientes (18)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="msg">Mensagem</FieldLabel>
              <Textarea id="msg" rows={5} placeholder="Olá {nome}! Aproveite..." />
              <FieldDescription>Use variáveis: {"{nome}"}, {"{barbeiro}"}, {"{link}"}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Data de envio</FieldLabel>
              <div className="flex gap-2">
                <Input type="date" />
                <Input type="time" />
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Salvar como rascunho</Button>
            <Button onClick={() => setOpen(false)}><Send className="h-4 w-4 mr-2" />Agendar envio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
