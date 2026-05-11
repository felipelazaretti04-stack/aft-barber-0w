"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Scissors, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "#recursos", label: "Recursos" },
  { href: "#planos", label: "Planos" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#faq", label: "Perguntas" },
]

export function LandingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AFT Barber</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">Começar grátis</Link>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border/40 bg-background md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border/40 pt-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Começar grátis</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
