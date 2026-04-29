"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Mail, Phone, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { InviteBarberDialog } from "@/components/barbers/invite-barber-dialog"
import { appointments, barbers } from "@/lib/mock-data"
import { formatBRL } from "@/lib/format"

export default function BarbersPage() {
  const [open, setOpen] = useState(false)

  const stats = barbers.map((b) => {
    const apts = appointments.filter((a) => a.barber_id === b.id)
    const completed = apts.filter((a) => a.status === "completed")
    const revenue = completed.reduce((s, a) => s + a.price, 0)
    return { barber: b, count: apts.length, revenue, commission: revenue * (b.commission_pct / 100) }
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Barbeiros" description="Gerencie sua equipe e performance">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Convidar Barbeiro
        </Button>
      </PageHeader>

      <div className="grid gap-4">
        {stats.map(({ barber: b, count, revenue, commission }) => (
          <Card key={b.id}>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-5">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={b.avatar_url || "/placeholder.svg"} alt={b.name} />
                <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{b.name}</h3>
                  <div
                    className="h-3 w-3 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: b.color }}
                    aria-label="Cor na agenda"
                  />
                  <Badge variant={b.active ? "default" : "secondary"}>
                    {b.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{b.bio}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {b.email}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {b.phone}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-6 w-full sm:w-auto">
                <div>
                  <p className="text-xs text-muted-foreground">Atendimentos</p>
                  <p className="text-lg font-semibold">{count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                  <p className="text-lg font-semibold tabular-nums">{formatBRL(revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Comissão</p>
                  <p className="text-lg font-semibold tabular-nums">{formatBRL(commission)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/barbers/${b.id}`}>
                  Ver detalhes <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <InviteBarberDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
