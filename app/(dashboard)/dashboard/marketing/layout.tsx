import type { ReactNode } from "react"
import { PlanGate } from "@/components/features/plan-gate"
import { MarketingTabs } from "@/components/dashboard/marketing-tabs"
import { getCurrentTenant } from "@/lib/queries/dashboard"

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const tenant = await getCurrentTenant()

  const content = <MarketingTabs>{children}</MarketingTabs>

  if (!tenant) return content

  return (
    <PlanGate
      tenantId={tenant.id}
      feature="whatsapp_notifications"
      featureName="Marketing e Automacoes"
      description="Crie campanhas, disparos de WhatsApp e automacoes para reter clientes. Disponivel no plano Pro."
    >
      {content}
    </PlanGate>
  )
}
