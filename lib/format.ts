export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatPhone(phone: string): string {
  return phone
}

export function formatDateBR(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatTimeBR(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDateTimeBR(iso: string | Date): string {
  return `${formatDateBR(iso)} ${formatTimeBR(iso)}`
}

export function formatRelativeBR(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `há ${minutes} min`
  if (hours < 24) return `há ${hours}h`
  if (days < 30) return `há ${days} dias`
  return formatDateBR(date)
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}
