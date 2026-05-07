"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, CalendarDays, ArrowRight } from "lucide-react"

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
  start_date?: string
  end_date?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  
  // States
  const [isAuthChecking, setIsAuthChecking] = React.useState(true)
  const [events, setEvents] = React.useState<NuanuEvent[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // State buat Modal Create Event
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [newEventName, setNewEventName] = React.useState("")

  // GABUNGAN: Logic Auth Check (Satpam) & Fetch Data Supabase
  React.useEffect(() => {
    let isMounted = true

    const checkAuthAndFetchData = async () => {
      // 1. Cek Tiket Login
      const isLoggedIn = localStorage.getItem("isAdminLoggedIn")
      
      if (!isLoggedIn) {
        // Kalau ga ada tiket, tendang ke login pakai replace (biar ga bisa di-back)
        router.replace("/admin/login")
        return // Stop fungsi di sini
      }

      // 2. Kalau lolos, baru tarik data dari Supabase
      setIsLoading(true)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })

      if (isMounted) {
        if (!error && data) {
          setEvents(data)
        }
        // Matikan loading dan auth checking secara bersamaan
        setIsAuthChecking(false)
        setIsLoading(false)
      }
    }

    checkAuthAndFetchData()

    return () => {
      isMounted = false
    }
  }, [router]) // <-- Dependencies kosong biar nggak kena warning cascade render

  // Fungsi bikin event baru
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventName.trim()) return

    setIsSubmitting(true)

    const { data, error } = await supabase
      .from("events")
      .insert([{ name: newEventName.trim() }])
      .select()
      .single()

    if (!error && data) {
      // Langsung redirect ke halaman spesifik event yang baru dibikin
      router.push(`/admin/${data.id}`)
    } else {
      console.error("Error creating event:", error)
      alert("Gagal membuat event baru.")
      setIsSubmitting(false)
    }
  }

  // Fungsi format tanggal biar rapi
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Tanggal belum diatur"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  // Mencegah layar kedip atau nampilin UI sebentar pas mau ditendang satpam
  if (isAuthChecking) {
    return null // Layar bakal kosong/putih sepersekian detik
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
        <Button onClick={() => setIsModalOpen(true)} size="lg">
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
              className="flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
              onClick={() => router.push(`/admin/${event.id}`)}
            >
              <CardHeader>
                <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2">
                  <CalendarDays className="size-3.5" />
                  {formatDate(event.start_date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Space kosong kalau mau ditambahin jumlah rundown dll nantinya */}
              </CardContent>
              <CardFooter className="border-t bg-muted/20 px-6 py-4">
                <div className="flex w-full items-center justify-between text-sm font-medium text-primary">
                  Manage Event
                  <ArrowRight className="size-4" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Buat Event Baru */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
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
              <Button type="submit" disabled={isSubmitting || !newEventName.trim()}>
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}