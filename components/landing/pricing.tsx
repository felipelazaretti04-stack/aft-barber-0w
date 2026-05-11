import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrencyBR } from "@/lib/format"
import type { Plan } from "@/lib/queries/plans"

function highlightFor(slug: string) {
  return slug === "pro"
}

function ctaFor(slug: string) {
  if (slug === "free") return "Começar grátis"
  return "Assinar agora"
}

export function LandingPricing({ plans }: { plans: Plan[] }) {
  return (
    <section id="planos" className="border-b border-border/40 bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Planos</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Preço justo. Sem letras miúdas.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Comece de graça. Faça upgrade quando precisar. Cancele quando quiser.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isHighlight = highlightFor(plan.slug)
            const features = Array.isArray(plan.features)
              ? (plan.features as string[])
              : []
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 md:p-7",
                  isHighlight
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border/60"
                )}
              >
                {isHighlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs">
                    Mais popular
                  </Badge>
                )}

                <h3 className="text-lg font-semibold">{plan.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">
                    {plan.price_cents === 0 ? "R$ 0" : formatCurrencyBR(plan.price_cents / 100)}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.max_barbers
                    ? `Até ${plan.max_barbers} ${plan.max_barbers === 1 ? "profissional" : "profissionais"}`
                    : "Profissionais ilimitados"}
                </p>

                <ul className="mt-6 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex-1" />

                <Button
                  asChild
                  size="lg"
                  variant={isHighlight ? "default" : "outline"}
                  className="w-full"
                >
                  <Link href={`/auth/sign-up?plan=${plan.slug}`}>{ctaFor(plan.slug)}</Link>
                </Button>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Todos os planos pagos incluem 14 dias grátis · Pagamento por Mercado Pago · Cancele quando quiser
        </p>
      </div>
    </section>
  )
}
