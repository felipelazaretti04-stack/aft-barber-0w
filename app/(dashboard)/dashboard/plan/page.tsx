import { Suspense } from "react"
import { getBillingInfoAction } from "@/app/actions/billing"
import { PlanPageClient } from "@/components/dashboard/plan-page-client"
import { PageHeader } from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

async function PlanPageInner() {
  const data = await getBillingInfoAction()
  if (!data) redirect("/auth/login")

  return (
    <PlanPageClient
      tenantId={data.tenantId}
      billing={data.billing}
      plans={data.plans}
      invoices={data.invoices}
    />
  )
}

export default function PlanPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Plano e Faturamento"
        description="Gerencie sua assinatura e historico de pagamentos"
      />
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <PlanPageInner />
      </Suspense>
    </div>
  )
}
