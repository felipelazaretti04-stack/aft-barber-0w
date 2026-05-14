"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOnboardingStore, type OnboardingStep } from "@/lib/onboarding/store"
import { StepBusiness } from "./step-business"
import { StepServices } from "./step-services"
import { StepSchedules } from "./step-schedules"
import { StepReview } from "./step-review"
import { cn } from "@/lib/utils"
import { Building2, Scissors, Clock, CheckCircle } from "lucide-react"

const STEPS: { key: OnboardingStep; label: string; icon: React.ElementType }[] = [
  { key: "business", label: "Negócio", icon: Building2 },
  { key: "services", label: "Serviços", icon: Scissors },
  { key: "schedules", label: "Horários", icon: Clock },
  { key: "review", label: "Confirmar", icon: CheckCircle },
]

interface Props {
  planSlug: string
  userName: string
  userEmail: string
}

export function OnboardingWizard({ planSlug, userName, userEmail }: Props) {
  const router = useRouter()
  const { step, setPlan, setBarberName, barberName } = useOnboardingStore()

  useEffect(() => {
    setPlan(planSlug)
    if (!barberName && userName) {
      setBarberName(userName)
    }
  }, [planSlug, userName, setPlan, setBarberName, barberName])

  const currentIndex = STEPS.findIndex((s) => s.key === step)

  const handleComplete = (slug: string) => {
    // Limpa store e redireciona
    useOnboardingStore.getState().reset()
    router.push(`/dashboard?welcome=1&slug=${slug}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Configure seu Negócio
        </h1>
        <p className="mt-1 text-muted-foreground">
          Preencha as informações para começar a receber agendamentos
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = s.key === step
            const isCompleted = i < currentIndex
            return (
              <div key={s.key} className="flex flex-1 items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1",
                      i < currentIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between px-0">
          {STEPS.map((s) => (
            <span
              key={s.key}
              className={cn(
                "text-xs",
                s.key === step ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {step === "business" && <StepBusiness />}
        {step === "services" && <StepServices />}
        {step === "schedules" && <StepSchedules userName={userName} />}
        {step === "review" && (
          <StepReview userEmail={userEmail} onComplete={handleComplete} />
        )}
      </div>
    </div>
  )
}
