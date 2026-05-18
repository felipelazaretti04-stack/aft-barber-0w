"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { send } from "@/lib/notifications"

const SESSION_COOKIE = "booking_session"
const SESSION_TTL = 30 * 60 // 30 min in seconds

// Retorna o nome do cookie com o manage_token para isolar sessões por booking
function cookieName(manageToken: string) {
  return `${SESSION_COOKIE}_${manageToken.slice(0, 8)}`
}

// ----------------------------------------------------------------
// requestOtp: chama RPC, envia notificação e retorna otp_id + canal
// ----------------------------------------------------------------
export async function requestOtp(manageToken: string): Promise<{
  ok: boolean
  otpId?: string
  channel?: string
  maskedRecipient?: string
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc("request_booking_otp", { p_manage_token: manageToken })
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Erro ao gerar código" }
  }

  const { out_otp_id, out_channel, out_recipient, out_code } = data as {
    out_otp_id: string
    out_channel: string
    out_recipient: string
    out_code: string
  }

  // Envia notificação via lib/notifications
  await send(out_channel as "email" | "whatsapp", out_recipient, "otp_code", {
    otpCode: out_code,
    otpExpiresMinutes: 10,
  })

  // Mascara o destinatário para exibir na UI
  const masked =
    out_channel === "email"
      ? out_recipient.replace(/(.{2}).+(@.+)/, "$1***$2")
      : out_recipient.replace(/(\d{2})\d+(\d{4})/, "$1*****$2")

  return {
    ok: true,
    otpId: out_otp_id,
    channel: out_channel,
    maskedRecipient: masked,
  }
}

// ----------------------------------------------------------------
// verifyOtp: valida código, define cookie de sessão
// ----------------------------------------------------------------
export async function verifyOtp(
  otpId: string,
  code: string,
  manageToken: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc("verify_booking_otp", { p_otp_id: otpId, p_code: code.trim() })
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Erro ao verificar código" }
  }

  const { out_valid, out_session_token, out_error } = data as {
    out_valid: boolean
    out_session_token: string | null
    out_error: string | null
  }

  if (!out_valid || !out_session_token) {
    return { ok: false, error: out_error ?? "Código inválido" }
  }

  // Persiste session token em cookie HTTP-only
  const jar = await cookies()
  jar.set(cookieName(manageToken), out_session_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL,
    path: "/",
  })

  return { ok: true }
}

// ----------------------------------------------------------------
// checkSession: verifica se a sessão OTP ainda é válida
// ----------------------------------------------------------------
export async function checkSession(manageToken: string): Promise<boolean> {
  const jar = await cookies()
  const sessionToken = jar.get(cookieName(manageToken))?.value
  if (!sessionToken) return false

  const supabase = await createClient()
  const { data } = await supabase.rpc("validate_booking_session", {
    p_manage_token: manageToken,
    p_session_token: sessionToken,
  })
  return data === true
}

// ----------------------------------------------------------------
// clearSession: remove cookie (logout)
// ----------------------------------------------------------------
export async function clearSession(manageToken: string): Promise<void> {
  const jar = await cookies()
  jar.delete(cookieName(manageToken))
}
