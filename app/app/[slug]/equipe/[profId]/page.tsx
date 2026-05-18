import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ChevronRight,
  User,
  CalendarClock,
  Scissors,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTenantBySlug, getBarberById } from "@/app/actions/booking-public"
import { formatCurrencyBR } from "@/lib/format"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string; profId: string }>
}

function formatSlotDate(iso: string, tz: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: tz,
  })
}

function formatSlotTime(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  })
}

export default async function BarberPage({ params }: Props) {
  const { slug, profId } = await params

  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const barber = await getBarberById(profId, tenant.id)
  if (!barber) notFound()

  const tz = tenant.timezone ?? "America/Sao_Paulo"

  // Agrupa slots por data
  const slotsByDay = barber.nextSlots.reduce<
    Record<string, typeof barber.nextSlots>
  >((acc, s) => {
    const day = new Date(s.slot_start).toLocaleDateString("en-CA", { timeZone: tz })
    if (!acc[day]) acc[day] = []
    acc[day].push(s)
    return acc
  }, {})

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link href={`/app/${slug}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar
        </Link>
      </Button>

      {/* Profile header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-sm">
          {barber.avatar_url ? (
            <Image
              src={barber.avatar_url}
              alt={barber.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-xl font-bold text-foreground">{barber.name}</h1>
          {barber.specialties?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {barber.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs capitalize">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {barber.bio && (
        <p className="mb-6 leading-relaxed text-muted-foreground">{barber.bio}</p>
      )}

      {/* CTA principal */}
      <Button
        asChild
        size="lg"
        className="mb-8 w-full gap-2 text-base"
        style={{ background: "var(--tenant-primary)", color: "#fff" }}
      >
        <Link href={`/app/${slug}/agendar?profId=${profId}`}>
          Agendar com {barber.name.split(" ")[0]}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>

      {/* Próximos horários disponíveis */}
      {Object.keys(slotsByDay).length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            Próximos horários disponíveis
          </h2>
          <div className="space-y-4">
            {Object.entries(slotsByDay).map(([day, slots]) => (
              <div key={day}>
                <p className="mb-2 text-xs font-medium capitalize text-muted-foreground">
                  {formatSlotDate(slots[0].slot_start, tz)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <Link
                      key={s.slot_start}
                      href={`/app/${slug}/agendar?profId=${profId}&slot=${encodeURIComponent(s.slot_start)}`}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {formatSlotTime(s.slot_start, tz)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Serviços oferecidos */}
      {barber.services.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Scissors className="h-4 w-4" />
            Serviços oferecidos
          </h2>
          <ul className="space-y-3">
            {barber.services.map((svc) => (
              <li key={svc.id}>
                <Link
                  href={`/app/${slug}/servicos/${svc.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{svc.name}</p>
                    <p className="text-sm text-muted-foreground">{svc.duration_min} min</p>
                  </div>
                  <span className="shrink-0 font-semibold" style={{ color: "var(--tenant-primary)" }}>
                    {formatCurrencyBR(svc.price_cents)}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
