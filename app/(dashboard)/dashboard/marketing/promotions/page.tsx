"use client"

import { useState } from "react"
import { Plus, Zap, Clock, Tag, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { promotions as initial } from "@/lib/mock-data-extra"
import { services } from "@/lib/mock-data"
import type { PromotionType } from "@/lib/types"
import { formatDateTimeBR } from "@/lib/format"

const typeMeta: Record<PromotionType, { label: string; icon: typeof Zap; color: string }> = {
  flash: { label: "Venda Rápida", icon: Zap, color: "bg-amber-500/10 text-amber-500" },
  happy_hour: { label: "Happy Hour", icon: Clock, color: "bg-emerald-500/10 text-emerald-500" },
  last_minute: { label: "Última Hora", icon: Tag, color: "bg-rose-500/10 text-rose-500" },
}

export default function PromotionsPage() {
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(false)

  const toggle = (id: string) => setItems((c) => c.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Promoções" description="Crie ofertas-relâmpago para encher horários vazios.">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova promoção</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(typeMeta) as PromotionType[]).map((t) => {
          const meta = typeMeta[t]
          const Icon = meta.icon
          const count = items.filter((p) => p.type === t && p.active).length
          return (
            <Card key={t}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-md ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{meta.label}</p>
                    <p className="text-sm text-muted-foreground">{count} ativa(s)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoção</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => {
                const meta = typeMeta[p.type]
                const Icon = meta.icon
                const svcs = services.filter((s) => p.service_ids.includes(s.id))
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </TableCell>
                    <TableCell><Badge variant="default">-{p.discount_pct}%</Badge></TableCell>
                    <TableCell className="text-xs">
                      {formatDateTimeBR(p.starts_at)} <br />
                      até {formatDateTimeBR(p.ends_at)}
                    </TableCell>
                    <TableCell className="text-sm">{svcs.length} serviço(s)</TableCell>
                    <TableCell>{p.uses}</TableCell>
                    <TableCell>
                      <Switch checked={p.active} onCheckedChange={() => toggle(p.id)} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nova promoção</DialogTitle>
            <DialogDescription>Configure uma oferta especial.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <Input placeholder="Ex: Happy Hour Quinta-feira" />
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select defaultValue="happy_hour">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flash">Venda Rápida</SelectItem>
                  <SelectItem value="happy_hour">Happy Hour (recorrente)</SelectItem>
                  <SelectItem value="last_minute">Última Hora (slots vazios)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Início</FieldLabel>
                <Input type="datetime-local" />
              </Field>
              <Field>
                <FieldLabel>Fim</FieldLabel>
                <Input type="datetime-local" />
              </Field>
            </div>
            <Field>
              <FieldLabel>Desconto (%)</FieldLabel>
              <Input type="number" defaultValue={20} />
            </Field>
            <FieldSet>
              <FieldLegend>Serviços aplicáveis</FieldLegend>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {services.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <Checkbox /> {s.name}
                  </label>
                ))}
              </div>
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => setOpen(false)}>Criar promoção</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
