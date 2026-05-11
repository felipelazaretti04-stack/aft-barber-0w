import {
  CalendarCheck2,
  Users,
  Megaphone,
  Sparkles,
  Receipt,
  Smartphone,
  MessageSquare,
  Gift,
  ChartLine,
} from "lucide-react"

const features = [
  {
    icon: CalendarCheck2,
    title: "Agenda multi-profissional",
    desc: "Visualização por dia, semana e mês. Arraste e solte agendamentos, bloqueie horários e gerencie a equipe inteira.",
  },
  {
    icon: Smartphone,
    title: "Página pública e booking",
    desc: "Link único para clientes agendarem 24/7. Cores, logo e fotos da sua marca. Funciona perfeito no celular.",
  },
  {
    icon: Users,
    title: "CRM completo",
    desc: "Histórico de cortes, gastos, aniversários e tags. Saiba quem é seu melhor cliente e quem está sumido.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp e SMS",
    desc: "Confirmação automática, lembretes 24h antes e mensagens de aniversário. Reduza no-show em até 70%.",
  },
  {
    icon: Megaphone,
    title: "Campanhas e promoções",
    desc: "Envie promos segmentadas, crie cupons e flyers em segundos. Marketing que cabe na rotina.",
  },
  {
    icon: Gift,
    title: "Fidelidade e gift cards",
    desc: "Programa de pontos, pacotes pré-pagos e cartões-presente. Faça o cliente voltar mais.",
  },
  {
    icon: Receipt,
    title: "PDV integrado",
    desc: "Venda rápida com Pix, crédito, débito e dinheiro. Fechamento de caixa diário sem planilha.",
  },
  {
    icon: ChartLine,
    title: "Relatórios em tempo real",
    desc: "Faturamento, comissões, ticket médio e ranking de profissionais. Decida com dados.",
  },
  {
    icon: Sparkles,
    title: "Automações",
    desc: "Aniversariantes, clientes sumidos, pós-atendimento. Configure uma vez, vende todo mês.",
  },
]

export function LandingFeatures() {
  return (
    <section id="recursos" className="border-b border-border/40 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Recursos</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Tudo que você precisa para crescer sua barbearia
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Substitua 5 ferramentas por uma. Da agenda ao marketing, do PDV à fidelidade.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
