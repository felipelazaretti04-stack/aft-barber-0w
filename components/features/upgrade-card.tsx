import Link from "next/link"
import { Lock, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PLAN_META, type PlanSlug } from "@/lib/features"

interface UpgradeCardProps {
  featureName: string
  description?: string
  requiredPlan: PlanSlug
  variant?: "full" | "inline"
  className?: string
}

export function UpgradeCard({
  featureName,
  description,
  requiredPlan,
  variant = "full",
  className,
}: UpgradeCardProps) {
  const planMeta = PLAN_META[requiredPlan]

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg border border-dashed border-border bg-muted/30 p-4",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-none">{featureName}</p>
            <p className="text-xs text-muted-foreground">
              Disponível no plano {planMeta.name}
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="default">
          <Link href="/dashboard/plan">Upgrade</Link>
        </Button>
      </div>
    )
  }

  return (
    <Card className={cn("relative overflow-hidden border-dashed", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <CardContent className="relative flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Plano {planMeta.name}
          </Badge>
          <h3 className="text-lg font-semibold text-balance">{featureName}</h3>
          {description && (
            <p className="max-w-sm text-pretty text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/dashboard/plan" className="gap-2">
            Fazer upgrade
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
