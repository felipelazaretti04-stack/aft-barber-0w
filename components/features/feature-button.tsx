"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFeature } from "@/lib/features/context"
import type { FeatureKey } from "@/lib/features"
import { cn } from "@/lib/utils"

interface FeatureButtonProps extends ButtonProps {
  feature: FeatureKey
  featureLabel?: string
  children: React.ReactNode
}

/**
 * Botão que automaticamente:
 * - desabilita e mostra tooltip de upgrade se feature bloqueada / no limite
 * - executa normalmente caso contrário
 */
export function FeatureButton({
  feature,
  featureLabel,
  children,
  className,
  disabled,
  ...props
}: FeatureButtonProps) {
  const { enabled, isAtLimit, limit, currentUsage } = useFeature(feature)
  const blocked = !enabled || isAtLimit

  if (blocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="outline"
              className={cn("gap-2", className)}
            >
              <Link href="/dashboard/plan">
                <Lock className="h-4 w-4" />
                {children}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!enabled ? (
              <p>
                {featureLabel ?? "Recurso"} disponível em planos superiores.{" "}
                <span className="font-medium">Fazer upgrade</span>
              </p>
            ) : (
              <p>
                Limite atingido ({currentUsage}/{limit}).{" "}
                <span className="font-medium">Fazer upgrade</span>
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button className={className} disabled={disabled} {...props}>
      {children}
    </Button>
  )
}
