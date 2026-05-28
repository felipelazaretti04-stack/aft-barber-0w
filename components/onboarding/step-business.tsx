"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useOnboardingStore } from "@/lib/onboarding/store"
import { businessSchema, type BusinessData } from "@/lib/onboarding/schema"
import { checkSlugAvailability } from "@/app/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepBusiness() {
  const { business, setBusiness, setStep } = useOnboardingStore()
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BusinessData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business.name || "",
      slug: business.slug || "",
      description: business.description || "",
      phone: business.phone || "",
      whatsapp: business.whatsapp || "",
      address: business.address || "",
      timezone: "America/Sao_Paulo",
    },
    mode: "onChange",
  })

  const name = watch("name")
  const slug = watch("slug")

  // Auto-gera slug a partir do nome
  useEffect(() => {
    if (name && !business.slug) {
      const generated = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 30)
      setValue("slug", generated, { shouldValidate: true })
    }
  }, [name, business.slug, setValue])

  // Debounced slug check
  const checkSlug = useCallback(async (s: string) => {
    if (!s || s.length < 3) {
      setSlugStatus("idle")
      return
    }
    setSlugStatus("checking")
    const available = await checkSlugAvailability(s)
    setSlugStatus(available ? "available" : "taken")
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (slug && slug.length >= 3) {
        checkSlug(slug)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [slug, checkSlug])

  const onSubmit = (data: BusinessData) => {
    if (slugStatus !== "available") return
    setBusiness(data)
    setStep("services")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome da Barbearia *</Label>
          <Input
            id="name"
            placeholder="Ex: Barbearia do João"
            {...register("name")}
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="slug">Link de Agendamento *</Label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              barberpro.com/app/
            </span>
            <div className="relative flex-1">
              <Input
                id="slug"
                placeholder="minha-barbearia"
                {...register("slug")}
                className={cn(
                  "pr-8",
                  slugStatus === "available" && "border-green-500",
                  slugStatus === "taken" && "border-destructive"
                )}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {slugStatus === "checking" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {slugStatus === "available" && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {slugStatus === "taken" && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
          </div>
          {errors.slug && (
            <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>
          )}
          {slugStatus === "taken" && (
            <p className="mt-1 text-sm text-destructive">
              Este link já está em uso, escolha outro.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Conte um pouco sobre seu negócio..."
            {...register("description")}
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register("phone")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="(11) 99999-9999"
              {...register("whatsapp")}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            placeholder="Rua, número, bairro, cidade"
            {...register("address")}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!isValid || slugStatus !== "available"}
          className="gap-2"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
