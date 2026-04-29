"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Ban, Download, Eye, MoreHorizontal, Package, Search, ShieldCheck, UserCog } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { allTenants } from "@/lib/mock-data"
import { formatBRL, formatDateBR } from "@/lib/format"
import { toast } from "sonner"

const statusVariant: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  trial: { label: "Trial", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  suspended: { label: "Suspenso", className: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  churned: { label: "Cancelado", className: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
}

const planVariant: Record<string, string> = {
  starter: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
}

export default function AdminTenantsPage() {
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    const now = Date.now()
    return allTenants.filter((t) => {
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()) ||
        t.address.toLowerCase().includes(search.toLowerCase())
      const matchPlan = planFilter === "all" || t.plan === planFilter
      const matchStatus = statusFilter === "all" || t.status === statusFilter
      const created = new Date(t.created_at).getTime()
      const days = (now - created) / (1000 * 60 * 60 * 24)
      const matchDate =
        dateFilter === "all" ||
        (dateFilter === "7d" && days <= 7) ||
        (dateFilter === "30d" && days <= 30) ||
        (dateFilter === "90d" && days <= 90) ||
        (dateFilter === "year" && days <= 365)
      return matchSearch && matchPlan && matchStatus && matchDate
    })
  }, [search, planFilter, statusFilter, dateFilter])

  const handleAction = (action: string, name: string) => {
    toast.success(`${action}: ${name}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        title="Barbearias"
        description={`${allTenants.length} tenants cadastrados na plataforma`}
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Search className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Buscar por nome, slug, endereço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
                <SelectItem value="churned">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Data de cadastro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer data</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </p>
            {(search || planFilter !== "all" || statusFilter !== "all" || dateFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setPlanFilter("all")
                  setStatusFilter("all")
                  setDateFilter("all")
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barbearia</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                      {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">/{t.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                  {t.address}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize ${planVariant[t.plan]}`}>
                    {t.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusVariant[t.status]?.className}>
                    {statusVariant[t.status]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{formatBRL(t.mrr)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDateBR(t.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Ações">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/tenants/${t.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Impersonando", t.name)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Impersonar
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Package className="mr-2 h-4 w-4" />
                          Mudar plano
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => handleAction("Plano alterado para Starter", t.name)}>
                            Starter — R$ 49
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Plano alterado para Pro", t.name)}>
                            Pro — R$ 99
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Plano alterado para Premium", t.name)}>
                            Premium — R$ 199
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      {t.status === "suspended" ? (
                        <DropdownMenuItem onClick={() => handleAction("Tenant reativado", t.name)}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Reativar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleAction("Tenant suspenso", t.name)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspender
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  Nenhuma barbearia encontrada com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
