import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarClock, MapPin, MessageCircle, Instagram, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getTenantBySlug,
  getPublicServices,
  getPublicBarbers,
} from "@/app/actions/booking-public"
import { formatCurrencyBR } from "@/lib/format"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TenantHome({ params }: Props) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const [services, barbers] = await Promise.all([
    getPublicServices(tenant.id),
    getPublicBarbers(tenant.id),
  ])

  return (
    <main className="mx-auto max-w-3xl pb-20">
      {/* HERO */}
      <section className="relative">
        <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-64">
          {tenant.cover_url ? (
            <Image
              src={tenant.cover_url || "/placeholder.svg"}
              alt={`Capa de ${tenant.name}`}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--tenant-primary) 0%, color-mix(in srgb, var(--tenant-primary) 60%, black) 100%)",
              }}
            />
          )}
        </div>

        <div className="px-4">
          <div className="-mt-12 flex items-end gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-background shadow-md">
              {tenant.logo_url ? (
                <Image
                  src={tenant.logo_url || "/placeholder.svg"}
                  alt={`Logo ${tenant.name}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-2xl font-bold text-white"
                  style={{ background: "var(--tenant-primary)" }}
                  aria-hidden="true"
                >
                  {tenant.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                {tenant.name}
              </h1>
              {tenant.description ? (
                <p className="mt-1 text-pretty text-sm text-muted-foreground">
                  {tenant.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {tenant.address ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {tenant.address}
              </span>
            ) : null}
            {tenant.whatsapp ? (
              <a
                href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            ) : null}
            {tenant.instagram ? (
              <a
                href={`https://instagram.com/${tenant.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {tenant.instagram}
              </a>
            ) : null}
          </div>

          <div className="mt-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto"
              style={{ background: "var(--tenant-primary)", color: "white" }}
            >
              <Link href={`/b/${tenant.slug}/agendar`}>
                <CalendarClock className="mr-2 h-4 w-4" aria-hidden="true" />
                Agendar horário
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="mt-10 px-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Serviços</h2>
          <span className="text-xs text-muted-foreground">
            {services.length} {services.length === 1 ? "serviço" : "serviços"}
          </span>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum serviço disponível no momento.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/b/${tenant.slug}/agendar?service=${s.id}`}
                className="group block"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-medium">{s.name}</h3>
                        {s.category ? (
                          <Badge variant="secondary" className="text-xs">
                            {s.category}
                          </Badge>
                        ) : null}
                      </div>
                      {s.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {s.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{s.duration_min} min</span>
                        <span className="font-semibold">{formatCurrencyBR(s.price_cents)}</span>
                      </div>
                    </div>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PROFISSIONAIS */}
      {barbers.length > 0 ? (
        <section className="mt-10 px-4">
          <h2 className="mb-4 text-lg font-semibold">Profissionais</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {barbers.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex flex-col items-center p-4 text-center">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                    {b.avatar_url ? (
                      <Image
                        src={b.avatar_url || "/placeholder.svg"}
                        alt={b.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {b.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium">{b.name}</p>
                  {b.specialties?.[0] ? (
                    <p className="truncate text-xs text-muted-foreground">{b.specialties[0]}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
