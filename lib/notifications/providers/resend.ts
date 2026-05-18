/**
 * Resend email provider (stub).
 * Para ativar: instale `resend`, defina RESEND_API_KEY e RESEND_FROM_EMAIL
 * e substitua o corpo deste método pela chamada real à API.
 *
 * Exemplo de uso real (descomente quando pronto):
 *   import { Resend } from "resend"
 *   const client = new Resend(process.env.RESEND_API_KEY)
 *   await client.emails.send({ from, to, subject, html: msg.body })
 */
import type { NotificationMessage, NotificationProvider } from "../types"

export const ResendProvider: NotificationProvider = {
  name: "resend",

  async send(msg: NotificationMessage) {
    if (msg.channel !== "email") {
      return { ok: false, error: "ResendProvider suporta apenas canal email" }
    }

    // --- stub: trocar pelo código abaixo quando integrar ---
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // const { error } = await resend.emails.send({
    //   from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
    //   to: msg.to,
    //   subject: msg.subject ?? "(sem assunto)",
    //   html: `<pre style="font-family:sans-serif">${msg.body}</pre>`,
    // })
    // if (error) return { ok: false, error: error.message }
    // return { ok: true }

    console.log(`[notifications:RESEND stub] to=${msg.to} subject="${msg.subject}"`)
    return { ok: true }
  },
}
