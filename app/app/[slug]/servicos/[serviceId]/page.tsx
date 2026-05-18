import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, ArrowLeft, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTenantBySlug, getServiceById } from "@/app/actions/booking-public"
import { formatCurrencyBR } from "@/lib/format"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string; serviceId: string }>
}

export default async function ServicePage({ params }: Props) {
  const { slug, serviceId } = await params

  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const service = await getServiceById(serviceId, tenant.id)
  if (!service) notFound()

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link href={`/app/${slug}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar
        </Link>
      </Button>

      {/* Hero image */}
      {service.image_url ? (
        <div className="relative mb-6 h-52 w-full overflow-hidden rounded-2xl bg-muted sm:h-64">
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div
          className="mb-6 flex h-32 w-full items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--tenant-primary) 0%, color-mix(in srgb, var(--tenant-primary) 60%, black) 100%)",
          }}
        >
          <span className="text-4xl font-bold text-white/80">
            {service.name.charAt(0)}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="mb-6">
        {service.category && (
          <Badge variant="secondary" className="mb-2 capitalize">
            {service.category}
          </Badge>
        )}
        <h1 className="text-2xl font-bold text-foreground">{service.name}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="text-2xl font-semibold" style={{ color: "var(--tenant-primary)" }}>
            {formatCurrencyBR(service.price_cents)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {service.duration_min} min
          </span>
        </div>

        {service.description && (
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        )}
      </div>

      {/* CTA principal */}
      <Button
        asChild
        size="lg"
        className="mb-8 w-full gap-2 text-base"
        style={{ background: "var(--tenant-primary)", color: "#fff" }}
      >
        <Link href={`/app/${slug}/agendar?serviceId=${serviceId}`}>
          Agendar este serviço
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>

      {/* Profissionais */}
      {service.barbers.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Profissionais que atendem
          </h2>
          <ul className="space-y-3">
            {service.barbers.map((barber) => (
              <li key={barber.id}>
                <Link
                  href={`/app/${slug}/equipe/${barber.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {barber.avatar_url ? (
                      <Image
                        src={barber.avatar_url}
                        alt={barber.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{barber.name}</p>
                    {barber.specialties?.length > 0 && (
                      <p className="truncate text-sm text-muted-foreground">
                        {barber.specialties.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
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
