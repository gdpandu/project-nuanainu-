"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Trash2, MapPin, Pencil, Map, CalendarPlus } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // <-- Komponen baru
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// <-- IMPORT KOMPONEN SELECT SHADCN YANG CAKEP -->
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipe Data
interface Venue {
  id: string
  name: string
}

interface Rundown {
  id: string
  title: string
  description: string
  start_time: string
  category: string
  venue_id: string
  venues?: { name: string }
}

// Daftar Kategori Sesuai Desain Gambar
const CATEGORY_OPTIONS = [
  "Ceremony",
  "Workshop",
  "Break",
  "Performance",
  "Networking",
  "Lainnya"
]

export default function AdminRundownPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [venues, setVenues] = React.useState<Venue[]>([])
  const [rundowns, setRundowns] = React.useState<Rundown[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [refreshKey, setRefreshKey] = React.useState(0)
  // Tambahin state ini buat nama event
  const [eventName, setEventName] = React.useState("Memuat nama event...")

  // Modal States
  const [isVenueModalOpen, setIsVenueModalOpen] = React.useState(false)
  const [newVenueName, setNewVenueName] = React.useState("")
  
  const [isRundownModalOpen, setIsRundownModalOpen] = React.useState(false)
  const [editingRundownId, setEditingRundownId] = React.useState<string | null>(null)
  const [newRundown, setNewRundown] = React.useState({
    title: "",
    description: "",
    start_time: "",
    category: "",
    venue_id: "",
  })

  // LOGIC TARIK DATA
  React.useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!eventId) return
