"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Scissors, Shield, Calendar, Check, Loader2, AlertCircle } from "lucide-react"
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatBRL } from "@/lib/format"

// Inicializa o SDK do Mercado Pago
if (typeof window !== "undefined") {
  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
  if (publicKey) {
    initMercadoPago(publicKey, { locale: "pt-BR" })
  }
}

interface Props {
  tenantId: string
  tenantName: string
  planName: string
  planSlug: string
  priceCents: number
  userEmail: string
}

export function CardPaymentBrick({
  tenantId,
  tenantName,
  planName,
  planSlug,
  priceCents,
  userEmail,
}: Props) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (formData: { token: string }) => {
      setIsProcessing(true)
      setError(null)

      try {
        const res = await fetch("/api/billing/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            cardToken: formData.token,
            planSlug,
            planName,
            priceCents,
            payerEmail: userEmail,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Erro ao processar pagamento")
        }

        // Sucesso - redireciona para tela de confirmação
        router.push("/onboarding/sucesso")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao processar pagamento")
        setIsProcessing(false)
      }
    },
    [tenantId, planSlug, planName, priceCents, userEmail, router],
  )

  const handleError = useCallback((err: unknown) => {
    console.error("[CardPayment] error:", err)
    setError("Erro ao carregar formulário de pagamento. Tente novamente.")
  }, [])

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
        <ul className="mb-6 space-y-2">
          {[
            { icon: Calendar, text: "7 dias gratuitos — sem cobrança agora" },
            { icon: Check, text: "Cobrado apenas no 8º dia, se nao cancelar" },
            { icon: Shield, text: "Dados protegidos pelo Mercado Pago" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-3 w-3 text-primary" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Processando pagamento...</span>
          </div>
        )}

        {/* CardPayment Brick */}
        <div className="rounded-lg border bg-card p-4">
          <CardPayment
            initialization={{
              amount: priceCents / 100,
              payer: {
                email: userEmail,
              },
            }}
            customization={{
              visual: {
                style: {
                  customVariables: {
                    formBackgroundColor: "transparent",
                    baseColor: "hsl(var(--primary))",
                  },
                },
              },
              paymentMethods: {
                maxInstallments: 1,
              },
            }}
            onSubmit={handleSubmit}
            onError={handleError}
          />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Ao continuar, voce concorda com os termos de uso e autoriza a cobranca recorrente apos o periodo gratuito.
        </p>
      </div>
    </div>
  )
}
