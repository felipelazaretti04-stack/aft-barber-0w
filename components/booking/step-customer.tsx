"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBookingStore } from "@/lib/booking/store"
import { customerSchema, maskPhoneBR, type CustomerInput } from "@/lib/booking/schema"

export function StepCustomer() {
  const { customer, setCustomer, setStep } = useBookingStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes,
    },
  })

  const phoneValue = watch("phone")

  function onSubmit(data: CustomerInput) {
    setCustomer({
      name: data.name,
      phone: data.phone,
      email: data.email ?? "",
      notes: data.notes ?? "",
    })
    setStep(5)
  }

  return (
    <section aria-labelledby="step-customer-title">
      <h2 id="step-customer-title" className="text-balance text-xl font-semibold">
        Seus dados de contato
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Vamos enviar a confirmação por mensagem.
      </p>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            autoComplete="name"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name ? (
            <p id="name-error" className="text-xs text-destructive">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="phone">Celular (WhatsApp) *</Label>
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 98888-7777"
            value={phoneValue ?? ""}
            onChange={(e) => setValue("phone", maskPhoneBR(e.target.value), { shouldValidate: true })}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone ? (
            <p id="phone-error" className="text-xs text-destructive">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="email">
            E-mail <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="notes">
            Observações <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Ex: prefiro lavar com água fria"
            {...register("notes")}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => setStep(3)}>
            Voltar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ background: "var(--tenant-primary)", color: "white" }}
          >
            Continuar
          </Button>
        </div>
      </form>
    </section>
  )
}
