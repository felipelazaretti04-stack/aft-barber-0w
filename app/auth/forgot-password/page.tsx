"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Scissors } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?next=/auth/update-password`,
    })

    setIsLoading(false)

    if (error) {
      // Não revelar se o e-mail existe ou não — mensagem neutra
      setSent(true)
      return
    }

    setSent(true)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-sm font-medium">
          <Scissors className="h-5 w-5 text-primary" />
          <span>AFT Barber</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recuperar senha</CardTitle>
            <CardDescription>
              {sent
                ? "Verifique seu e-mail."
                : "Informe seu e-mail para receber as instruções."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Se o e-mail existir em nossa base, você receberá um link para redefinir sua senha em breve.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login">Voltar para o login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@barbearia.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar instruções"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    href="/auth/login"
                    className="underline-offset-4 hover:underline"
                  >
                    Voltar para o login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
