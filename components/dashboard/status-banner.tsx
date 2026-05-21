import { headers } from "next/headers"
import Link from "next/link"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Lê os headers injetados pelo middleware (x-tenant-grace / x-tenant-grace-ends).
 * Renderiza um banner fixo no topo do dashboard quando o tenant está em período de graça.
 * Server Component — sem estado cliente.
 */
export async function StatusBanner() {
  const headersList = await headers()
  const isGrace = headersList.get("x-tenant-grace") === "true"
  const graceEnds = headersList.get("x-tenant-grace-ends")

  if (!isGrace) return null

  let daysLeft: number | null = null
  if (graceEnds) {
    const end = new Date(graceEnds)
    daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center justify-between gap-3 bg-yellow-500 px-4 py-2.5 text-sm text-yellow-950"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span className="font-medium">
          Pagamento pendente.{" "}
          {daysLeft !== null && daysLeft > 0
            ? `Voce tem ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"} para regularizar.`
            : "Atualize seu cartao para manter o acesso."}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-yellow-700 bg-yellow-400 text-yellow-950 hover:bg-yellow-300"
        asChild
      >
        <Link href="/dashboard/plan">Atualizar cartao</Link>
      </Button>
    </div>
  )
}
