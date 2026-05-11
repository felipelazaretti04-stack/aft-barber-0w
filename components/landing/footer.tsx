import Link from "next/link"
import { Scissors } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold">AFT Barber</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A plataforma completa para profissionalizar sua barbearia.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Produto</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#recursos" className="hover:text-foreground">Recursos</Link></li>
              <li><Link href="#planos" className="hover:text-foreground">Planos</Link></li>
              <li><Link href="#depoimentos" className="hover:text-foreground">Depoimentos</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Conta</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/login" className="hover:text-foreground">Entrar</Link></li>
              <li><Link href="/auth/sign-up" className="hover:text-foreground">Criar conta</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Painel</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/legal/terms" className="hover:text-foreground">Termos</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-foreground">Privacidade</Link></li>
              <li><Link href="/legal/contact" className="hover:text-foreground">Contato</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} AFT Barber. Todos os direitos reservados.</p>
          <p>Feito com cuidado para barbearias brasileiras.</p>
        </div>
      </div>
    </footer>
  )
}
