"use client"

import { useState } from "react"
import Link from "next/link"
import { Cake, FileUp, Plus, Search, Star, UserCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageHeader } from "@/components/dashboard/page-header"
import { ClientDialog } from "@/components/clients/client-dialog"
import { clients } from "@/lib/mock-data"
import { formatBRL, formatRelativeBR } from "@/lib/format"
import type { ClientTag } from "@/lib/types"

const tagConfig: Record<ClientTag, { label: string; className: string; icon?: React.ComponentType<{ className?: string }> }> = {
  vip:            { label: "VIP",           className: "bg-amber-100 text-amber-800 border-amber-200", icon: Star },
  inativo:        { label: "Inativo",       className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  novo:           { label: "Novo",          className: "bg-blue-100 text-blue-800 border-blue-200" },
  aniversariante: { label: "Aniversariante",className: "bg-pink-100 text-pink-800 border-pink-200", icon: Cake },
  blacklist:      { label: "Bloqueado",     className: "bg-red-100 text-red-800 border-red-200" },
  trusted:        { label: "Confiavel",     className: "bg-green-100 text-green-800 border-green-200" },
}

const filterTags: ClientTag[] = ["vip", "novo", "aniversariante", "inativo"]

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [activeTags, setActiveTags] = useState<ClientTag[]>([])
  const [open, setOpen] = useState(false)

  const filtered = clients.filter((c) => {
    if (search) {
      const q = search.toLowerCase()
      if (!c.name.toLowerCase().includes(q) && !c.phone.includes(q) && !c.email.toLowerCase().includes(q)) return false
    }
    if (activeTags.length > 0 && !activeTags.some((t) => c.tags.includes(t))) return false
    return true
  })

  const toggleTag = (t: ClientTag) =>
    setActiveTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Clientes" description="Gestão completa do seu CRM">
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" /> Importar CSV
        </Button>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </PageHeader>

      <div className="space-y-3">
        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <div className="flex flex-wrap gap-2">
          {filterTags.map((t) => {
            const cfg = tagConfig[t]
            const active = activeTags.includes(t)
            return (
              <Button
                key={t}
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => toggleTag(t)}
                className="rounded-full"
              >
                {cfg.label}
              </Button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><UserCircle className="h-6 w-6" /></EmptyMedia>
            <EmptyTitle>Nenhum cliente encontrado</EmptyTitle>
            <EmptyDescription>Cadastre seu primeiro cliente ou ajuste os filtros.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Telefone</TableHead>
                <TableHead className="hidden lg:table-cell">Última visita</TableHead>
                <TableHead className="hidden sm:table-cell">Visitas</TableHead>
                <TableHead className="hidden md:table-cell">Total gasto</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/dashboard/clients/${c.id}`} className="flex items-center gap-3 hover:underline">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={c.avatar_url || "/placeholder.svg"} alt={c.name} />
                        <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{c.phone}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{c.phone}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {c.last_visit_at ? formatRelativeBR(c.last_visit_at) : "Nunca"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell tabular-nums">{c.visit_count}</TableCell>
                  <TableCell className="hidden md:table-cell font-medium tabular-nums">{formatBRL(c.total_spent)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => {
                        const cfg = tagConfig[t]
                        const Icon = cfg.icon
                        return (
                          <Badge key={t} variant="outline" className={cfg.className}>
                            {Icon ? <Icon className="h-3 w-3 mr-1" /> : null}
                            {cfg.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ClientDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
