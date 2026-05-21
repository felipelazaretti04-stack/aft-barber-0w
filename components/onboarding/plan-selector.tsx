"use client"

import { useOnboardingStore } from "@/lib/onboarding/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, ArrowRight } from "lucide-react"
import { formatBRL } from "@/lib/format"

const PLANS = [
  {
    slug: "starter",
    name: "Starter",
    price_cents: 7990,
    tagline: "Para começar",
    features: [
      "1 profissional",
      "Até 10 serviços",
      "200 agendamentos/mês",
      "Página pública de agendamento",
      "Notificações por e-mail",
    ],
    popular: false,
  },
  {
    slug: "pro",
    name: "Pro",
    price_cents: 12990,
    tagline: "Para crescer",
    features: [
      "Até 5 profissionais",
      "Até 30 serviços",
      "1.000 agendamentos/mês",
      "Notificações via WhatsApp",
      "Relatórios avançados",
      "PDV completo",
      "Lista de espera",
    ],
    popular: true,
  },
  {
    slug: "premium",
    name: "Premium",
    price_cents: 29990,
    tagline: "Para escalar",
    features: [
      "Profissionais ilimitados",
      "Serviços ilimitados",
      "Agendamentos ilimitados",
      "Campanhas de marketing",
      "Programa de fidelidade",
      "Personalização de marca",
      "Suporte prioritário",
    ],
    popular: false,
  },
]

interface Props {
  onNext: () => void
}

export function StepPlanSelector({ onNext }: Props) {
  const { planSlug, setPlan } = useOnboardingStore()

  const selected = planSlug && planSlug !== "free" ? planSlug : ""

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Escolha seu Plano</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          7 dias grátis — cartão obrigatório, sem cobrança agora. Cancele quando quiser.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.slug
          return (
            <button
              key={plan.slug}
              type="button"
              onClick={() => setPlan(plan.slug)}
              className={cn(
                "relative flex flex-col rounded-xl border-2 p-5 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3">
                  Mais popular
                </Badge>
              )}

              <div className="mb-3">
                <p className="font-semibold text-foreground">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{plan.tagline}</p>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold text-foreground">
                  {formatBRL(plan.price_cents / 100)}
                </span>
                <span className="text-xs text-muted-foreground">/mês</span>
              </div>

              <ul className="flex-1 space-y-1.5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feat}</span>
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                  <Check className="h-3.5 w-3.5" />
                  Selecionado
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="gap-2"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
