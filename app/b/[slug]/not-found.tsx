import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl font-bold tracking-tight">404</div>
      <h1 className="mt-4 text-xl font-semibold">Negócio não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verifique o link e tente novamente.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Voltar para a página inicial</Link>
      </Button>
    </main>
  )
}
