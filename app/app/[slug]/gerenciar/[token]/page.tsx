import { notFound } from "next/navigation"
import { getBookingByToken } from "@/app/actions/booking-public"
import { checkSession } from "@/app/actions/otp"
import { ManageBookingView } from "@/components/booking/manage-view"
import { OtpGateWrapper } from "@/components/booking/otp-gate-wrapper"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string; token: string }>
}

export default async function ManagePage({ params }: Props) {
  const { slug, token } = await params
  const booking = await getBookingByToken(token)
  if (!booking || booking.tenant_slug !== slug) notFound()

  const hasSession = await checkSession(token)

  if (!hasSession) {
    return (
      <OtpGateWrapper
        manageToken={token}
        tenantName={booking.tenant_name}
        booking={booking}
      />
    )
  }

  return <ManageBookingView booking={booking} token={token} />
}
