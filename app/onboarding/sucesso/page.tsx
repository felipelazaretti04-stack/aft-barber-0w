"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Scissors, Check, ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function getTrialEndDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

function getDaysLeft(trialEnd: Date): number {
  const now = new Date()
  const diff = trialEnd.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function SucessoPage() {
  const [daysLeft, setDaysLeft] = useState(7)
  const trialEndDate = getTrialEndDate()

  useEffect(() => {
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)
    setDaysLeft(getDaysLeft(trialEnd))
  }, [])

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-sm font-medium">
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-semibold">AFT Barber</span>
        </Link>

        {/* Icone de sucesso */}
        <div className="mb-6 flex justify-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-10 w-10 text-primary" />
          </span>
        </div>

        <h1 className="mb-2 text-2xl font-bold">Cartao cadastrado com sucesso!</h1>
        <p className="mb-8 text-muted-foreground">
          Sua barbearia esta pronta. Aproveite os 7 dias gratuitos.
        </p>

        {/* Trial countdown */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </span>
            <div className="text-left">
              <p className="text-2xl font-bold text-foreground">
                {daysLeft} {daysLeft === 1 ? "dia" : "dias"} gratuitos
              </p>
              <p className="text-sm text-muted-foreground">
                Primeira cobrança em {trialEndDate}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
          <p>Voce nao sera cobrado ate o fim do periodo gratuito.</p>
          <p>Cancele a qualquer momento sem nenhum custo.</p>
        </div>

        <Button asChild size="lg" className="w-full gap-2">
          <Link href="/dashboard">
            Acessar meu dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
