import type {
  Automation,
  BookingRules,
  Campaign,
  CustomForm,
  FilledForm,
  Flyer,
  Giftcard,
  GiftcardTemplate,
  LoyaltyConfig,
  NotificationTemplate,
  PackageBalance,
  Promotion,
  Resource,
  SafetyRule,
  ServicePackage,
  Subscriber,
  Subscription,
  TeamMember,
  WaitlistEntry,
} from "./types"

const today = new Date()
function isoOffset(daysOffset: number, hour = 10): string {
  const d = new Date(today)
  d.setDate(d.getDate() + daysOffset)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const campaigns: Campaign[] = [
  {
    id: "camp_1",
    tenant_id: "tenant_1",
    name: "Promoção de Outono - Combo 20% off",
    channel: "whatsapp",
    status: "sent",
    audience: "Clientes VIP",
    audience_count: 45,
    message: "Olá {nome}! Outubro tem 20% de desconto no Combo Corte+Barba. Agende já!",
    sent_at: isoOffset(-3),
    open_rate: 0.82,
    click_rate: 0.34,
  },
  {
    id: "camp_2",
    tenant_id: "tenant_1",
    name: "Volta às aulas - Corte Infantil",
    channel: "sms",
    status: "scheduled",
    audience: "Clientes com filhos",
    audience_count: 28,
    message: "Volta às aulas chegando! Corte infantil por R$30 até dia 15.",
    scheduled_at: isoOffset(2, 9),
  },
  {
    id: "camp_3",
    tenant_id: "tenant_1",
    name: "Lançamento Pigmentação de Barba",
    channel: "email",
    status: "sent",
    audience: "Todos os clientes",
    audience_count: 312,
    message: "Conheça nosso novo serviço de pigmentação de barba.",
    sent_at: isoOffset(-15),
    open_rate: 0.41,
    click_rate: 0.12,
  },
  {
    id: "camp_4",
    tenant_id: "tenant_1",
    name: "Black Friday Barbearia",
    channel: "whatsapp",
    status: "draft",
    audience: "Todos os clientes",
    audience_count: 312,
    message: "",
  },
]

export const automations: Automation[] = [
  {
    id: "auto_1",
    tenant_id: "tenant_1",
    name: "Mensagem de Aniversário",
    trigger: "birthday",
    channel: "whatsapp",
    active: true,
    delay_days: 0,
    message: "Feliz aniversário, {nome}! Ganhe 15% de desconto em qualquer serviço esse mês.",
    triggered_count: 47,
  },
  {
    id: "auto_2",
    tenant_id: "tenant_1",
    name: "Boas-vindas Primeira Visita",
    trigger: "first_visit",
    channel: "whatsapp",
    active: true,
    delay_days: 1,
    message: "Obrigado pela visita, {nome}! Esperamos você de volta. Agende em {link}.",
    triggered_count: 23,
  },
  {
    id: "auto_3",
    tenant_id: "tenant_1",
    name: "Cliente Sumido",
    trigger: "missed_client",
    channel: "sms",
    active: true,
    delay_days: 60,
    message: "Saudades, {nome}! Faz 2 meses que não te vemos. Que tal um corte novo?",
    triggered_count: 18,
  },
  {
    id: "auto_4",
    tenant_id: "tenant_1",
    name: "Volte em 30 dias",
    trigger: "comeback",
    channel: "whatsapp",
    active: false,
    delay_days: 30,
    message: "Hora de manter o visual em dia, {nome}! Agende seu próximo corte.",
    triggered_count: 0,
  },
]

export const promotions: Promotion[] = [
  {
    id: "promo_1",
    tenant_id: "tenant_1",
    name: "Happy Hour Quinta-feira",
    type: "happy_hour",
    discount_pct: 25,
    starts_at: isoOffset(0, 14),
    ends_at: isoOffset(0, 17),
    service_ids: ["svc_1", "svc_2"],
    active: true,
    uses: 12,
  },
  {
    id: "promo_2",
    tenant_id: "tenant_1",
    name: "Última Hora - Slots Vazios",
    type: "last_minute",
    discount_pct: 15,
    starts_at: isoOffset(-30),
    ends_at: isoOffset(60),
    service_ids: ["svc_1", "svc_2", "svc_3"],
    active: true,
    uses: 34,
  },
  {
    id: "promo_3",
    tenant_id: "tenant_1",
    name: "Venda Rápida Sexta",
    type: "flash",
    discount_pct: 30,
    starts_at: isoOffset(2, 9),
    ends_at: isoOffset(2, 12),
    service_ids: ["svc_3"],
    active: false,
    uses: 0,
  },
]

export const flyers: Flyer[] = [
  { id: "fly_1", tenant_id: "tenant_1", name: "Black Friday 2026", template: "minimal-dark", preview_url: "/flyer-black-friday.jpg", created_at: isoOffset(-5) },
  { id: "fly_2", tenant_id: "tenant_1", name: "Combo do Mês", template: "bold-red", preview_url: "/flyer-combo.jpg", created_at: isoOffset(-12) },
  { id: "fly_3", tenant_id: "tenant_1", name: "Dia dos Pais", template: "vintage", preview_url: "/flyer-fathers-day.jpg", created_at: isoOffset(-30) },
]

export const flyerTemplates = [
  { id: "minimal-dark", name: "Minimal Dark", preview_url: "/template-minimal-dark.jpg" },
  { id: "bold-red", name: "Bold Red", preview_url: "/template-bold-red.jpg" },
  { id: "vintage", name: "Vintage", preview_url: "/template-vintage.jpg" },
  { id: "modern-gold", name: "Modern Gold", preview_url: "/template-modern-gold.jpg" },
  { id: "barber-classic", name: "Barber Classic", preview_url: "/template-barber-classic.jpg" },
  { id: "neon", name: "Neon Night", preview_url: "/template-neon.jpg" },
]

export const giftcardTemplates: GiftcardTemplate[] = [
  { id: "gc_t1", tenant_id: "tenant_1", name: "Cartão R$50", amount: 50, cover_url: "/giftcard-50.jpg", active: true },
  { id: "gc_t2", tenant_id: "tenant_1", name: "Cartão R$100", amount: 100, cover_url: "/giftcard-100.jpg", active: true },
  { id: "gc_t3", tenant_id: "tenant_1", name: "Cartão R$200", amount: 200, cover_url: "/giftcard-200.jpg", active: true },
  { id: "gc_t4", tenant_id: "tenant_1", name: "Cartão Especial Dia dos Pais", amount: 150, cover_url: "/giftcard-fathers.jpg", active: false },
]

export const giftcards: Giftcard[] = [
  { id: "gc_1", tenant_id: "tenant_1", code: "AFTB-2X8K-9LM2", amount: 100, balance: 75, buyer_name: "João Silva", recipient_name: "Carlos Silva", status: "active", created_at: isoOffset(-20), expires_at: isoOffset(345) },
  { id: "gc_2", tenant_id: "tenant_1", code: "AFTB-5K2P-7NQ4", amount: 200, balance: 200, buyer_name: "Mariana Costa", recipient_name: "Roberto Costa", status: "active", created_at: isoOffset(-5), expires_at: isoOffset(360) },
  { id: "gc_3", tenant_id: "tenant_1", code: "AFTB-9P3M-2RS8", amount: 50, balance: 0, buyer_name: "Pedro Almeida", recipient_name: "Pedro Almeida", status: "redeemed", created_at: isoOffset(-45), expires_at: isoOffset(320) },
  { id: "gc_4", tenant_id: "tenant_1", code: "AFTB-1A2B-3C4D", amount: 100, balance: 100, buyer_name: "Sofia Lima", recipient_name: "Bruno Lima", status: "active", created_at: isoOffset(-2), expires_at: isoOffset(363) },
]

export const subscriptions: Subscription[] = [
  {
    id: "sub_1",
    tenant_id: "tenant_1",
    name: "Corte Ilimitado Mensal",
    price_month: 149,
    benefits: ["Cortes ilimitados", "1 barba grátis por mês", "Reserva prioritária"],
    active: true,
    subscribers: 18,
  },
  {
    id: "sub_2",
    tenant_id: "tenant_1",
    name: "Plano Barba Pro",
    price_month: 89,
    benefits: ["4 barbas por mês", "Hidratação inclusa", "Desconto de 10% em produtos"],
    active: true,
    subscribers: 7,
  },
  {
    id: "sub_3",
    tenant_id: "tenant_1",
    name: "Plano Premium VIP",
    price_month: 299,
    benefits: ["Tudo ilimitado", "Cabine privativa", "Whisky por conta", "Atendimento sem espera"],
    active: true,
    subscribers: 3,
  },
]

export const subscribers: Subscriber[] = [
  { id: "sb_1", client_id: "cli_1", client_name: "João Silva", subscription_id: "sub_1", subscription_name: "Corte Ilimitado Mensal", started_at: isoOffset(-90), next_charge: isoOffset(5), status: "active" },
  { id: "sb_2", client_id: "cli_2", client_name: "Pedro Almeida", subscription_id: "sub_3", subscription_name: "Plano Premium VIP", started_at: isoOffset(-180), next_charge: isoOffset(12), status: "active" },
  { id: "sb_3", client_id: "cli_6", client_name: "Ricardo Santos", subscription_id: "sub_1", subscription_name: "Corte Ilimitado Mensal", started_at: isoOffset(-45), next_charge: isoOffset(15), status: "active" },
  { id: "sb_4", client_id: "cli_4", client_name: "Felipe Costa", subscription_id: "sub_2", subscription_name: "Plano Barba Pro", started_at: isoOffset(-60), next_charge: isoOffset(0, 12), status: "paused" },
]

export const servicePackages: ServicePackage[] = [
  { id: "pkg_1", tenant_id: "tenant_1", name: "5 Cortes", service_id: "svc_1", service_name: "Corte Masculino Clássico", total_sessions: 5, price: 200, active: true, sold: 23 },
  { id: "pkg_2", tenant_id: "tenant_1", name: "10 Combos", service_id: "svc_3", service_name: "Combo Corte + Barba", total_sessions: 10, price: 650, active: true, sold: 12 },
  { id: "pkg_3", tenant_id: "tenant_1", name: "3 Hidratações", service_id: "svc_4", service_name: "Hidratação Capilar", total_sessions: 3, price: 150, active: true, sold: 8 },
]

export const packageBalances: PackageBalance[] = [
  { id: "pb_1", client_id: "cli_1", client_name: "João Silva", package_id: "pkg_1", package_name: "5 Cortes", remaining: 3, total: 5, bought_at: isoOffset(-15) },
  { id: "pb_2", client_id: "cli_2", client_name: "Pedro Almeida", package_id: "pkg_2", package_name: "10 Combos", remaining: 7, total: 10, bought_at: isoOffset(-30) },
  { id: "pb_3", client_id: "cli_6", client_name: "Ricardo Santos", package_id: "pkg_2", package_name: "10 Combos", remaining: 2, total: 10, bought_at: isoOffset(-90) },
  { id: "pb_4", client_id: "cli_4", client_name: "Felipe Costa", package_id: "pkg_3", package_name: "3 Hidratações", remaining: 1, total: 3, bought_at: isoOffset(-45) },
]

export const loyaltyConfig: LoyaltyConfig = {
  active: true,
  points_per_real: 1,
  rewards: [
    { id: "rw_1", name: "Desconto de R$15", points: 100, type: "discount", value: 15 },
    { id: "rw_2", name: "Corte Grátis", points: 250, type: "service", value: 45 },
    { id: "rw_3", name: "Combo Grátis", points: 400, type: "service", value: 75 },
    { id: "rw_4", name: "Desconto de R$50", points: 500, type: "discount", value: 50 },
  ],
}

export const waitlistEntries: WaitlistEntry[] = [
  {
    id: "wl_1",
    tenant_id: "tenant_1",
    client_id: "cli_3",
    client_name: "Mateus Rocha",
    client_phone: "(11) 93333-3333",
    service_id: "svc_3",
    service_name: "Combo Corte + Barba",
    barber_id: "barber_1",
    barber_name: "Carlos Mendes",
    preferred_period: "Tarde",
    preferred_dates: "Sex 02/05 ou Sáb 03/05",
    notes: "Tem evento no sábado à noite",
    created_at: isoOffset(-1, 14),
    status: "waiting",
  },
  {
    id: "wl_2",
    tenant_id: "tenant_1",
    client_id: "cli_4",
    client_name: "Felipe Costa",
    client_phone: "(11) 94444-4444",
    service_id: "svc_2",
    service_name: "Barba Completa",
    preferred_period: "Manhã",
    preferred_dates: "Qualquer dia da semana",
    notes: "",
    created_at: isoOffset(0, 9),
    status: "waiting",
  },
  {
    id: "wl_3",
    tenant_id: "tenant_1",
    client_id: "cli_8",
    client_name: "Henrique Dias",
    client_phone: "(11) 98888-9999",
    service_id: "svc_1",
    service_name: "Corte Masculino Clássico",
    barber_id: "barber_2",
    barber_name: "Rafael Souza",
    preferred_period: "Noite",
    preferred_dates: "Quinta ou sexta",
    notes: "Chegou no final do expediente",
    created_at: isoOffset(0, 17),
    status: "notified",
  },
]

export const resources: Resource[] = [
  { id: "res_1", tenant_id: "tenant_1", name: "Cadeira 1 - Premium", type: "chair", description: "Cadeira hidráulica importada com massagem", active: true },
  { id: "res_2", tenant_id: "tenant_1", name: "Cadeira 2", type: "chair", description: "Cadeira clássica de couro", active: true },
  { id: "res_3", tenant_id: "tenant_1", name: "Cadeira 3", type: "chair", description: "Cadeira clássica de couro", active: true },
  { id: "res_4", tenant_id: "tenant_1", name: "Sala de Tintura", type: "room", description: "Sala isolada com ventilação especial", active: true },
  { id: "res_5", tenant_id: "tenant_1", name: "Cabine VIP", type: "room", description: "Atendimento privativo", active: true },
  { id: "res_6", tenant_id: "tenant_1", name: "Aparelho de Vapor", type: "equipment", description: "Para tratamentos de hidratação", active: false },
]

export const customForms: CustomForm[] = [
  {
    id: "form_1",
    tenant_id: "tenant_1",
    name: "Anamnese Capilar",
    description: "Formulário de avaliação antes de tratamentos químicos",
    required: true,
    active: true,
    applied_services: ["svc_4", "svc_5"],
    fields: [
      { id: "f1", label: "Você possui alguma alergia?", type: "textarea", required: true },
      { id: "f2", label: "Já fez química alguma vez?", type: "select", required: true, options: ["Sim", "Não"] },
      { id: "f3", label: "Quando foi a última química?", type: "text", required: false },
      { id: "f4", label: "Aceito os termos do tratamento", type: "checkbox", required: true },
    ],
  },
  {
    id: "form_2",
    tenant_id: "tenant_1",
    name: "Cadastro Inicial",
    description: "Dados básicos para primeira visita",
    required: false,
    active: true,
    applied_services: [],
    fields: [
      { id: "f1", label: "Como nos conheceu?", type: "select", required: true, options: ["Google", "Instagram", "Indicação", "Outro"] },
      { id: "f2", label: "Quais produtos costuma usar?", type: "textarea", required: false },
    ],
  },
  {
    id: "form_3",
    tenant_id: "tenant_1",
    name: "Termo de Pigmentação",
    description: "Consentimento informado para pigmentação",
    required: true,
    active: false,
    applied_services: ["svc_5"],
    fields: [
      { id: "f1", label: "Aceito os riscos do procedimento", type: "checkbox", required: true },
    ],
  },
]

export const filledForms: FilledForm[] = [
  {
    id: "ff_1",
    client_id: "cli_1",
    form_id: "form_1",
    form_name: "Anamnese Capilar",
    filled_at: isoOffset(-30),
    answers: [
      { question: "Você possui alguma alergia?", answer: "Alérgico a pomadas com álcool" },
      { question: "Já fez química alguma vez?", answer: "Não" },
      { question: "Aceito os termos do tratamento", answer: "Sim" },
    ],
  },
]

export const notificationTemplates: NotificationTemplate[] = [
  { id: "nt_1", channel: "whatsapp", event: "confirmation", body: "Olá {nome}! Seu agendamento foi confirmado para {data} às {hora} com {barbeiro}. Endereço: {endereco}", active: true },
  { id: "nt_2", channel: "whatsapp", event: "reminder_24h", body: "Lembrete: amanhã às {hora} você tem horário marcado conosco. Te esperamos!", active: true },
  { id: "nt_3", channel: "whatsapp", event: "reminder_1h", body: "Em 1 hora! Seu horário começa às {hora}. Já estamos te esperando.", active: true },
  { id: "nt_4", channel: "whatsapp", event: "thank_you", body: "Obrigado pela visita, {nome}! Que tal deixar uma avaliação? {link}", active: true },
  { id: "nt_5", channel: "whatsapp", event: "comeback", body: "Faz tempo que não te vemos por aqui, {nome}! Que tal agendar?", active: false },
  { id: "nt_6", channel: "sms", event: "confirmation", body: "AFT Barber: Agendamento confirmado para {data} às {hora}.", active: true },
  { id: "nt_7", channel: "sms", event: "reminder_24h", body: "AFT Barber: Lembrete de horário amanhã às {hora}.", active: true },
  { id: "nt_8", channel: "email", event: "confirmation", subject: "Seu horário está confirmado", body: "<p>Olá {nome},</p><p>Seu agendamento foi confirmado.</p>", active: true },
  { id: "nt_9", channel: "email", event: "thank_you", subject: "Obrigado pela visita!", body: "<p>Olá {nome},</p><p>Foi ótimo te receber. Esperamos você de volta!</p>", active: true },
]

export const bookingRules: BookingRules = {
  min_advance_minutes: 30,
  max_advance_days: 60,
  cancel_min_advance_hours: 4,
  reschedule_min_advance_hours: 2,
  require_confirmation: true,
  require_card: false,
  no_show_fee: 25,
}

export const safetyRules: SafetyRule[] = [
  { id: "sr_1", title: "Toalhas descartáveis", description: "Usamos toalhas descartáveis em todos os atendimentos", icon: "shield", active: true },
  { id: "sr_2", title: "Esterilização de equipamentos", description: "Todos os utensílios são esterilizados após cada uso", icon: "sparkles", active: true },
  { id: "sr_3", title: "Higienização da estação", description: "Cadeira e bancada higienizadas entre clientes", icon: "spray-can", active: true },
  { id: "sr_4", title: "Profissionais vacinados", description: "Equipe com vacinação em dia", icon: "syringe", active: false },
]

export const teamMembers: TeamMember[] = [
  { id: "tm_1", name: "Sebastião Oliveira", email: "tiao@barbearia.com", avatar_url: "/middle-aged-barber.jpg", role: "owner", active: true, last_login: isoOffset(0, 8) },
  { id: "tm_2", name: "Maria Costa", email: "maria@barbearia.com", avatar_url: "/professional-woman.png", role: "manager", active: true, last_login: isoOffset(-1, 18) },
  { id: "tm_3", name: "Carlos Mendes", email: "carlos@barbearia.com", avatar_url: "/barber-portrait.jpg", role: "senior_barber", active: true, last_login: isoOffset(0, 9) },
  { id: "tm_4", name: "Rafael Souza", email: "rafael@barbearia.com", avatar_url: "/young-barber.jpg", role: "barber", active: true, last_login: isoOffset(0, 8) },
  { id: "tm_5", name: "Juliana Reis", email: "juliana@barbearia.com", avatar_url: "/woman-receptionist.jpg", role: "reception", active: true, last_login: isoOffset(0, 7) },
]

export const rolePermissions: Record<string, { name: string; description: string; permissions: string[] }> = {
  owner: {
    name: "Proprietário",
    description: "Acesso total ao sistema, incluindo financeiro e configurações.",
    permissions: ["all"],
  },
  manager: {
    name: "Gerente",
    description: "Gerencia equipe, agenda, clientes e relatórios. Sem acesso a faturamento da plataforma.",
    permissions: ["agenda", "services", "barbers", "clients", "reports", "marketing", "loyalty", "pos", "blocks"],
  },
  senior_barber: {
    name: "Barbeiro Sênior",
    description: "Atende clientes e tem visibilidade da agenda completa.",
    permissions: ["agenda", "clients", "pos", "own_reports"],
  },
  barber: {
    name: "Barbeiro",
    description: "Vê apenas a própria agenda e seus clientes.",
    permissions: ["own_agenda", "own_clients", "pos"],
  },
  reception: {
    name: "Recepção",
    description: "Cria agendamentos, atende clientes e finaliza vendas no PDV.",
    permissions: ["agenda", "clients", "pos", "blocks"],
  },
}
