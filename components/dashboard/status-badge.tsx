import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/lib/types"

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200" },
  confirmed: { label: "Confirmado", className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200" },
  in_progress: { label: "Em andamento", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200" },
  completed: { label: "Concluído", className: "bg-emerald-600 text-white hover:bg-emerald-600 border-emerald-700" },
  no_show: { label: "Não compareceu", className: "bg-zinc-200 text-zinc-800 hover:bg-zinc-200 border-zinc-300" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200" },
}

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus
  className?: string
}) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn("font-medium", config.className, className)}>
      {config.label}
    </Badge>
  )
}

export const statusColorMap: Record<AppointmentStatus, string> = {
  pending: "border-l-amber-500 bg-amber-50",
  confirmed: "border-l-blue-500 bg-blue-50",
  in_progress: "border-l-emerald-500 bg-emerald-50",
  completed: "border-l-emerald-700 bg-emerald-100",
  no_show: "border-l-zinc-500 bg-zinc-100",
  cancelled: "border-l-red-500 bg-red-50",
}
