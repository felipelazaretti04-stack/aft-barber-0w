"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Download, Share2, Trash2, Pencil, Instagram } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, EmptyContent } from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { flyers, flyerTemplates } from "@/lib/mock-data-extra"
import { formatDateBR } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function FlyersPage() {
  const [open, setOpen] = useState(false)
  const [editor, setEditor] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gerador de Flyers" description="Crie peças prontas pra postar no Instagram, Stories e WhatsApp.">
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo flyer</Button>
      </PageHeader>

      {flyers.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Instagram className="h-6 w-6" /></EmptyMedia>
            <EmptyTitle>Nenhum flyer ainda</EmptyTitle>
            <EmptyDescription>Crie peças visuais para divulgar promoções e novidades.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button onClick={() => setOpen(true)}>Criar primeiro flyer</Button></EmptyContent>
        </Empty>
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold mb-3">Seus flyers</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {flyers.map((f) => (
                <Card key={f.id} className="overflow-hidden group">
                  <div className="aspect-[4/5] relative bg-muted">
                    <Image src={f.preview_url || "/placeholder.svg"} alt={f.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="icon" variant="secondary" className="h-9 w-9"><Download className="h-4 w-4" /></Button>
                      <Button size="icon" variant="secondary" className="h-9 w-9"><Share2 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="secondary" className="h-9 w-9"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="destructive" className="h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDateBR(f.created_at)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Escolha um template</DialogTitle>
            <DialogDescription>Comece a partir de um template e customize com seu logo e cores.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {flyerTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={cn(
                  "rounded-md border-2 overflow-hidden text-left transition-all",
                  selectedTemplate === t.id ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border"
                )}
              >
                <div className="aspect-[4/5] relative bg-muted">
                  <Image src={t.preview_url || "/placeholder.svg"} alt={t.name} fill className="object-cover" />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium">{t.name}</p>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button disabled={!selectedTemplate} onClick={() => { setOpen(false); setEditor(true) }}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editor} onOpenChange={setEditor}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar flyer</DialogTitle>
            <DialogDescription>Personalize com seu conteúdo.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="aspect-[4/5] relative bg-muted rounded-md overflow-hidden">
              {selectedTemplate && (
                <Image
                  src={flyerTemplates.find((t) => t.id === selectedTemplate)?.preview_url || "/placeholder.svg"}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel>Título principal</FieldLabel>
                <Input defaultValue="20% OFF" />
              </Field>
              <Field>
                <FieldLabel>Subtítulo</FieldLabel>
                <Input defaultValue="Combo Corte + Barba" />
              </Field>
              <Field>
                <FieldLabel>Texto adicional</FieldLabel>
                <Textarea rows={3} defaultValue="Promoção válida só essa semana. Agende já!" />
              </Field>
              <Field>
                <FieldLabel>Validade</FieldLabel>
                <Input type="date" />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditor(false)}>Cancelar</Button>
            <Button onClick={() => setEditor(false)}><Download className="h-4 w-4 mr-2" />Baixar PNG</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
