import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyTenant } from "@/app/actions/onboarding"
import { OnboardingWizard } from "@/components/onboarding/wizard"

export const metadata = {
  title: "Configure seu Negócio | BarberPRO",
  description: "Complete o cadastro do seu estabelecimento",
}

interface Props {
  searchParams: Promise<{ plan?: string }>
}

export default async function OnboardingPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/onboarding")
  }

  // Se já tem tenant, vai pro dashboard
  const tenant = await getMyTenant()
  if (tenant?.onboarding_completed_at) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const planSlug = params.plan || "free"

  // Busca nome do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard
        planSlug={planSlug}
        userName={profile?.full_name || user.email?.split("@")[0] || ""}
        userEmail={user.email || ""}
      />
    </div>
  )
}
