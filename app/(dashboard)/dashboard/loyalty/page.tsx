"use client"

import { useState } from "react"
import {
  Award,
  Check,
  CreditCard,
  Edit2,
  Gift,
  Package,
  Pause,
  Play,
  Plus,
  Settings,
  Star,
  Trash2,
  Trophy,
  Users,
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
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { clients, services } from "@/lib/mock-data"
import {
  giftcards,
  giftcardTemplates,
  loyaltyConfig,
  packageBalances,
  servicePackages,
  subscribers,
  subscriptions,
} from "@/lib/mock-data-extra"
import { formatBRL, formatDateBR } from "@/lib/format"
import type { GiftcardTemplate, LoyaltyConfig, ServicePackage, Subscription } from "@/lib/types"

// Mock points data
const clientPoints = clients.slice(0, 8).map((c, i) => ({
  client_id: c.id,
  client_name: c.name,
  avatar_url: c.avatar_url,
  points: [2450, 1890, 1520, 980, 720, 580, 420, 310][i] || 0,
  total_spent: c.total_spent,
}))

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState("giftcards")
  
  // Giftcards state
  const [giftcardsList, setGiftcardsList] = useState(giftcards)
  const [templatesList, setTemplatesList] = useState<GiftcardTemplate[]>(giftcardTemplates)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<GiftcardTemplate | null>(null)
  
  // Subscriptions state
  const [subscriptionsList, setSubscriptionsList] = useState<Subscription[]>(subscriptions)
  const [subscribersList, setSubscribersList] = useState(subscribers)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  
  // Packages state
  const [packagesList, setPackagesList] = useState<ServicePackage[]>(servicePackages)
  const [balancesList, setBalancesList] = useState(packageBalances)
  const [packageDialogOpen, setPackageDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null)
  
  // Points state
  const [pointsConfig, setPointsConfig] = useState<LoyaltyConfig>(loyaltyConfig)
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false)

  const totalGiftcardsValue = giftcardsList.reduce((s, g) => s + g.balance, 0)
  const activeSubscribers = subscribersList.filter((s) => s.status === "active").length
  const totalPackagesRemaining = balancesList.reduce((s, b) => s + b.remaining, 0)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Fidelização" description="Cartões-presente, assinaturas, pacotes e pontos" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="giftcards" className="gap-2">
            <Gift className="h-4 w-4" />
            Cartões-presente
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Assinaturas
          </TabsTrigger>
          <TabsTrigger value="packages" className="gap-2">
            <Package className="h-4 w-4" />
            Pacotes
          </TabsTrigger>
          <TabsTrigger value="points" className="gap-2">
            <Star className="h-4 w-4" />
            Pontos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Cartões-presente */}
        <TabsContent value="giftcards" className="mt-6 space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Templates de Cartão</CardTitle>
                <CardDescription>Configure os valores de cartões-presente disponíveis</CardDescription>
              </div>
              <Button onClick={() => { setEditingTemplate(null); setTemplateDialogOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {templatesList.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "relative rounded-lg border p-4 transition-all",
                      template.active ? "bg-card" : "bg-muted/50 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Gift className="h-8 w-8 text-primary" />
                      <Switch
                        checked={template.active}
                        onCheckedChange={(checked) =>
                          setTemplatesList((prev) =>
                            prev.map((t) => (t.id === template.id ? { ...t, active: checked } : t))
                          )
                        }
                      />
                    </div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-2xl font-bold text-primary">{formatBRL(template.amount)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => { setEditingTemplate(template); setTemplateDialogOpen(true) }}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cartões Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{giftcardsList.filter((g) => g.status === "active").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total Ativo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatBRL(totalGiftcardsValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resgatados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{giftcardsList.filter((g) => g.status === "redeemed").length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Giftcards Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas de Cartões-presente</CardTitle>
              <CardDescription>Histórico de cartões vendidos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftcardsList.map((gc) => (
                    <TableRow key={gc.id}>
                      <TableCell className="font-mono text-sm">{gc.code}</TableCell>
                      <TableCell>{gc.buyer_name}</TableCell>
                      <TableCell>{gc.recipient_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatBRL(gc.amount)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatBRL(gc.balance)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={gc.status === "active" ? "default" : gc.status === "redeemed" ? "secondary" : "destructive"}
                        >
                          {gc.status === "active" ? "Ativo" : gc.status === "redeemed" ? "Resgatado" : "Expirado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDateBR(gc.expires_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Assinaturas */}
        <TabsContent value="subscriptions" className="mt-6 space-y-6">
          {/* Plans */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Planos de Assinatura</CardTitle>
                <CardDescription>Configure planos mensais recorrentes</CardDescription>
              </div>
              <Button onClick={() => { setEditingSubscription(null); setSubscriptionDialogOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Plano
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subscriptionsList.map((sub) => (
                  <div
                    key={sub.id}
                    className={cn(
                      "relative rounded-lg border p-5 transition-all",
                      sub.active ? "bg-card" : "bg-muted/50 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <CreditCard className="h-8 w-8 text-primary" />
                      <Switch
                        checked={sub.active}
                        onCheckedChange={(checked) =>
                          setSubscriptionsList((prev) =>
                            prev.map((s) => (s.id === sub.id ? { ...s, active: checked } : s))
                          )
                        }
                      />
                    </div>
                    <p className="text-lg font-semibold">{sub.name}</p>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {formatBRL(sub.price_month)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {sub.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-success" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {sub.subscribers} assinantes
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingSubscription(sub); setSubscriptionDialogOpen(true) }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assinantes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activeSubscribers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita Recorrente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatBRL(subscribersList.filter((s) => s.status === "active")
                    .reduce((sum, s) => {
                      const sub = subscriptionsList.find((x) => x.id === s.subscription_id)
                      return sum + (sub?.price_month || 0)
                    }, 0))}
                  /mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pausados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{subscribersList.filter((s) => s.status === "paused").length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscribers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assinantes</CardTitle>
              <CardDescription>Lista de clientes com assinaturas ativas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Desde</TableHead>
                    <TableHead>Próx. cobrança</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribersList.map((sub) => {
                    const client = clients.find((c) => c.id === sub.client_id)
                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={client?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>{sub.client_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{sub.client_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{sub.subscription_name}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDateBR(sub.started_at)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDateBR(sub.next_charge)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={sub.status === "active" ? "default" : sub.status === "paused" ? "secondary" : "destructive"}
                          >
                            {sub.status === "active" ? "Ativo" : sub.status === "paused" ? "Pausado" : "Cancelado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            {sub.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pacotes */}
        <TabsContent value="packages" className="mt-6 space-y-6">
          {/* Packages */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Pacotes de Serviços</CardTitle>
                <CardDescription>Venda múltiplas sessões com desconto</CardDescription>
              </div>
              <Button onClick={() => { setEditingPackage(null); setPackageDialogOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pacote
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {packagesList.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      "relative rounded-lg border p-5 transition-all",
                      pkg.active ? "bg-card" : "bg-muted/50 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Package className="h-8 w-8 text-chart-2" />
                      <Switch
                        checked={pkg.active}
                        onCheckedChange={(checked) =>
                          setPackagesList((prev) =>
                            prev.map((p) => (p.id === pkg.id ? { ...p, active: checked } : p))
                          )
                        }
                      />
                    </div>
                    <p className="text-lg font-semibold">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground">{pkg.service_name}</p>
                    <p className="text-3xl font-bold text-chart-2 mt-2">{formatBRL(pkg.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      {pkg.total_sessions} sessões = {formatBRL(pkg.price / pkg.total_sessions)}/sessão
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Badge variant="secondary">{pkg.sold} vendidos</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingPackage(pkg); setPackageDialogOpen(true) }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pacotes Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{packagesList.reduce((s, p) => s + p.sold, 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sessões Restantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalPackagesRemaining}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita em Pacotes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatBRL(packagesList.reduce((s, p) => s + p.price * p.sold, 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Balances Table */}
          <Card>
            <CardHeader>
              <CardTitle>Saldos por Cliente</CardTitle>
              <CardDescription>Sessões restantes de cada cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pacote</TableHead>
                    <TableHead>Restante</TableHead>
                    <TableHead>Comprado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balancesList.map((balance) => {
                    const client = clients.find((c) => c.id === balance.client_id)
                    return (
                      <TableRow key={balance.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={client?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>{balance.client_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{balance.client_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{balance.package_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(balance.remaining / balance.total) * 100} className="w-20 h-2" />
                            <span className="text-sm tabular-nums">
                              {balance.remaining}/{balance.total}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDateBR(balance.bought_at)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pontos */}
        <TabsContent value="points" className="mt-6 space-y-6">
          {/* Config */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Programa de Pontos</CardTitle>
                <CardDescription>Configure a regra de acúmulo e recompensas</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ativo</span>
                <Switch
                  checked={pointsConfig.active}
                  onCheckedChange={(checked) => setPointsConfig((prev) => ({ ...prev, active: checked }))}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                <Award className="h-10 w-10 text-primary" />
                <div>
                  <p className="font-medium">Regra de acúmulo</p>
                  <p className="text-sm text-muted-foreground">
                    A cada <span className="font-semibold text-foreground">R$ 1,00</span> gasto, o cliente ganha{" "}
                    <span className="font-semibold text-foreground">{pointsConfig.points_per_real} ponto(s)</span>
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Settings className="h-3 w-3 mr-1" />
                  Configurar
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Recompensas</h3>
                  <Button size="sm" onClick={() => setRewardDialogOpen(true)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Nova Recompensa
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {pointsConfig.rewards.map((reward) => (
                    <div key={reward.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className="h-6 w-6 text-warning" />
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reward.type === "discount" ? `Desconto de ${formatBRL(reward.value)}` : "Serviço grátis"}
                      </p>
                      <Badge className="mt-2" variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        {reward.points} pontos
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes</CardTitle>
              <CardDescription>Ranking por pontos acumulados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientPoints.map((cp, index) => {
                    const client = clients.find((c) => c.id === cp.client_id)
                    return (
                      <TableRow key={cp.client_id}>
                        <TableCell>
                          <div
                            className={cn(
                              "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold",
                              index === 0 ? "bg-warning text-warning-foreground" : "bg-muted"
                            )}
                          >
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={cp.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>{cp.client_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{cp.client_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="tabular-nums">
                            <Star className="h-3 w-3 mr-1 text-warning" />
                            {cp.points.toLocaleString("pt-BR")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatBRL(cp.total_spent)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Editar Template" : "Novo Template de Cartão"}</DialogTitle>
            <DialogDescription>Configure o nome e valor do cartão-presente</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <Input defaultValue={editingTemplate?.name} placeholder="Ex: Cartão R$100" />
            </Field>
            <Field>
              <FieldLabel>Valor</FieldLabel>
              <Input type="number" defaultValue={editingTemplate?.amount} placeholder="100" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success("Template salvo"); setTemplateDialogOpen(false) }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubscription ? "Editar Plano" : "Novo Plano de Assinatura"}</DialogTitle>
            <DialogDescription>Configure os detalhes do plano mensal</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Nome do plano</FieldLabel>
              <Input defaultValue={editingSubscription?.name} placeholder="Ex: Corte Ilimitado" />
            </Field>
            <Field>
              <FieldLabel>Valor mensal</FieldLabel>
              <Input type="number" defaultValue={editingSubscription?.price_month} placeholder="149" />
            </Field>
            <Field>
              <FieldLabel>Benefícios (um por linha)</FieldLabel>
              <Textarea defaultValue={editingSubscription?.benefits.join("\n")} rows={4} placeholder="Cortes ilimitados&#10;Reserva prioritária" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscriptionDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success("Plano salvo"); setSubscriptionDialogOpen(false) }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package Dialog */}
      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Editar Pacote" : "Novo Pacote de Serviços"}</DialogTitle>
            <DialogDescription>Configure pacotes de múltiplas sessões</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Nome do pacote</FieldLabel>
              <Input defaultValue={editingPackage?.name} placeholder="Ex: 5 Cortes" />
            </Field>
            <Field>
              <FieldLabel>Serviço</FieldLabel>
              <Select defaultValue={editingPackage?.service_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter((s) => s.active).map((service) => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <FieldGroup>
              <Field>
                <FieldLabel>Sessões</FieldLabel>
                <Input type="number" defaultValue={editingPackage?.total_sessions} placeholder="5" />
              </Field>
              <Field>
                <FieldLabel>Preço total</FieldLabel>
                <Input type="number" defaultValue={editingPackage?.price} placeholder="200" />
              </Field>
            </FieldGroup>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success("Pacote salvo"); setPackageDialogOpen(false) }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reward Dialog */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Recompensa</DialogTitle>
            <DialogDescription>Configure uma recompensa para o programa de pontos</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <Input placeholder="Ex: Corte Grátis" />
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select defaultValue="discount">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Desconto em R$</SelectItem>
                  <SelectItem value="service">Serviço grátis</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <FieldGroup>
              <Field>
                <FieldLabel>Pontos necessários</FieldLabel>
                <Input type="number" placeholder="250" />
              </Field>
              <Field>
                <FieldLabel>Valor/Serviço</FieldLabel>
                <Input type="number" placeholder="45" />
              </Field>
            </FieldGroup>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success("Recompensa criada"); setRewardDialogOpen(false) }}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
