"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Loader2, ShieldCheck, RotateCcw, MessageSquare, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { requestOtp, verifyOtp } from "@/app/actions/otp"

interface Props {
  manageToken: string
  tenantName: string
  onVerified: () => void
}

export function OtpGate({ manageToken, tenantName, onVerified }: Props) {
  const [step, setStep] = useState<"request" | "verify">("request")
  const [otpId, setOtpId] = useState<string | null>(null)
  const [channel, setChannel] = useState<string | null>(null)
  const [maskedRecipient, setMaskedRecipient] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Foca automaticamente no input ao aparecer
  useEffect(() => {
    if (step === "verify") {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [step])

  function handleRequest() {
    setError(null)
    startTransition(async () => {
      const res = await requestOtp(manageToken)
      if (!res.ok) {
        setError(res.error ?? "Erro ao enviar código")
        return
      }
      setOtpId(res.otpId!)
      setChannel(res.channel!)
      setMaskedRecipient(res.maskedRecipient!)
      setStep("verify")
    })
  }

  function handleVerify() {
    if (code.length !== 6) return
    setError(null)
    startTransition(async () => {
      const res = await verifyOtp(otpId!, code, manageToken)
      if (!res.ok) {
        setError(res.error ?? "Código inválido")
        return
      }
      onVerified()
    })
  }

  const ChannelIcon = channel === "email" ? Mail : MessageSquare

  return (
    <main className="flex min-h-[80dvh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Verificar identidade</CardTitle>
          <CardDescription>
            Para gerenciar seu agendamento na <span className="font-medium text-foreground">{tenantName}</span>, precisamos verificar sua identidade.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "request" ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Enviaremos um código de 6 dígitos para o contato cadastrado no agendamento.
              </p>

              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleRequest}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Enviar código de verificação
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <ChannelIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  Código enviado via{" "}
                  <Badge variant="secondary" className="text-xs">
                    {channel === "email" ? "e-mail" : "WhatsApp"}
                  </Badge>{" "}
                  para <span className="font-medium">{maskedRecipient}</span>
                </span>
              </div>

              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="text-center text-2xl font-mono tracking-[0.5em] h-14"
                  aria-label="Código de verificação"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Válido por 10 minutos · máx. 3 tentativas
                </p>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={isPending || code.length !== 6}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                Confirmar código
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => { setStep("request"); setCode(""); setError(null) }}
                disabled={isPending}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Reenviar código
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
