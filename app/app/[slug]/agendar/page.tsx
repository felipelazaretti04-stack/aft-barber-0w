import { notFound } from "next/navigation"
import {
  getTenantBySlug,
  getPublicServices,
  getPublicBarbers,
} from "@/app/actions/booking-public"
import { BookingWizard } from "@/components/booking/wizard"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ service?: string; barber?: string }>
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  // Aceita serviceId (novo) ou service (legado)
  const initialServiceId = sp.serviceId ?? sp.service
  // Aceita profId (novo) ou barber (legado)
  const initialBarberId = sp.profId ?? sp.barber
  const initialSlot = sp.slot

  const [services, barbers] = await Promise.all([
    getPublicServices(tenant.id),
    getPublicBarbers(tenant.id),
  ])

  return (
    <BookingWizard
      tenant={tenant}
      services={services}
      barbers={barbers}
      initialServiceId={initialServiceId}
      initialBarberId={initialBarberId}
      initialSlot={initialSlot}
    />
  )
}
