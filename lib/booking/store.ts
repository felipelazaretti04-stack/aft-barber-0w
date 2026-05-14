"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface SelectedService {
  id: string
  name: string
  duration_min: number
  price_cents: number
}

export interface SelectedBarber {
  id: string | null // null = sem preferência
  name: string
  avatar_url?: string | null
}

export interface CustomerData {
  name: string
  phone: string
  email: string
  notes: string
}

interface BookingState {
  tenantSlug: string | null
  step: WizardStep
  service: SelectedService | null
  barber: SelectedBarber | null
  date: string | null // ISO date (YYYY-MM-DD)
  slot: { start: string; end: string; barberId: string } | null
  customer: CustomerData
  setTenantSlug: (slug: string) => void
  setStep: (s: WizardStep) => void
  setService: (s: SelectedService) => void
  setBarber: (b: SelectedBarber) => void
  setDate: (d: string | null) => void
  setSlot: (s: { start: string; end: string; barberId: string } | null) => void
  setCustomer: (c: Partial<CustomerData>) => void
  reset: () => void
}

const initialCustomer: CustomerData = { name: "", phone: "", email: "", notes: "" }

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      tenantSlug: null,
      step: 1,
      service: null,
      barber: null,
      date: null,
      slot: null,
      customer: initialCustomer,
      setTenantSlug: (slug) => set({ tenantSlug: slug }),
      setStep: (step) => set({ step }),
      setService: (service) => set({ service, slot: null }),
      setBarber: (barber) => set({ barber, slot: null }),
      setDate: (date) => set({ date, slot: null }),
      setSlot: (slot) => set({ slot }),
      setCustomer: (c) => set((s) => ({ customer: { ...s.customer, ...c } })),
      reset: () =>
        set({
          step: 1,
          service: null,
          barber: null,
          date: null,
          slot: null,
          customer: initialCustomer,
        }),
    }),
    {
      name: "booking-wizard",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
