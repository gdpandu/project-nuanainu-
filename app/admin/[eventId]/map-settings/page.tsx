"use client"

import * as React from "react"
import { useParams } from "next/navigation" // <-- Tambahin ini
import { MapPin, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { MapUploadCard } from "@/components/admin/map-upload-card" 
import { supabase } from "@/lib/supabase"

interface Venue {
  id: string
  name: string
}

export default function MapSettingsPage() {
  const params = useParams()
  const eventId = params.eventId as string // <-- Tangkap ID dinamis dari URL

  const [venues, setVenues] = React.useState<Venue[]>([])
  const [newVenueName, setNewVenueName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Ambil data venue dari Supabase
  React.useEffect(() => {
    let isMounted = true

    const fetchVenues = async () => {
      if (!eventId) return // Jaga-jaga kalau eventId belum siap

      setIsLoading(true)
      const { data, error } = await supabase
        .from("venues")
        .select("id, name")
        .eq("event_id", eventId) // <-- Pakai ID dinamis
        .order("created_at", { ascending: true }) 

      if (!error && data && isMounted) {
        setVenues(data)
      }
      if (isMounted) setIsLoading(false)
    }

    fetchVenues()

    return () => {
      isMounted = false
    }
  }, [eventId])

  // Fungsi tambah venue
  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVenueName.trim() || !eventId) return

    setIsSubmitting(true)

    const { data, error } = await supabase
      .from("venues")
      .insert([
        {
          event_id: eventId, // <-- Pakai ID dinamis
          name: newVenueName.trim(),
        },
      ])
      .select()
      .single()

    if (!error && data) {
      setVenues((prev) => [...prev, { id: data.id, name: data.name }])
      setNewVenueName("") 
    } else {
      console.error("Error adding venue:", error)
      alert("Gagal menambahkan venue. Cek console log.")
    }

    setIsSubmitting(false)
  }

  // Fungsi hapus venue
  // Fungsi hapus venue (UPGRADED)
  const handleDeleteVenue = async (id: string) => {
    if (!window.confirm("Yakin mau hapus venue ini?\nSemua jadwal yang terdaftar di venue ini akan kehilangan datanya!")) return

    try {
      // 1. Bersihkan dulu tabel rundown yang pakai venue ini
      // Opsi A: Hapus jadwalnya sekalian (Extrem)
      // await supabase.from("rundown").delete().eq("venue_id", id)

      // Opsi B: Cukup kosongin kolom venue_id di jadwal tersebut (Lebih aman)
      const { error: rundownError } = await supabase
        .from("rundown")
        .update({ venue_id: null })
        .eq("venue_id", id)

      if (rundownError) {
        console.error("Gagal update rundown:", rundownError)
        alert("Gagal membersihkan jadwal yang terhubung ke venue ini.")
        return
      }

      // 2. Baru hapus Venue-nya
      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", id)

      if (!error) {
        setVenues((prev) => prev.filter((v) => v.id !== id))
      } else {
        throw error
      }
    } catch (error) {
      const err = error as Error
      console.error("Error deleting venue:", err)
      alert(`Gagal hapus venue: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Map & Venue Settings</h1>
        <p className="text-muted-foreground">
          Upload event map and manage venue locations.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* KOLOM 1: Murni buat Map Upload */}
        <div className="space-y-6">
          {/* OVERING EVENT ID KE MAP UPLOAD CARD BIAR DIA TAU MAU SIMPEN KE MANA */}
          <MapUploadCard eventId={eventId} />
        </div>

        {/* KOLOM 2: Buat ngatur daftar Venue */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="size-5 text-[#2b664d]" />
                Venue Locations
              </CardTitle>
              <CardDescription>
                Daftar lokasi ini akan muncul di dropdown saat admin membuat jadwal acara.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Form Tambah Venue */}
              <form onSubmit={handleAddVenue} className="flex gap-2">
                <Input
                  placeholder="Contoh: Main Stage, Meeting Room A..."
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting || !newVenueName.trim()} className="bg-[#2b664d] hover:bg-[#204d3a] text-white">
                  {isSubmitting ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-2">Add</span>
                </Button>
              </form>

              {/* List Venue */}
              <div className="rounded-md border border-border/50 overflow-hidden">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading venues...
                  </div>
                ) : venues.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground bg-muted/10">
                    Belum ada venue. Silakan tambah di atas.
                  </div>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {venues.map((venue) => (
                      <li
                        key={venue.id}
                        className="flex items-center justify-between p-3 bg-white hover:bg-muted/20 transition-colors"
                      >
                        <span className="text-sm font-medium flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2b664d]"></span>
                          {venue.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteVenue(venue.id)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}