import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    name: "Diego Almeida",
    role: "Dono da Barbearia Lobo Solo",
    avatar: "DA",
    text: "Caiu o no-show pela metade no primeiro mês. Os clientes amam o lembrete no WhatsApp e a agenda online. Não consigo mais imaginar trabalhar sem.",
  },
  {
    name: "Rafa Mendes",
    role: "Barber Studio RM",
    avatar: "RM",
    text: "Saí de 4 planilhas e 3 apps para um só lugar. O PDV integrado com a comissão automática já pagou o plano no primeiro mês.",
  },
  {
    name: "Carol Vieira",
    role: "Gestora — Studio Vértice",
    avatar: "CV",
    text: "A página pública ficou linda. Recebo agendamento até domingo à noite sem precisar responder ninguém. Marketing automático é vida.",
  },
]

const logos = ["Lobo Solo", "Studio RM", "Vértice", "Barba & Co", "King's", "Norte Sul"]

export function LandingSocialProof() {
  return (
    <section id="depoimentos" className="border-b border-border/40 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Depoimentos</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Barbearias que cresceram com a AFT
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-6"
            >
              <Quote className="h-5 w-5 text-primary" />
              <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                {t.text}
              </blockquote>
              <div className="mt-5 flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {logos.map((l) => (
            <span key={l} className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
