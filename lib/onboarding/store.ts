"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  BusinessData,
  ServiceItem,
  ScheduleItem,
} from "./schema"
import { DEFAULT_SCHEDULES, DEFAULT_SERVICES } from "./schema"

export type OnboardingStep = "business" | "services" | "schedules" | "review"

interface OnboardingState {
  step: OnboardingStep
  planSlug: string
  business: Partial<BusinessData>
  services: ServiceItem[]
  schedules: ScheduleItem[]
  barberName: string

  // Actions
  setStep: (step: OnboardingStep) => void
  setPlan: (slug: string) => void
  setBusiness: (data: Partial<BusinessData>) => void
  setServices: (services: ServiceItem[]) => void
  setSchedules: (schedules: ScheduleItem[]) => void
  setBarberName: (name: string) => void
  reset: () => void
}

const initialState = {
  step: "business" as OnboardingStep,
  planSlug: "free",
  business: {},
  services: DEFAULT_SERVICES,
  schedules: DEFAULT_SCHEDULES,
  barberName: "",
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setPlan: (planSlug) => set({ planSlug }),
      setBusiness: (business) =>
        set((state) => ({ business: { ...state.business, ...business } })),
      setServices: (services) => set({ services }),
      setSchedules: (schedules) => set({ schedules }),
      setBarberName: (barberName) => set({ barberName }),
      reset: () => set(initialState),
    }),
    {
      name: "onboarding-store",
    }
  )
)