// --- TAMBAHIN KODE INI BUAT NARIK NAMA EVENT ---
      const { data: eventData } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .single()
      // ------------------------------------------------

      const { data: venueData } = await supabase
        .from("venues")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true })

      const { data: rundownData } = await supabase
        .from("rundown")
        .select("*, venues(name)")
        .eq("event_id", eventId)
        .order("start_time", { ascending: true })

      if (isMounted) {
        if (eventData) setEventName(eventData.name) // <-- Tambahin ini
        if (venueData) setVenues(venueData)
        if (rundownData) setRundowns(rundownData)
        setIsLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [eventId, refreshKey])

  // FUNGSI SAVE VENUE 
  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVenueName.trim()) return

    const { error } = await supabase.from("venues").insert([{ event_id: eventId, name: newVenueName }])
    if (!error) {
      setNewVenueName("")
      setIsVenueModalOpen(false)
      setRefreshKey(prev => prev + 1)
    } else alert("Gagal menyimpan venue")
  }

  // FUNGSI FORM RUNDOWN
  const handleAddClick = () => {
    setEditingRundownId(null)
    setNewRundown({ title: "", description: "", start_time: "", category: "", venue_id: "" })
    setIsRundownModalOpen(true)
  }

  const handleEditClick = (rundown: Rundown) => {
    setEditingRundownId(rundown.id)
    const formattedTime = rundown.start_time ? rundown.start_time.slice(0, 16) : ""
    setNewRundown({
      title: rundown.title,
      description: rundown.description || "",
      start_time: formattedTime,
      category: rundown.category,
      venue_id: rundown.venue_id,
    })
    setIsRundownModalOpen(true)
  }

  const handleSaveRundown = async (e: React.FormEvent) => {
    e.preventDefault()
    let error;

    if (editingRundownId) {
      const { error: updateError } = await supabase
        .from("rundown")
        .update({
          title: newRundown.title,
          description: newRundown.description,
          start_time: newRundown.start_time,
          category: newRundown.category,
          venue_id: newRundown.venue_id
        }).eq("id", editingRundownId)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("rundown")
        .insert([{
          event_id: eventId,
          ...newRundown
        }])
      error = insertError
    }

    if (!error) {
      setIsRundownModalOpen(false)
      setRefreshKey(prev => prev + 1)
    } else alert("Gagal menyimpan rundown")
  }

  const handleDeleteRundown = async (id: string) => {
    if (!confirm("Yakin mau hapus jadwal ini?")) return
    await supabase.from("rundown").delete().eq("id", id)
    setRefreshKey(prev => prev + 1)
  }

  // FORMATTER
  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  }
  const formatDate = (timeStr: string) => {
    return new Date(timeStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })
  }

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner className="size-10" /></div>

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">{eventName}</h1>
        <p className="text-muted-foreground">Atur jadwal acara dan daftar panggung (venue) di sini.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* TABEL RUNDOWN */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Tabel Jadwal (Rundown)</CardTitle>
                <CardDescription>Semua acara yang terdaftar di event ini.</CardDescription>
              </div>
              <Button onClick={handleAddClick} disabled={venues.length === 0} size="sm" className="bg-[#2b664d] hover:bg-[#204d3a] text-white">
                <CalendarPlus className="mr-2 size-4" /> Add Schedule
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {venues.length === 0 && (
                <div className="p-4 bg-amber-50 text-amber-800 text-sm border-b border-amber-200">
                  ⚠️ Tambahkan Venue terlebih dahulu di sebelah kanan sebelum membuat jadwal.
                </div>
              )}
              
              {rundowns.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  Belum ada jadwal. Klik tombol <strong>Add Schedule</strong>.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Waktu</th>
                        <th className="px-4 py-3 font-medium">Judul Acara</th>
                        <th className="px-4 py-3 font-medium">Kategori</th>
                        <th className="px-4 py-3 font-medium">Venue</th>
                        <th className="px-4 py-3 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {rundowns.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-primary">
                            {formatDate(r.start_time)} • {formatTime(r.start_time)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{r.title}</p>
                            {r.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                              {r.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {r.venues?.name || "-"}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => handleEditClick(r)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 ml-1" onClick={() => handleDeleteRundown(r.id)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: VENUE & MAP */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Daftar Venue</CardTitle>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsVenueModalOpen(true)}>
                <Plus className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {venues.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">Belum ada lokasi.</p>
              ) : (
                <ul className="space-y-2">
                  {venues.map((v) => (
                    <li key={v.id} className="flex items-center gap-2 text-sm border border-border/50 p-2.5 rounded-md bg-card">
                      <MapPin className="size-4 text-primary" />
                      <span className="font-medium">{v.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-primary/5 border-primary/20">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
              <Map className="size-10 text-primary opacity-80" />
              <div>
                <h3 className="font-semibold text-foreground">Upload Peta Event</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Pasang denah dan atur titik koordinat venue di peta.</p>
                <Button variant="default" className="w-full" onClick={() => router.push(`/admin/${eventId}/map-settings`)}>
                  Buka Map Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL VENUE */}
      <Dialog open={isVenueModalOpen} onOpenChange={setIsVenueModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader><DialogTitle>Tambah Venue Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveVenue}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel htmlFor="venueName">Nama Venue</FieldLabel>
                <Input id="venueName" placeholder="Main Stage..." value={newVenueName} onChange={(e) => setNewVenueName(e.target.value)} required />
              </Field>
            </FieldGroup>
            <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL RUNDOWN DENGAN TAMPILAN CAKEP (SHADCN UI) */}
      <Dialog open={isRundownModalOpen} onOpenChange={setIsRundownModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingRundownId ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
            <CardDescription>Create a new schedule item for the event rundown.</CardDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRundown}>
            <FieldGroup className="py-4 space-y-5">
              
              <Field>
                <FieldLabel htmlFor="rundownTitle">Title</FieldLabel>
                <Input id="rundownTitle" placeholder="e.g., Morning Yoga Session" required value={newRundown.title} onChange={(e) => setNewRundown({...newRundown, title: e.target.value})} />
              </Field>

              {/* PAKAI TEXTAREA BIAR LEGA */}
              <Field>
                <FieldLabel htmlFor="rundownDesc">Description</FieldLabel>
                <Textarea 
                  id="rundownDesc" 
                  placeholder="Describe the session or activity..." 
                  className="resize-none min-h-[80px]"
                  value={newRundown.description} 
                  onChange={(e) => setNewRundown({...newRundown, description: e.target.value})} 
                />
              </Field>

              {/* ROW: TIME & CATEGORY */}
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="rundownTime">Time</FieldLabel>
                  <Input id="rundownTime" type="datetime-local" required value={newRundown.start_time} onChange={(e) => setNewRundown({...newRundown, start_time: e.target.value})} />
                </Field>

                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Select value={newRundown.category} onValueChange={(val) => setNewRundown({...newRundown, category: val})} required>
                    <SelectTrigger aria-label="Category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* VENUE PAKE SELECT SHADCN */}
              <Field>
                <FieldLabel>Venue</FieldLabel>
                <Select value={newRundown.venue_id} onValueChange={(val) => setNewRundown({...newRundown, venue_id: val})} required>
                  <SelectTrigger aria-label="Venue">
                    <SelectValue placeholder="Select Venue" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {venues.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

            </FieldGroup>
            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => setIsRundownModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#2b664d] hover:bg-[#204d3a] text-white">
                {editingRundownId ? "Update Schedule" : "Add Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}