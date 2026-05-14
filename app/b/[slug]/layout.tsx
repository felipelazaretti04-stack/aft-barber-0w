import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Toaster } from "sonner"
import { getTenantBySlug } from "@/app/actions/booking-public"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) return { title: "Negócio não encontrado" }
  return {
    title: `${tenant.name} · Agendamento online`,
    description: tenant.description ?? `Agende seu horário em ${tenant.name}`,
    openGraph: {
      title: tenant.name,
      description: tenant.description ?? undefined,
      images: tenant.cover_url ? [tenant.cover_url] : undefined,
    },
  }
}

export default async function TenantLayout({ params, children }: Props) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const primary = tenant.primary_color || "#0f172a"
  const styleVars = { ["--tenant-primary" as string]: primary } as React.CSSProperties

  return (
    <div className="min-h-dvh bg-background text-foreground" style={styleVars}>
      {children}
      <Toaster richColors position="top-center" />
    </div>
  )
}
