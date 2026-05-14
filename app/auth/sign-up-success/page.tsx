import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Scissors } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-sm font-medium">
          <Scissors className="h-5 w-5 text-primary" />
          <span>AFT Barber</span>
        </Link>
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Confirme seu e-mail</CardTitle>
            <CardDescription>Enviamos um link de confirmação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Acesse sua caixa de entrada e clique no link para ativar sua conta. Depois disso, faça login para continuar
              a configuração da sua barbearia.
            </p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/login">Ir para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
