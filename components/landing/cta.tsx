import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingCTA() {
  return (
    <section className="border-b border-border/40 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-primary/5 p-10 text-center md:p-14">
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Pronto para profissionalizar sua barbearia?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Crie sua conta em 60 segundos. Sem cartão. Sem instalação.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/sign-up">
                Começar grátis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
