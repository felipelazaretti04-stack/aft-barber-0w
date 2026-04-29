"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Download, Info, Search, ShieldAlert } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { allTenants, auditLogs as baseLogs } from "@/lib/mock-data"
import { formatDateTimeBR } from "@/lib/format"
import type { AuditLog } from "@/lib/types"

type Severity = "info" | "warning" | "critical"

interface LogWithSeverity extends AuditLog {
  severity: Severity
}

function inferSeverity(action: string): Severity {
  if (action.includes("suspended") || action.includes("churned") || action.includes("deleted")) return "critical"
  if (action.includes("cancelled") || action.includes("refund") || action.includes("downgraded")) return "warning"
  return "info"
}

const enrichedLogs: LogWithSeverity[] = [
  ...baseLogs,
  {
    id: "log_9",
    tenant_id: "tenant_3",
    tenant_name: "Modern Cuts",
    user_name: "Lucas Andrade",
    action: "service.deleted",
    entity: "Corte Infantil",
    created_at: "2026-04-27T15:42:00Z",
    ip: "177.18.99.41",
  },
  {
    id: "log_10",
    tenant_id: "tenant_4",
    tenant_name: "Premium Barber",
    user_name: "Roberto Pinto",
    action: "client.refund",
    entity: "R$ 80,00 — Carlos Mendes",
    created_at: "2026-04-27T11:18:00Z",
    ip: "200.10.15.92",
  },
  {
    id: "log_11",
    tenant_id: "tenant_2",
    tenant_name: "Barbearia Vintage",
    user_name: "Marcos Silva",
    action: "team.member_added",
    entity: "ana@vintage.com (recepção)",
    created_at: "2026-04-27T09:30:00Z",
    ip: "189.20.45.78",
  },
  {
    id: "log_12",
    tenant_id: "tenant_1",
    tenant_name: "Barbearia do Tião",
    user_name: "Sebastião Oliveira",
    action: "promotion.activated",
    entity: "Happy Hour Quinta",
    created_at: "2026-04-26T14:00:00Z",
    ip: "201.45.123.10",
  },
  {
    id: "log_13",
    tenant_id: "tenant_5",
    tenant_name: "Old School Barber",
    user_name: "system",
    action: "payment.failed",
    entity: "Cartão recusado — inv_087",
    created_at: "2026-04-26T03:15:00Z",
    ip: "10.0.0.1",
  },
].map((l) => ({ ...l, severity: inferSeverity(l.action) })) as LogWithSeverity[]

const severityVariant: Record<Severity, { label: string; className: string; icon: typeof Info }> = {
  info: {
    label: "Info",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    icon: Info,
  },
  warning: {
    label: "Aviso",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
  },
  critical: {
    label: "Crítico",
    className: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
    icon: ShieldAlert,
  },
}

const uniqueActions = Array.from(new Set(enrichedLogs.map((l) => l.action))).sort()
const uniqueUsers = Array.from(new Set(enrichedLogs.map((l) => l.user_name))).sort()

export default function AdminLogsPage() {
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [tenantFilter, setTenantFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filtered = useMemo(() => {
    const now = Date.now()
    return enrichedLogs
      .filter((log) => {
        const matchSearch =
          !search ||
          log.entity.toLowerCase().includes(search.toLowerCase()) ||
          log.action.toLowerCase().includes(search.toLowerCase()) ||
          log.user_name.toLowerCase().includes(search.toLowerCase()) ||
          log.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
          log.ip.includes(search)
        const matchAction = actionFilter === "all" || log.action === actionFilter
        const matchUser = userFilter === "all" || log.user_name === userFilter
        const matchTenant = tenantFilter === "all" || log.tenant_id === tenantFilter
        const matchSeverity = severityFilter === "all" || log.severity === severityFilter
        const created = new Date(log.created_at).getTime()
        const hours = (now - created) / (1000 * 60 * 60)
        const matchDate =
          dateFilter === "all" ||
          (dateFilter === "1h" && hours <= 1) ||
          (dateFilter === "24h" && hours <= 24) ||
          (dateFilter === "7d" && hours <= 24 * 7) ||
          (dateFilter === "30d" && hours <= 24 * 30)
        return matchSearch && matchAction && matchUser && matchTenant && matchSeverity && matchDate
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [search, actionFilter, userFilter, tenantFilter, severityFilter, dateFilter])

  const counts = useMemo(
    () => ({
      info: filtered.filter((l) => l.severity === "info").length,
      warning: filtered.filter((l) => l.severity === "warning").length,
      critical: filtered.filter((l) => l.severity === "critical").length,
    }),
    [filtered],
  )

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        title="Logs de auditoria"
        description="Trilha completa de ações executadas em todos os tenants"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar JSON
        </Button>
      </PageHeader>

      {/* Severity counters */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-blue-500/15 flex items-center justify-center">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Eventos informativos</p>
              <p className="text-2xl font-semibold">{counts.info}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avisos</p>
              <p className="text-2xl font-semibold">{counts.warning}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-red-500/15 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Eventos críticos</p>
              <p className="text-2xl font-semibold">{counts.critical}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="lg:col-span-3 xl:col-span-2">
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Busca livre: ação, entidade, IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {uniqueUsers.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tenants</SelectItem>
                {allTenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as severidades</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer data</SelectItem>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
            </p>
            {(search ||
              actionFilter !== "all" ||
              userFilter !== "all" ||
              tenantFilter !== "all" ||
              severityFilter !== "all" ||
              dateFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setActionFilter("all")
                  setUserFilter("all")
                  setTenantFilter("all")
                  setSeverityFilter("all")
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
              <TableHead>Data/Hora</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead className="text-right">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => {
              const sev = severityVariant[log.severity]
              const Icon = sev.icon
              return (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateTimeBR(log.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1 ${sev.className}`}>
                      <Icon className="h-3 w-3" />
                      {sev.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.tenant_name}</TableCell>
                  <TableCell className="text-sm">{log.user_name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{log.action}</code>
                  </TableCell>
                  <TableCell className="text-sm max-w-[260px] truncate">{log.entity}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {log.ip}
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  Nenhum log encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
