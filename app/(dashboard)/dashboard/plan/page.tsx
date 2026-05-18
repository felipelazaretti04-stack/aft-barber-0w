import { getBillingInfoAction } from "@/app/actions/billing"
import { PlanPageClient } from "@/components/dashboard/plan-page-client"
import { PageHeader } from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PlanPage() {
  const data = await getBillingInfoAction()
  if (!data) redirect("/auth/login")

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Plano e Faturamento"
        description="Gerencie sua assinatura e histórico de pagamentos"
      />
      <PlanPageClient
        tenantId={data.tenantId}
        billing={data.billing}
        plans={data.plans}
        invoices={data.invoices}
      />
    </div>
  )
}
