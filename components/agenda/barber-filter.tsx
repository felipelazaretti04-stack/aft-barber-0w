"use client"

import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { barbers } from "@/lib/mock-data"

export function BarberFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Barbeiros ({selected.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">Filtrar por barbeiro</p>
          <button
            className="text-xs text-primary hover:underline"
            onClick={() =>
              selected.length === barbers.length ? onChange([]) : onChange(barbers.map((b) => b.id))
            }
          >
            {selected.length === barbers.length ? "Limpar" : "Todos"}
          </button>
        </div>
        <div className="space-y-1">
          {barbers.map((b) => {
            const checked = selected.includes(b.id)
            return (
              <label
                key={b.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    if (c) onChange([...selected, b.id])
                    else onChange(selected.filter((id) => id !== b.id))
                  }}
                />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={b.avatar_url || "/placeholder.svg"} alt={b.name} />
                  <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm flex-1 truncate">{b.name}</span>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
