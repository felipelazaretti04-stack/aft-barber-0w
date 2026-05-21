"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Scissors, CreditCard, Shield, Calendar, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatBRL } from "@/lib/format"
import { createCheckoutFromTenantAction } from "@/app/actions/billing"

interface Props {
  tenantId: string
  tenantName: string
  planName: string
  planSlug: string
  priceCents: number
  hasPreapproval: boolean
  userEmail: string
}

export function CardSetupClient({
  tenantId,
  tenantName,
  planName,
  priceCents,
  hasPreapproval,
  userEmail,
}: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCadastrarCartao = () => {
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutFromTenantAction(tenantId, userEmail)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.initPoint) {
        window.location.href = result.initPoint
      }
    })
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-sm font-medium">
          <Scissors className="h-5 w-5 text-primary" />
          <span className="font-semibold">AFT Barber</span>
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Quase la!</h1>
          <p className="mt-1 text-muted-foreground">
            Configure o pagamento para ativar <span className="font-medium text-foreground">{tenantName}</span>
          </p>
        </div>

        {/* Card do plano */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Plano selecionado</p>
              <p className="mt-0.5 text-lg font-semibold">{planName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatBRL(priceCents / 100)}</p>
              <p className="text-xs text-muted-foreground">/mes apos o trial</p>
            </div>
          </CardContent>
        </Card>

        {/* Garantias */}
        <ul className="mb-8 space-y-3">
          {[
            { icon: Calendar, text: "7 dias gratuitos — sem cobrança agora" },
            { icon: Check,    text: "Cobrado apenas no 8º dia, se nao cancelar" },
            { icon: Shield,   text: "Cancele quando quiser, sem multa" },
            { icon: CreditCard, text: "Dados protegidos pelo Mercado Pago" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleCadastrarCartao}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecionando...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              {hasPreapproval ? "Continuar para o Mercado Pago" : "Cadastrar cartao via Mercado Pago"}
            </>
          )}
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Ao continuar, voce sera redirecionado para o Mercado Pago para inserir os dados do cartao com seguranca.
        </p>
      </div>
    </div>
  )
}
