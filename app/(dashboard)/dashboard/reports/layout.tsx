import type { ReactNode } from "react"
import { PlanGate } from "@/components/features/plan-gate"
import { getCurrentTenant } from "@/lib/queries/dashboard"

export default async function ReportsLayout({ children }: { children: ReactNode }) {
  const tenant = await getCurrentTenant()
  if (!tenant) return <>{children}</>

  return (
    <PlanGate
      tenantId={tenant.id}
      feature="analytics_advanced"
      featureName="Analytics Avançado"
      description="Acesse relatórios detalhados de faturamento, retenção de clientes e desempenho por profissional. Disponível no plano Pro."
    >
      {children}
    </PlanGate>
  )
}
