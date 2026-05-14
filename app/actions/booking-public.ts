"use server"

import { createClient } from "@/lib/supabase/server"
import { createBookingSchema, customerSchema } from "@/lib/booking/schema"

export interface PublicTenant {
  id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  primary_color: string | null
  address: string | null
  whatsapp: string | null
  instagram: string | null
  timezone: string
  min_advance_minutes: number
  max_advance_days: number
}

export interface PublicService {
  id: string
  name: string
  description: string | null
  duration_min: number
  price_cents: number
  category: string | null
  image_url: string | null
}

export interface PublicBarber {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  specialties: string[]
}

export async function getTenantBySlug(slug: string): Promise<PublicTenant | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tenants")
    .select(
      "id, slug, name, description, logo_url, cover_url, primary_color, address, whatsapp, instagram, timezone, min_advance_minutes, max_advance_days",
    )
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.log("[v0] getTenantBySlug error:", error.message)
    return null
  }
  return data as PublicTenant | null
}

export async function getPublicServices(tenantId: string): Promise<PublicService[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, duration_min, price_cents, category, image_url")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.log("[v0] getPublicServices error:", error.message)
    return []
  }
  return (data ?? []) as PublicService[]
}

export async function getPublicBarbers(
  tenantId: string,
  serviceId?: string,
): Promise<PublicBarber[]> {
  const supabase = await createClient()
  let query = supabase
    .from("barbers")
    .select("id, name, bio, avatar_url, specialties, barber_services(service_id)")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("name")

  const { data, error } = await query
  if (error) {
    console.log("[v0] getPublicBarbers error:", error.message)
    return []
  }

  let rows = (data ?? []) as Array<PublicBarber & { barber_services: { service_id: string }[] }>

  if (serviceId) {
    // se algum barbeiro tem mapeamento de serviços, filtra; senão retorna todos
    const anyMapped = rows.some((b) => b.barber_services?.length > 0)
    if (anyMapped) {
      rows = rows.filter((b) =>
        b.barber_services?.some((s) => s.service_id === serviceId),
      )
    }
  }

  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    bio: b.bio,
    avatar_url: b.avatar_url,
    specialties: b.specialties ?? [],
  }))
}

export interface SlotRow {
  slot_start: string
  slot_end: string
  barber_id: string
}

export async function getAvailableSlots(params: {
  tenantId: string
  serviceId: string
  barberId: string | null
  date: string // YYYY-MM-DD
}): Promise<SlotRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_tenant_id: params.tenantId,
    p_service_id: params.serviceId,
    p_barber_id: params.barberId,
    p_date: params.date,
  })
  if (error) {
    console.log("[v0] getAvailableSlots error:", error.message)
    return []
  }
  return (data ?? []) as SlotRow[]
}

export interface CreateBookingResult {
  ok: boolean
  bookingId?: string
  manageToken?: string
  error?: string
}

export async function createPublicBooking(input: unknown): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }
  const { tenantSlug, serviceId, barberId, startsAt, customer } = parsed.data
  const cust = customerSchema.safeParse(customer)
  if (!cust.success) {
    return { ok: false, error: cust.error.issues[0]?.message ?? "Dados do cliente inválidos" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("create_public_booking", {
    p_tenant_slug: tenantSlug,
    p_service_id: serviceId,
    p_barber_id: barberId,
    p_starts_at: startsAt,
    p_client_name: cust.data.name,
    p_client_phone: cust.data.phone,
    p_client_email: cust.data.email ?? "",
    p_notes: cust.data.notes ?? "",
  })

  if (error) {
    console.log("[v0] createPublicBooking error:", error.message)
    return { ok: false, error: error.message }
  }
  const row = Array.isArray(data) ? data[0] : data
  return { ok: true, bookingId: row.booking_id, manageToken: row.manage_token }
}

export interface BookingByToken {
  id: string
  tenant_slug: string
  tenant_name: string
  tenant_phone: string | null
  tenant_address: string | null
  service_name: string | null
  barber_name: string
  client_name: string
  client_phone: string | null
  client_email: string | null
  starts_at: string
  ends_at: string
  status: string
  total_cents: number
  notes: string | null
}

export async function getBookingByToken(token: string): Promise<BookingByToken | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_booking_by_token", { p_token: token })
  if (error) {
    console.log("[v0] getBookingByToken error:", error.message)
    return null
  }
  const row = Array.isArray(data) ? data[0] : data
  return (row ?? null) as BookingByToken | null
}

export async function cancelBookingByToken(token: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("cancel_booking_by_token", { p_token: token })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function rescheduleBookingByToken(
  token: string,
  newStart: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("reschedule_booking_by_token", {
    p_token: token,
    p_new_start: newStart,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
