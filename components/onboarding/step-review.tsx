"use client"

import { useState } from "react"
import { useOnboardingStore } from "@/lib/onboarding/store"
import { WEEKDAYS } from "@/lib/onboarding/schema"
import { completeOnboarding } from "@/app/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Building2,
  Scissors,
  Clock,
  Loader2,
  Rocket,
  ExternalLink,
} from "lucide-react"
import { formatBRL } from "@/lib/format"
import { toast } from "sonner"

interface Props {
  userEmail: string
  onComplete: (slug: string) => void
}

export function StepReview({ userEmail, onComplete }: Props) {
  const { business, services, schedules, barberName, planSlug, setStep } =
    useOnboardingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const enabledSchedules = schedules.filter((s) => s.enabled)

  const handleSubmit = async () => {
    if (!business.name || !business.slug) {
      toast.error("Dados do negócio incompletos")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await completeOnboarding({
        name: business.name,
        slug: business.slug,
        timezone: business.timezone || "America/Sao_Paulo",
        planSlug,
        phone: business.phone,
        whatsapp: business.whatsapp,
        address: business.address,
        description: business.description,
        primaryColor: business.primaryColor,
        services: services.map((s) => ({
          name: s.name,
          duration_min: s.duration_min,
          price_cents: s.price_cents,
          description: s.description,
        })),
        schedules: enabledSchedules.map((s) => ({
          weekday: s.weekday,
          starts_at: s.starts_at,
          ends_at: s.ends_at,
          break_starts_at: s.break_starts_at,
          break_ends_at: s.break_ends_at,
        })),
        barberName,
      })

      if (result.success && result.slug) {
        toast.success("Negócio criado com sucesso!")
        onComplete(result.slug)
      } else {
        toast.error(result.error || "Erro ao criar negócio")
      }
    } catch (err) {
      console.error("[v0] onboarding error:", err)
      toast.error("Erro inesperado. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Revise suas Informações</h2>
        <p className="text-sm text-muted-foreground">
          Confira os dados antes de finalizar. Você poderá editar tudo depois.
        </p>
      </div>

      {/* Resumo do negócio */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Negócio</h3>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome</span>
            <span className="font-medium">{business.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Link</span>
            <span className="font-medium flex items-center gap-1">
              barberpro.com/b/{business.slug}
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
          {business.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefone</span>
              <span>{business.phone}</span>
            </div>
          )}
          {business.address && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Endereço</span>
              <span className="text-right max-w-[60%]">{business.address}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Resumo dos serviços */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Serviços ({services.length})</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <Badge key={s.id} variant="secondary" className="text-sm">
              {s.name} - {formatBRL(s.price_cents / 100)}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Resumo dos horários */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Horários</h3>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profissional</span>
            <span className="font-medium">{barberName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dias de atendimento</span>
            <span>
              {enabledSchedules
                .map((s) => WEEKDAYS.find((d) => d.value === s.weekday)?.short)
                .join(", ")}
            </span>
          </div>
          {enabledSchedules[0] && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horário típico</span>
              <span>
                {enabledSchedules[0].starts_at} - {enabledSchedules[0].ends_at}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Plano */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              Plano: {planSlug === "free" ? "Gratuito" : planSlug.toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              14 dias de teste grátis
            </p>
          </div>
          <Rocket className="h-8 w-8 text-primary" />
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("schedules")}
          disabled={isSubmitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Criar Negócio
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
