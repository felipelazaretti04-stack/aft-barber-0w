import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CalendarCheck2, Users, BarChart3 } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-background">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, hsl(var(--primary) / 0.15), transparent 40%), radial-gradient(circle at 80% 60%, hsl(var(--accent) / 0.12), transparent 45%)",
        }}
      />
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge variant="outline" className="gap-2 rounded-full border-primary/30 bg-primary/5 px-3 py-1 text-xs">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Plataforma completa para barbearias modernas
          </Badge>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl">
            Sua barbearia no piloto automático.
          </h1>

          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Agenda online, página pública, marketing por WhatsApp, fidelidade e PDV — tudo em um só lugar. Comece grátis e cresça quando quiser.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/sign-up">
                Começar grátis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#planos">Ver planos</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sem cartão · 14 dias de Pro grátis · Cancele quando quiser
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          <FeaturePill icon={<CalendarCheck2 className="h-4 w-4" />} title="Agenda inteligente" desc="Múltiplos profissionais, bloqueios e lista de espera" />
          <FeaturePill icon={<Users className="h-4 w-4" />} title="CRM de clientes" desc="Histórico, gastos, aniversários e tags" />
          <FeaturePill icon={<BarChart3 className="h-4 w-4" />} title="Relatórios" desc="Faturamento, comissões e métricas em tempo real" />
        </div>
      </div>
    </section>
  )
}

function FeaturePill({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
