"use server"

import { createClient } from "@/lib/supabase/server"
import { DEFAULT_NOTIFICATION_SETTINGS } from "@/lib/notifications"
import type { TenantNotificationSettings } from "@/lib/notifications"

export async function getNotificationSettings(
  tenantId: string,
): Promise<TenantNotificationSettings> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("tenant_settings")
    .select("settings")
    .eq("tenant_id", tenantId)
    .maybeSingle()

  return (data?.settings?.notifications as TenantNotificationSettings) ?? DEFAULT_NOTIFICATION_SETTINGS
}

export async function saveNotificationSettings(
  tenantId: string,
  settings: TenantNotificationSettings,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("upsert_notification_settings", {
    p_tenant_id: tenantId,
    p_settings: { notifications: settings },
  })

  if (error) {
    console.log("[v0] saveNotificationSettings error:", error.message)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
