/**
 * Z-API / Evolution API WhatsApp provider (stub).
 * Para ativar: defina ZAPI_INSTANCE_ID e ZAPI_TOKEN (Z-API)
 * ou EVOLUTION_API_URL + EVOLUTION_API_KEY (Evolution API).
 *
 * Exemplo real para Z-API (descomente quando pronto):
 *   const url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`
 *   await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ phone: msg.to.replace(/\D/g, ""), message: msg.body }) })
 */
import type { NotificationMessage, NotificationProvider } from "../types"

export const ZApiProvider: NotificationProvider = {
  name: "zapi",

  async send(msg: NotificationMessage) {
    if (msg.channel !== "whatsapp") {
      return { ok: false, error: "ZApiProvider suporta apenas canal whatsapp" }
    }

    // --- stub ---
    // const phone = msg.to.replace(/\D/g, "")
    // const res = await fetch(
    //   `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`,
    //   { method: "POST", headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ phone, message: msg.body }) }
    // )
    // if (!res.ok) return { ok: false, error: `Z-API status ${res.status}` }
    // return { ok: true }

    console.log(`[notifications:ZAPI stub] to=${msg.to}\n${msg.body}`)
    return { ok: true }
  },
}
