import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyTenant } from "@/app/actions/onboarding"
import { CardPaymentBrick } from "@/components/onboarding/card-payment-brick"

export const metadata = {
  title: "Cadastrar Cartao | AFT Barber",
  description: "Configure seu pagamento para ativar os 7 dias gratuitos",
}

export default async function CartaoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?next=/onboarding/cartao")

  const tenant = await getMyTenant()

  // Se não tem tenant, volta pro onboarding
  if (!tenant) redirect("/onboarding")

  // Se já está ativo ou trialing, vai pro dashboard
  if (
    tenant.out_status === "active" ||
    tenant.out_status === "trialing"
  ) {
    redirect("/dashboard")
  }

  // Busca dados do plano do tenant
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("name, plan_id, plans(name, price_cents, slug)")
    .eq("id", tenant.out_tenant_id)
    .single()

  const planName =
    (tenantRow?.plans as { name?: string } | null)?.name ?? "Starter"
  const priceCents =
    (tenantRow?.plans as { price_cents?: number } | null)?.price_cents ?? 7990
  const planSlug =
    (tenantRow?.plans as { slug?: string } | null)?.slug ?? "starter"

  return (
    <CardPaymentBrick
      tenantId={tenant.out_tenant_id}
      tenantName={tenant.out_tenant_name}
      planName={planName}
      planSlug={planSlug}
      priceCents={priceCents}
      userEmail={user.email ?? ""}
    />
  )
}
