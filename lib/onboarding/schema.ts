import { z } from "zod"

// Step 1: Dados do negócio
export const businessSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(30, "Slug deve ter no máximo 30 caracteres")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
  description: z.string().max(500).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().max(200).optional(),
  timezone: z.string().default("America/Sao_Paulo"),
  primaryColor: z.string().optional(),
})

export type BusinessData = z.infer<typeof businessSchema>

// Step 2: Serviços
export const serviceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  duration_min: z.number().min(5).max(480),
  price_cents: z.number().min(0),
  description: z.string().optional(),
})

export const servicesSchema = z.object({
  services: z.array(serviceItemSchema).min(1, "Adicione pelo menos um serviço"),
})

export type ServiceItem = z.infer<typeof serviceItemSchema>
export type ServicesData = z.infer<typeof servicesSchema>

// Step 3: Horários
export const scheduleItemSchema = z.object({
  weekday: z.number().min(0).max(6),
  enabled: z.boolean(),
  starts_at: z.string(),
  ends_at: z.string(),
  break_starts_at: z.string().optional(),
  break_ends_at: z.string().optional(),
})

export const schedulesSchema = z.object({
  barberName: z.string().min(2, "Nome do profissional é obrigatório"),
  schedules: z.array(scheduleItemSchema),
})

export type ScheduleItem = z.infer<typeof scheduleItemSchema>
export type SchedulesData = z.infer<typeof schedulesSchema>

// Full onboarding payload
export const onboardingPayloadSchema = z.object({
  name: z.string(),
  slug: z.string(),
  timezone: z.string(),
  planSlug: z.string(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  services: z.array(
    z.object({
      name: z.string(),
      duration_min: z.number(),
      price_cents: z.number(),
      description: z.string().optional(),
    })
  ),
  schedules: z.array(
    z.object({
      weekday: z.number(),
      starts_at: z.string(),
      ends_at: z.string(),
      break_starts_at: z.string().optional(),
      break_ends_at: z.string().optional(),
    })
  ),
  barberName: z.string(),
})

export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>

// Weekday helpers
export const WEEKDAYS = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda", short: "Seg" },
  { value: 2, label: "Terça", short: "Ter" },
  { value: 3, label: "Quarta", short: "Qua" },
  { value: 4, label: "Quinta", short: "Qui" },
  { value: 5, label: "Sexta", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
] as const

export const DEFAULT_SCHEDULES: ScheduleItem[] = WEEKDAYS.map((d) => ({
  weekday: d.value,
  enabled: d.value >= 1 && d.value <= 6, // seg-sáb
  starts_at: "09:00",
  ends_at: "19:00",
  break_starts_at: "12:00",
  break_ends_at: "13:00",
}))

export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: "1", name: "Corte de Cabelo", duration_min: 30, price_cents: 4000 },
  { id: "2", name: "Barba", duration_min: 20, price_cents: 2500 },
  { id: "3", name: "Corte + Barba", duration_min: 45, price_cents: 5500 },
]
