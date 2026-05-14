function toICSDate(iso: string): string {
  // YYYYMMDDTHHmmssZ (UTC)
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  )
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;")
}

export function buildICS(params: {
  uid: string
  title: string
  description?: string
  location?: string
  startISO: string
  endISO: string
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AFTAgenda//Booking//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(params.startISO)}`,
    `DTEND:${toICSDate(params.endISO)}`,
    `SUMMARY:${escapeICS(params.title)}`,
    params.description ? `DESCRIPTION:${escapeICS(params.description)}` : "",
    params.location ? `LOCATION:${escapeICS(params.location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean)
  return lines.join("\r\n")
}

export function googleCalendarUrl(params: {
  title: string
  details?: string
  location?: string
  startISO: string
  endISO: string
}): string {
  const fmt = (iso: string) => toICSDate(iso)
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${fmt(params.startISO)}/${fmt(params.endISO)}`,
    details: params.details ?? "",
    location: params.location ?? "",
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}
