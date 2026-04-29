"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Check,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  Instagram,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { galleryPhotos } from "@/lib/mock-data"
import { formatDateBR } from "@/lib/format"
import type { GalleryPhoto } from "@/lib/types"

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(galleryPhotos)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const visibleCount = photos.filter((p) => p.show_in_booking).length

  const handleToggleBooking = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, show_in_booking: !p.show_in_booking } : p))
    )
    toast.success("Visibilidade atualizada")
  }

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    toast.success("Foto excluída")
  }

  const handleUpload = () => {
    // Simula upload
    const newPhoto: GalleryPhoto = {
      id: `ph_${Date.now()}`,
      tenant_id: "tenant_1",
      url: "/modern-haircut.jpg",
      caption: "Nova foto",
      show_in_booking: true,
      uploaded_at: new Date().toISOString(),
    }
    setPhotos((prev) => [newPhoto, ...prev])
    toast.success("Foto enviada com sucesso")
    setUploadDialogOpen(false)
  }

  const handleImportInstagram = () => {
    toast.success("Importando do Instagram...")
    // Simula importação
    setTimeout(() => {
      toast.success("3 fotos importadas do Instagram")
    }, 2000)
  }

  const openLightbox = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo)
    setLightboxOpen(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Simula upload de arquivos arrastados
    toast.success(`${e.dataTransfer.files.length} arquivo(s) recebido(s)`)
    setUploadDialogOpen(true)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Galeria" description="Portfólio de trabalhos da barbearia">
        <Button variant="outline" onClick={handleImportInstagram}>
          <Instagram className="mr-2 h-4 w-4" />
          Importar do Instagram
        </Button>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Enviar fotos
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{photos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visíveis no Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{visibleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ocultas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{photos.length - visibleCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gallery Grid */}
      {photos.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Galeria vazia</EmptyTitle>
            <EmptyDescription>Adicione fotos do seu trabalho para exibir no booking.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Enviar fotos
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div
          className={cn(
            "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 rounded-lg transition-all",
            isDragging && "ring-2 ring-primary ring-dashed bg-primary/5"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <Image
                src={photo.url || "/placeholder.svg"}
                alt={photo.caption}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                  <p className="text-white/70 text-xs">{formatDateBR(photo.uploaded_at)}</p>
                </div>
              </div>

              {/* Action buttons on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => openLightbox(photo)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingPhoto(photo); setEditDialogOpen(true) }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar legenda
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleBooking(photo.id)}>
                      {photo.show_in_booking ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ocultar do booking
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Mostrar no booking
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(photo.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Visibility badge */}
              <div className="absolute top-2 left-2">
                {photo.show_in_booking ? (
                  <Badge variant="secondary" className="bg-success/90 text-success-foreground">
                    <Eye className="mr-1 h-3 w-3" />
                    Visível
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted/90">
                    <EyeOff className="mr-1 h-3 w-3" />
                    Oculta
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar fotos</DialogTitle>
            <DialogDescription>Arraste arquivos ou clique para selecionar</DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              "hover:border-primary hover:bg-primary/5"
            )}
            onClick={() => toast.success("Seletor de arquivos aberto")}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Arraste imagens aqui</p>
            <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG até 10MB</p>
          </div>
          <Field className="pt-4">
            <FieldLabel>Legenda padrão</FieldLabel>
            <Input placeholder="Ex: Degradê moderno" />
          </Field>
          <div className="flex items-center gap-2 pt-2">
            <Checkbox id="show-booking" defaultChecked />
            <Label htmlFor="show-booking" className="text-sm">Mostrar no booking público</Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedPhoto && (
            <>
              <div className="relative aspect-video bg-black">
                <Image
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={selectedPhoto.caption}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedPhoto.caption}</p>
                  <p className="text-sm text-muted-foreground">{formatDateBR(selectedPhoto.uploaded_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleBooking(selectedPhoto.id)}
                  >
                    {selectedPhoto.show_in_booking ? (
                      <>
                        <EyeOff className="mr-1 h-3 w-3" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-3 w-3" />
                        Mostrar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { handleDelete(selectedPhoto.id); setLightboxOpen(false) }}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) setEditingPhoto(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar foto</DialogTitle>
            <DialogDescription>Atualize a legenda da foto</DialogDescription>
          </DialogHeader>
          <Field className="py-4">
            <FieldLabel>Legenda</FieldLabel>
            <Textarea defaultValue={editingPhoto?.caption} rows={2} />
          </Field>
          <div className="flex items-center gap-2">
            <Switch
              id="edit-visible"
              defaultChecked={editingPhoto?.show_in_booking}
            />
            <Label htmlFor="edit-visible">Mostrar no booking público</Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => { toast.success("Foto atualizada"); setEditDialogOpen(false) }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
