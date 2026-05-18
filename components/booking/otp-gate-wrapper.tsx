"use client"

import { useState } from "react"
import { OtpGate } from "./otp-gate"
import { ManageBookingView } from "./manage-view"
import type { BookingByToken } from "@/app/actions/booking-public"

interface Props {
  manageToken: string
  tenantName: string
  booking: BookingByToken
}

export function OtpGateWrapper({ manageToken, tenantName, booking }: Props) {
  const [verified, setVerified] = useState(false)

  if (!verified) {
    return (
      <OtpGate
        manageToken={manageToken}
        tenantName={tenantName}
        onVerified={() => setVerified(true)}
      />
    )
  }

  return <ManageBookingView booking={booking} token={manageToken} />
}
