export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled"

export type ServiceCategory = "cabelo" | "barba" | "combo" | "tratamento"

export type PaymentMethod = "dinheiro" | "pix" | "debito" | "credito" | "giftcard"

export type ClientTag = "vip" | "inativo" | "novo" | "aniversariante" | "blacklist" | "trusted"

export type PlanTier = "starter" | "pro" | "premium"

export type UserRole = "owner" | "manager" | "senior_barber" | "barber" | "reception"

export type TenantStatus = "trial" | "active" | "suspended" | "churned"

export type CampaignChannel = "email" | "sms" | "whatsapp"
export type CampaignStatus = "draft" | "scheduled" | "sent"
export type AutomationTrigger = "birthday" | "first_visit" | "comeback" | "missed_client"
export type PromotionType = "flash" | "happy_hour" | "last_minute"

export interface ServiceVariant {
  id: string
  name: string
  duration_min: number
  price: number
}

export interface Service {
  id: string
  tenant_id: string
  name: string
  description: string
  category: ServiceCategory
  duration_min: number
  price: number
  photo_url: string
  active: boolean
  add_ons: { id: string; name: string; price: number }[]
  barber_ids: string[]
  variants?: ServiceVariant[]
  combo_service_ids?: string[]
  margin_before_min?: number
  margin_after_min?: number
  processing_time_min?: number
  parallel_clients?: number
  is_mobile?: boolean
  mobile_radius_km?: number
  mobile_fee?: number
}

export interface Barber {
  id: string
  tenant_id: string
  name: string
  bio: string
  email: string
  phone: string
  avatar_url: string
  color: string
  commission_pct: number
  active: boolean
  schedule: {
    [day: string]: { open: boolean; start: string; end: string; lunch_start?: string; lunch_end?: string }
  }
  service_ids: string[]
  role?: UserRole
}

export interface Client {
  id: string
  tenant_id: string
  name: string
  phone: string
  email: string
  birthday: string
  avatar_url: string
  tags: ClientTag[]
  total_spent: number
  visit_count: number
  last_visit_at: string | null
  notes: string
  preferences: string[]
  created_at: string
  trusted?: boolean
  blocked?: boolean
  block_reason?: string
  family?: { id: string; name: string; relation: string; avatar_url: string }[]
}

export interface Appointment {
  id: string
  tenant_id: string
  client_id: string
  barber_id: string
  service_id: string
  start_at: string
  end_at: string
  status: AppointmentStatus
  price: number
  notes: string
  payment_method?: PaymentMethod
  resource_id?: string
}

export interface Block {
  id: string
  tenant_id: string
  start_at: string
  end_at: string
  reason: string
  barber_ids: string[]
  full_day: boolean
}

export interface GalleryPhoto {
  id: string
  tenant_id: string
  url: string
  caption: string
  show_in_booking: boolean
  uploaded_at: string
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  price: number
  stock: number
  photo_url: string
}

export interface Invoice {
  id: string
  tenant_id: string
  amount: number
  date: string
  status: "paid" | "pending" | "failed"
  pdf_url: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string
  cover_url: string
  phone: string
  address: string
  instagram: string
  description: string
  plan: PlanTier
  status: TenantStatus
  trial_ends_at: string
  created_at: string
  mrr: number
}

export interface Plan {
  id: PlanTier
  name: string
  price: number
  max_barbers: number
  max_appointments: number
  features: string[]
}

export interface AuditLog {
  id: string
  tenant_id: string
  tenant_name: string
  user_name: string
  action: string
  entity: string
  created_at: string
  ip: string
}

export interface Campaign {
  id: string
  tenant_id: string
  name: string
  channel: CampaignChannel
  status: CampaignStatus
  audience: string
  audience_count: number
  message: string
  sent_at?: string
  scheduled_at?: string
  open_rate?: number
  click_rate?: number
}

export interface Automation {
  id: string
  tenant_id: string
  name: string
  trigger: AutomationTrigger
  channel: CampaignChannel
  active: boolean
  message: string
  delay_days: number
  triggered_count: number
}

export interface Promotion {
  id: string
  tenant_id: string
  name: string
  type: PromotionType
  discount_pct: number
  starts_at: string
  ends_at: string
  service_ids: string[]
  active: boolean
  uses: number
}

export interface Flyer {
  id: string
  tenant_id: string
  name: string
  template: string
  preview_url: string
  created_at: string
}

export interface Giftcard {
  id: string
  tenant_id: string
  code: string
  amount: number
  balance: number
  buyer_name: string
  recipient_name: string
  status: "active" | "redeemed" | "expired"
  created_at: string
  expires_at: string
}

export interface GiftcardTemplate {
  id: string
  tenant_id: string
  name: string
  amount: number
  cover_url: string
  active: boolean
}

export interface Subscription {
  id: string
  tenant_id: string
  name: string
  price_month: number
  benefits: string[]
  active: boolean
  subscribers: number
}

export interface Subscriber {
  id: string
  client_id: string
  client_name: string
  subscription_id: string
  subscription_name: string
  started_at: string
  next_charge: string
  status: "active" | "paused" | "cancelled"
}

export interface ServicePackage {
  id: string
  tenant_id: string
  name: string
  service_id: string
  service_name: string
  total_sessions: number
  price: number
  active: boolean
  sold: number
}

export interface PackageBalance {
  id: string
  client_id: string
  client_name: string
  package_id: string
  package_name: string
  remaining: number
  total: number
  bought_at: string
}

export interface LoyaltyConfig {
  active: boolean
  points_per_real: number
  rewards: { id: string; name: string; points: number; type: "discount" | "service"; value: number }[]
}

export interface WaitlistEntry {
  id: string
  tenant_id: string
  client_id: string
  client_name: string
  client_phone: string
  service_id: string
  service_name: string
  barber_id?: string
  barber_name?: string
  preferred_period: string
  preferred_dates: string
  notes: string
  created_at: string
  status: "waiting" | "notified" | "fulfilled"
}

export interface Resource {
  id: string
  tenant_id: string
  name: string
  type: "chair" | "room" | "equipment"
  description: string
  active: boolean
}

export interface CustomForm {
  id: string
  tenant_id: string
  name: string
  description: string
  required: boolean
  active: boolean
  fields: { id: string; label: string; type: "text" | "textarea" | "select" | "checkbox" | "date"; required: boolean; options?: string[] }[]
  applied_services: string[]
}

export interface FilledForm {
  id: string
  client_id: string
  form_id: string
  form_name: string
  filled_at: string
  answers: { question: string; answer: string }[]
}

export interface NotificationTemplate {
  id: string
  channel: CampaignChannel
  event: "confirmation" | "reminder_24h" | "reminder_1h" | "thank_you" | "comeback"
  subject?: string
  body: string
  active: boolean
}

export interface BookingRules {
  min_advance_minutes: number
  max_advance_days: number
  cancel_min_advance_hours: number
  reschedule_min_advance_hours: number
  require_confirmation: boolean
  require_card: boolean
  no_show_fee: number
}

export interface SafetyRule {
  id: string
  title: string
  description: string
  icon: string
  active: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar_url: string
  role: UserRole
  active: boolean
  last_login: string
}
