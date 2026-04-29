"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

export function InviteBarberDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [color, setColor] = useState(colors[0])
  const [sendInvite, setSendInvite] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convidar barbeiro</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            toast.success("Convite enviado!")
            onOpenChange(false)
          }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="b-name">Nome completo</Label>
              <Input id="b-name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-email">Email</Label>
              <Input id="b-email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-phone">Telefone</Label>
              <Input id="b-phone" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-comm">Comissão (%)</Label>
              <Input id="b-comm" type="number" min={0} max={100} defaultValue={50} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-bio">Bio</Label>
            <Textarea id="b-bio" rows={2} placeholder="Especialista em..." />
          </div>
          <div className="space-y-2">
            <Label>Cor na agenda</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                  }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Enviar convite por email</p>
              <p className="text-xs text-muted-foreground">Cria conta automaticamente</p>
            </div>
            <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Enviar convite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
