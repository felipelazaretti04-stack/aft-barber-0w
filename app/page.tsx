import { LandingHeader } from "@/components/landing/header"
import { LandingHero } from "@/components/landing/hero"
import { LandingFeatures } from "@/components/landing/features"
import { LandingPricing } from "@/components/landing/pricing"
import { LandingSocialProof } from "@/components/landing/social-proof"
import { LandingFAQ } from "@/components/landing/faq"
import { LandingCTA } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/footer"
import { getActivePlans } from "@/lib/queries/plans"

export const revalidate = 60

export default async function HomePage() {
  const plans = await getActivePlans()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingPricing plans={plans} />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
