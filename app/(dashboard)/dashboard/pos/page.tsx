"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Banknote,
  Check,
  CreditCard,
  Gift,
  Minus,
  Package,
  Percent,
  Plus,
  QrCode,
  Search,
  Scissors,
  ShoppingCart,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { barbers, clients, products, services } from "@/lib/mock-data"
import { giftcards, servicePackages } from "@/lib/mock-data-extra"
import { formatBRL } from "@/lib/format"
import type { PaymentMethod } from "@/lib/types"

interface CartItem {
  id: string
  type: "service" | "product" | "giftcard" | "package"
  name: string
  price: number
  quantity: number
  photo_url?: string
  addOns?: { id: string; name: string; price: number }[]
}

const paymentMethods = [
  { id: "dinheiro", label: "Dinheiro", icon: Banknote },
  { id: "pix", label: "Pix", icon: QrCode },
  { id: "debito", label: "Débito", icon: CreditCard },
  { id: "credito", label: "Crédito", icon: CreditCard },
]

const upsells = [
  { id: "upsell_1", name: "Lavagem Premium", price: 15 },
  { id: "upsell_2", name: "Sobrancelha", price: 15 },
  { id: "upsell_3", name: "Hidratante pós-barba", price: 10 },
  { id: "upsell_4", name: "Cerveja artesanal", price: 12 },
]

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string>("")
  const [clientSearch, setClientSearch] = useState("")
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [creditInstallments, setCreditInstallments] = useState(1)
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent")
  const [discountValue, setDiscountValue] = useState(0)
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  )

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type)
      if (existing) {
        return prev.map((i) => (i.id === item.id && i.type === item.type ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, item]
    })
    toast.success(`${item.name} adicionado`)
  }

  const updateQuantity = (id: string, type: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id && i.type === type ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  const removeFromCart = (id: string, type: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.type === type)))
  }

  const addAddOn = (cartItemId: string, addOn: { id: string; name: string; price: number }) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === cartItemId
          ? {
              ...i,
              addOns: i.addOns?.some((a) => a.id === addOn.id)
                ? i.addOns.filter((a) => a.id !== addOn.id)
                : [...(i.addOns || []), addOn],
            }
          : i
      )
    )
  }

  const subtotal = cart.reduce((sum, item) => {
    const addOnsTotal = item.addOns?.reduce((s, a) => s + a.price, 0) || 0
    return sum + (item.price + addOnsTotal) * item.quantity
  }, 0)

  const discountAmount =
    discountType === "percent" ? (subtotal * discountValue) / 100 : discountValue

  const total = Math.max(0, subtotal - discountAmount)

  const handleFinalizeSale = () => {
    if (!selectedClient) {
      toast.error("Selecione um cliente")
      return
    }
    if (!selectedBarber) {
      toast.error("Selecione um barbeiro")
      return
    }
    if (cart.length === 0) {
      toast.error("Adicione itens ao carrinho")
      return
    }
    if (!paymentMethod) {
      toast.error("Selecione a forma de pagamento")
      return
    }

    setPaymentDialogOpen(true)
  }

  const confirmSale = () => {
    toast.success("Venda finalizada com sucesso!")
    setCart([])
    setSelectedClient(null)
    setSelectedBarber("")
    setPaymentMethod(null)
    setDiscountValue(0)
    setPaymentDialogOpen(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader title="Venda Rápida" description="PDV para vendas presenciais" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Side - Products/Services */}
        <div className="space-y-4">
          <Tabs defaultValue="services">
            <TabsList>
              <TabsTrigger value="services" className="gap-2">
                <Scissors className="h-4 w-4" />
                Serviços
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="giftcards" className="gap-2">
                <Gift className="h-4 w-4" />
                Cartões-presente
              </TabsTrigger>
              <TabsTrigger value="packages" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Pacotes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-4">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                {services.filter((s) => s.active).map((service) => (
                  <button
                    key={service.id}
                    onClick={() =>
                      addToCart({
                        id: service.id,
                        type: "service",
                        name: service.name,
                        price: service.price,
                        quantity: 1,
                        photo_url: service.photo_url,
                      })
                    }
                    className="group relative overflow-hidden rounded-lg border bg-card text-left transition-all hover:shadow-md hover:border-primary/50"
                  >
                    <div className="relative aspect-video bg-muted">
                      <Image
                        src={service.photo_url || "/placeholder.svg"}
                        alt={service.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-1">{service.name}</p>
                      <p className="text-lg font-bold text-primary">{formatBRL(service.price)}</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-4">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        type: "product",
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        photo_url: product.photo_url,
                      })
                    }
                    className="group relative overflow-hidden rounded-lg border bg-card text-left transition-all hover:shadow-md hover:border-primary/50"
                  >
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={product.photo_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-lg font-bold text-primary">{formatBRL(product.price)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {product.stock} em estoque
                        </Badge>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="giftcards" className="mt-4">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                {[50, 100, 150, 200].map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      addToCart({
                        id: `gc_${value}`,
                        type: "giftcard",
                        name: `Cartão-presente R$${value}`,
                        price: value,
                        quantity: 1,
                      })
                    }
                    className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 text-left p-6 transition-all hover:shadow-md hover:border-primary/50"
                  >
                    <Gift className="h-10 w-10 text-primary mb-3" />
                    <p className="font-medium">Cartão-presente</p>
                    <p className="text-2xl font-bold text-primary">{formatBRL(value)}</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="packages" className="mt-4">
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                {servicePackages.filter((p) => p.active).map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() =>
                      addToCart({
                        id: pkg.id,
                        type: "package",
                        name: pkg.name,
                        price: pkg.price,
                        quantity: 1,
                      })
                    }
                    className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-chart-2/10 to-chart-2/5 text-left p-6 transition-all hover:shadow-md hover:border-primary/50"
                  >
                    <Sparkles className="h-10 w-10 text-chart-2 mb-3" />
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground">{pkg.service_name}</p>
                    <p className="text-2xl font-bold text-chart-2 mt-2">{formatBRL(pkg.price)}</p>
                    <Badge variant="secondary" className="mt-2">
                      {pkg.total_sessions} sessões
                    </Badge>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Cart */}
        <div className="lg:sticky lg:top-4 h-fit">
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
                {cart.length > 0 && (
                  <Badge variant="secondary">{cart.reduce((s, i) => s + i.quantity, 0)}</Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {/* Client Select */}
              <Field>
                <FieldLabel>Cliente</FieldLabel>
                <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-start gap-2 h-auto py-2"
                    >
                      {selectedClient ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedClient.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{selectedClient.name}</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Selecionar cliente</span>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar cliente..."
                        value={clientSearch}
                        onValueChange={setClientSearch}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredClients.map((client) => (
                            <CommandItem
                              key={client.id}
                              onSelect={() => {
                                setSelectedClient(client)
                                setClientPopoverOpen(false)
                                setClientSearch("")
                              }}
                              className="flex items-center gap-2"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={client.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.phone}</p>
                              </div>
                              {selectedClient?.id === client.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>

              {/* Barber Select */}
              <Field>
                <FieldLabel>Barbeiro</FieldLabel>
                <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.filter((b) => b.active).map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={barber.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {barber.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Separator />

              {/* Cart Items */}
              <ScrollArea className="h-[300px] pr-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Carrinho vazio</p>
                    <p className="text-xs text-muted-foreground">Adicione itens para começar</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {cart.map((item) => (
                      <li key={`${item.type}-${item.id}`} className="space-y-2">
                        <div className="flex items-start gap-3">
                          {item.photo_url && (
                            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                              <Image
                                src={item.photo_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-sm text-primary font-semibold">{formatBRL(item.price)}</p>
                            {item.addOns && item.addOns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.addOns.map((a) => (
                                  <Badge key={a.id} variant="outline" className="text-xs">
                                    {a.name} +{formatBRL(a.price)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.type, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.type, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeFromCart(item.id, item.type)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>

              {/* Upsells */}
              {cart.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Adicionais</p>
                    <div className="flex flex-wrap gap-2">
                      {upsells.map((upsell) => (
                        <Button
                          key={upsell.id}
                          variant="outline"
                          size="sm"
                          className="h-auto py-1.5 text-xs"
                          onClick={() => {
                            const firstServiceInCart = cart.find((i) => i.type === "service")
                            if (firstServiceInCart) {
                              addAddOn(firstServiceInCart.id, upsell)
                            } else {
                              addToCart({
                                id: upsell.id,
                                type: "service",
                                name: upsell.name,
                                price: upsell.price,
                                quantity: 1,
                              })
                            }
                          }}
                        >
                          + {upsell.name} ({formatBRL(upsell.price)})
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Discount */}
              {cart.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Desconto</span>
                    <div className="flex items-center gap-2">
                      {discountValue > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          -{discountType === "percent" ? `${discountValue}%` : formatBRL(discountValue)}
                          <button onClick={() => setDiscountValue(0)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setDiscountDialogOpen(true)}>
                        <Percent className="h-3 w-3 mr-1" />
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-destructive">
                    <span>Desconto</span>
                    <span>-{formatBRL(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatBRL(total)}</span>
                </div>
              </div>

              <Separator />

              {/* Payment Methods */}
              <div>
                <p className="text-sm font-medium mb-3">Forma de pagamento</p>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border transition-all",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:border-muted-foreground/50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{method.label}</span>
                        {paymentMethod === method.id && <Check className="h-4 w-4 ml-auto" />}
                      </button>
                    )
                  })}
                </div>

                {paymentMethod === "credito" && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground">Parcelas</Label>
                    <Select value={String(creditInstallments)} onValueChange={(v) => setCreditInstallments(Number(v))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}x de {formatBRL(total / n)} {n === 1 ? "(à vista)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4">
              <Button
                className="w-full h-12 text-lg font-semibold bg-success hover:bg-success/90 text-success-foreground"
                disabled={cart.length === 0}
                onClick={handleFinalizeSale}
              >
                <Check className="mr-2 h-5 w-5" />
                Finalizar Venda
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Discount Dialog */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar Desconto</DialogTitle>
            <DialogDescription>Escolha o tipo e valor do desconto</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Tipo de desconto</FieldLabel>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percent" | "fixed")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Valor</FieldLabel>
              <InputGroup>
                <InputGroupAddon>{discountType === "percent" ? "%" : "R$"}</InputGroupAddon>
                <InputGroupInput
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  min={0}
                  max={discountType === "percent" ? 100 : subtotal}
                />
              </InputGroup>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { toast.success("Desconto aplicado"); setDiscountDialogOpen(false) }}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Venda</DialogTitle>
            <DialogDescription>Revise os dados antes de finalizar</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">{selectedClient?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Barbeiro</span>
              <span className="font-medium">{barbers.find((b) => b.id === selectedBarber)?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Itens</span>
              <span className="font-medium">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pagamento</span>
              <span className="font-medium capitalize">
                {paymentMethod}
                {paymentMethod === "credito" && creditInstallments > 1 && ` (${creditInstallments}x)`}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatBRL(total)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Voltar
            </Button>
            <Button className="bg-success hover:bg-success/90 text-success-foreground" onClick={confirmSale}>
              <Check className="mr-2 h-4 w-4" />
              Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
