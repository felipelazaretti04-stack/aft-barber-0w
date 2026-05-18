/**
 * Console (stub) provider — usa console.log para simular envios.
 * Substituir por ResendProvider (email) ou ZApiProvider (WhatsApp)
 * quando as credenciais estiverem disponíveis.
 */
import type { NotificationMessage, NotificationProvider } from "../types"

export const ConsoleProvider: NotificationProvider = {
  name: "console",

  async send(msg: NotificationMessage) {
    console.log(
      `[notifications:${msg.channel.toUpperCase()}] to=${msg.to}${
        msg.subject ? ` subject="${msg.subject}"` : ""
      }\n${msg.body}`,
    )
    return { ok: true }
  },
}
