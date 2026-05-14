import { notFound } from "next/navigation"
import { getBookingByToken } from "@/app/actions/booking-public"
import { ManageBookingView } from "@/components/booking/manage-view"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string; token: string }>
}

export default async function ManagePage({ params }: Props) {
  const { slug, token } = await params
  const booking = await getBookingByToken(token)
  if (!booking || booking.tenant_slug !== slug) notFound()

  return <ManageBookingView booking={booking} token={token} />
}
