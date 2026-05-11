import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não. O plano Free é grátis para sempre. Os planos pagos têm 14 dias grátis e só pedem cartão na hora de assinar.",
  },
  {
    q: "Como funciona a página pública da minha barbearia?",
    a: "Cada barbearia recebe um link único (ex: aft.app/sua-barbearia). Clientes escolhem serviço, profissional, horário e confirmam — sem precisar baixar nada.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Você cancela direto pelo painel, sem fidelidade. O acesso continua até o fim do período já pago.",
  },
  {
    q: "Quantos profissionais posso cadastrar?",
    a: "Free: 1. Pro: até 5. Premium: ilimitados. Você pode trocar de plano a qualquer momento.",
  },
  {
    q: "Funciona em qualquer celular?",
    a: "Sim. O painel e a página pública são 100% responsivos. Funciona em qualquer navegador, sem instalar app.",
  },
  {
    q: "Como funciona o pagamento da mensalidade?",
    a: "Cobrança recorrente via Mercado Pago. Cartão de crédito ou Pix. Cancele quando quiser direto no painel.",
  },
]

export function LandingFAQ() {
  return (
    <section id="faq" className="border-b border-border/40 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">Perguntas frequentes</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Ainda tem dúvidas?
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
