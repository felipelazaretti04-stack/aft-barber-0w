# Billing — Mercado Pago Subscriptions

## Visão Geral

O billing usa **Mercado Pago Preapproval (assinaturas recorrentes)**. Nenhum SDK é instalado no servidor — apenas `fetch` para manter o bundle pequeno. No front-end, o cliente é redirecionado para o `init_point` gerado pela API do MP.

---

## Planos

| Slug      | Nome       | Preco/mes | Barbeiros | Servicos | Analytics | Branding |
|-----------|------------|-----------|-----------|----------|-----------|----------|
| `free`    | Free       | R$ 0      | 1         | 5        | nao       | nao      |
| `pro`     | Pro        | R$ 49     | 5         | 30       | sim       | nao      |
| `premium` | Premium    | R$ 99     | ilimitado | ilimitado| sim       | sim      |

Os limites por plano sao controlados pela tabela `plan_features` (migration 10).

---

## Fluxo de Upgrade

```
Usuario clica "Assinar Pro"
  -> Server Action: createCheckoutAction("pro")
     -> getOrCreateMpPlan() — busca ou cria plano no MP
     -> createCheckoutUrl()  — gera preapproval com init_point
  -> redirect(init_point)   — usuario paga no site do MP
  -> MP redireciona para /dashboard/plan?success=1
  -> Webhook POST /api/webhooks/mercadopago
     -> upsert_billing_info() — atualiza tenant + subscription
```

## Fluxo de Cancelamento

```
Usuario clica "Cancelar plano"
  -> Server Action: cancelSubscriptionAction()
     -> cancelMpSubscription(mp_subscription_id)
     -> tenants.cancel_at_period_end = true
  -> Proximo webhook de periodo finaliza o downgrade
```

---

## Variaveis de Ambiente

| Variavel                    | Descricao                                       |
|-----------------------------|-------------------------------------------------|
| `MERCADOPAGO_ACCESS_TOKEN`  | Token de producao ou sandbox (prefixo `TEST-`)  |
| `MERCADOPAGO_WEBHOOK_SECRET`| Secret para validar assinatura HMAC do webhook  |
| `NEXT_PUBLIC_APP_URL`       | URL publica da app (ex: https://app.barberpro.com) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role para o webhook (bypass RLS)  |

---

## Webhook

**URL:** `POST /api/webhooks/mercadopago`

Configurar no painel do MP em **Configuracoes > Notificacoes IPN** apontando para a URL publica.

### Eventos processados

| `type`                      | Acao                                             |
|-----------------------------|--------------------------------------------------|
| `subscription_preapproval`  | Chama `upsert_billing_info` — atualiza plano/status |
| `payment`                   | Upsert em `invoices` com status do pagamento     |

### Validacao de assinatura

A funcao `validateWebhookSignature` em `lib/mercadopago.ts` esta pronta para HMAC-SHA256.
Ative definindo `MERCADOPAGO_WEBHOOK_SECRET` e implementando a comparacao com o header `x-signature`.

---

## Banco de Dados

### Tabelas relevantes

- `tenants.mp_subscription_id` — ID da preapproval no MP
- `tenants.mp_customer_id` — payer_id do MP
- `tenants.cancel_at_period_end` — true quando cancelamento agendado
- `tenants.status` — `trial | active | suspended | canceled`
- `invoices` — historico de pagamentos (upsert por `mp_payment_id`)
- `subscriptions` — periodo ativo atual (upsert por `tenant_id`)
- `plan_features` — feature flags e limites por plano

### RPCs

| RPC                    | Caller          | Descricao                              |
|------------------------|-----------------|----------------------------------------|
| `get_billing_info`     | authenticated   | Retorna dados consolidados para a UI   |
| `upsert_billing_info`  | service_role    | Atualiza plano apos webhook            |

---

## Sandbox (Testes)

1. Use um `ACCESS_TOKEN` com prefixo `TEST-` do painel do MP.
2. Use cartoes de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards
3. Para receber webhooks localmente, use `ngrok http 3000` e configure a URL no painel do MP.

---

## Arquivos

```
lib/mercadopago.ts                              # Cliente HTTP (sem SDK)
app/actions/billing.ts                          # Server Actions (checkout, cancel, getBillingInfo)
app/api/webhooks/mercadopago/route.ts           # Webhook handler
app/(dashboard)/dashboard/plan/page.tsx         # Pagina de plano (RSC)
components/dashboard/plan-page-client.tsx       # UI completa (cards, faturas, upgrade)
```
