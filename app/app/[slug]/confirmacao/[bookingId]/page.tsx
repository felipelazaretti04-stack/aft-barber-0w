import { notFound } from "next/navigation"
import { getBookingByToken } from "@/app/actions/booking-public"
import { ConfirmationView } from "@/components/booking/confirmation-view"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string; bookingId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { slug, bookingId } = await params
  const sp = await searchParams
  if (!sp.token) notFound()

  const booking = await getBookingByToken(sp.token)
  if (!booking || booking.id !== bookingId || booking.tenant_slug !== slug) {
    notFound()
  }

  return <ConfirmationView booking={booking} token={sp.token} />
}
