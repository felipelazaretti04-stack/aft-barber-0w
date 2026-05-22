# Configuração de E-mail — Resend + Supabase

## Pré-requisitos

1. Conta no [Resend](https://resend.com) com domínio verificado.
2. `RESEND_API_KEY` adicionada nas variáveis de ambiente do projeto (Vercel + `.env.local`).

## Verificar domínio no Resend

Acesse **Resend → Domains → Add Domain** e adicione os registros DNS informados:

| Tipo  | Nome                                         | Valor                            |
|-------|----------------------------------------------|----------------------------------|
| TXT   | `@` ou `aftbarber.com.br`                    | `v=spf1 include:spf.resend.com ~all` |
| CNAME | `resend1._domainkey.aftbarber.com.br`        | `resend1._domainkey.resend.com`  |
| CNAME | `resend2._domainkey.aftbarber.com.br`        | `resend2._domainkey.resend.com`  |
| TXT   | `_dmarc.aftbarber.com.br`                    | `v=DMARC1; p=none; rua=mailto:dmarc@aftbarber.com.br` |

Após adicionar, clique em **Verify** no dashboard do Resend. Pode levar até 60 minutos.

## Configurar SMTP no Supabase

Acesse **Supabase → Authentication → SMTP Settings** e preencha:

| Campo        | Valor                          |
|--------------|--------------------------------|
| Host         | `smtp.resend.com`              |
| Port         | `465`                          |
| User         | `resend`                       |
| Password     | `{RESEND_API_KEY}`             |
| Sender name  | `AFT Barber`                   |
| Sender email | `noreply@aftbarber.com.br`     |

Salve e teste clicando em **Send test email**.

## Próxima fase

Após confirmar o domínio verificado e o SMTP funcionando, implementar:

- `lib/email/resend.ts` — cliente Resend
- `lib/email/templates/` — templates React Email
  - `welcome.tsx` — boas-vindas após cadastro
  - `trial-ending.tsx` — aviso 3 dias antes do trial expirar
  - `payment-failed.tsx` — aviso de falha no pagamento
  - `reset-password.tsx` — e-mail de recuperação customizado
