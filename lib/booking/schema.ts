import { z } from "zod"

// Telefone BR: aceita (11) 98888-7777, 11988887777, +55 11 98888-7777, etc.
const phoneRegex = /^(\+?55\s?)?\(?(\d{2})\)?\s?9?\d{4}-?\d{4}$/

export const customerSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo (mín. 3 caracteres)"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Telefone inválido. Ex: (11) 98888-7777"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .or(z.literal(""))
    .optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
})

export type CustomerInput = z.infer<typeof customerSchema>

export const createBookingSchema = z.object({
  tenantSlug: z.string().min(1),
  serviceId: z.string().uuid(),
  barberId: z.string().uuid(),
  startsAt: z.string().min(1), // ISO
  customer: customerSchema,
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export const rescheduleSchema = z.object({
  token: z.string().uuid(),
  newStart: z.string().min(1),
})

export function normalizePhoneBR(input: string): string {
  return input.replace(/\D/g, "")
}

export function maskPhoneBR(input: string): string {
  const d = normalizePhoneBR(input).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
