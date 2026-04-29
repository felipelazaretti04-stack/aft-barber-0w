"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function ClientDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            toast.success("Cliente cadastrado")
            onOpenChange(false)
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cli-name">Nome completo</Label>
              <Input id="cli-name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cli-phone">Telefone</Label>
              <Input id="cli-phone" placeholder="(00) 00000-0000" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cli-email">Email</Label>
              <Input id="cli-email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cli-bday">Aniversário</Label>
              <Input id="cli-bday" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cli-notes">Observações</Label>
            <Textarea id="cli-notes" rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Cadastrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
