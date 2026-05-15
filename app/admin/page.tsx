"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, CalendarDays, ArrowRight, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { supabase } from "@/lib/supabase"

interface NuanuEvent {
  id: string
  name: string
  slug: string
  start_date?: string
  end_date?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  
  const [isAuthChecking, setIsAuthChecking] = React.useState(true)
  const [events, setEvents] = React.useState<NuanuEvent[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // State buat Modal Create Event
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [newEventName, setNewEventName] = React.useState("")

  // State buat Modal Edit Event
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingEvent, setEditingEvent] = React.useState<NuanuEvent | null>(null)
  const [editEventName, setEditEventName] = React.useState("")

  // FETCH DATA
  React.useEffect(() => {
    let isMounted = true
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace("/admin/login")
        return 
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })

      if (isMounted) {
        if (!error && data) {
          setEvents(data)
        }
        setIsAuthChecking(false)
        setIsLoading(false)
      }
    }
    checkAuthAndFetchData()
    return () => { isMounted = false }
  }, [router]) 

  // FUNGSI CREATE EVENT
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const eventName = newEventName.trim()
    if (!eventName) return

    setIsSubmitting(true)

    const eventSlug = eventName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    const { data, error } = await supabase
      .from("events")
      .insert([{ name: eventName, slug: eventSlug }])
      .select()
      .single()

    if (!error && data) {
      router.push(`/admin/${data.id}`)
    } else {
      console.error("Error creating event:", error)
      alert("Gagal membuat event baru. Mungkin nama/slug sudah terpakai.")
      setIsSubmitting(false)
    }
  }

  // FUNGSI BUKA MODAL EDIT
  const openEditModal = (e: React.MouseEvent, event: NuanuEvent) => {
    e.stopPropagation() // Biar gak n-trigger onClick card
    setEditingEvent(event)
    setEditEventName(event.name)
    setIsEditModalOpen(true)
  }

  // FUNGSI SAVE EDIT EVENT
  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const newName = editEventName.trim()
    if (!newName || !editingEvent) return

    setIsSubmitting(true)

    // Bikin slug baru kalau namanya diganti
    const newSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    const { error } = await supabase
      .from("events")
      .update({ name: newName, slug: newSlug })
      .eq("id", editingEvent.id)

    setIsSubmitting(false)

    if (!error) {
      // Update UI lokal biar gak perlu refresh halaman
      setEvents(events.map(ev => 
        ev.id === editingEvent.id ? { ...ev, name: newName, slug: newSlug } : ev
      ))
      setIsEditModalOpen(false)
    } else {
      console.error("Error updating event:", error)
      alert("Gagal mengupdate event.")
    }
  }

  // FUNGSI DELETE EVENT
  const handleDeleteEvent = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation() // Biar gak n-trigger onClick card
    
    if (!confirm(`Yakin mau hapus event "${name}"?\nSemua jadwal dan venue di dalamnya juga akan ikut terhapus!`)) {
      return
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)

    if (!error) {
      // Hapus dari UI lokal
      setEvents(events.filter(ev => ev.id !== id))
    } else {
      console.error("Error deleting event:", error)
      alert("Gagal menghapus event.")
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Tanggal belum diatur"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuanu Events</h1>
          <p className="text-muted-foreground">
            Pilih event untuk mengelola rundown dan peta, atau buat event baru.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-[#2b664d] hover:bg-[#204d3a] text-white">
          <Plus className="mr-2 size-5" />
          Create New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center bg-muted/30">
          <CalendarDays className="size-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">Belum ada event</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mulai dengan membuat event pertamamu.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            <Plus className="mr-2 size-4" /> Create Event
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="relative flex flex-col cursor-pointer transition-all hover:border-[#2b664d]/50 hover:shadow-md group"
              onClick={() => router.push(`/admin/${event.id}`)}
            >
              <CardHeader className="pr-16"> {/* Kasih padding kanan biar teks gak nabrak tombol */}
                <CardTitle className="line-clamp-1 pr-2">{event.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2">
                  <CalendarDays className="size-3.5" />
                  {formatDate(event.start_date)}
                </CardDescription>

                {/* TOMBOL EDIT & DELETE (Muncul di pojok kanan atas card) */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    onClick={(e) => openEditModal(e, event)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={(e) => handleDeleteEvent(e, event.id, event.name)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded-md">
                  Slug: /{event.slug}
                </p>
              </CardContent>

              <CardFooter className="border-t bg-muted/20 px-6 py-4">
                <div className="flex w-full items-center justify-between text-sm font-medium text-[#2b664d]">
                  Manage Event
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL CREATE EVENT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Masukkan nama event. Detail lainnya bisa diatur di menu Settings nanti.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEvent}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel htmlFor="eventName">Event Name</FieldLabel>
                <Input
                  id="eventName"
                  placeholder="e.g., Nuanu Music Festival 2026"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !newEventName.trim()} className="bg-[#2b664d] hover:bg-[#204d3a] text-white">
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL EDIT EVENT */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Ubah nama event. Slug URL juga akan ikut diperbarui secara otomatis.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEvent}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel htmlFor="editEventName">Event Name</FieldLabel>
                <Input
                  id="editEventName"
                  placeholder="e.g., Nuanu Music Festival 2026"
                  value={editEventName}
                  onChange={(e) => setEditEventName(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !editEventName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}