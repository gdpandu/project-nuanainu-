"use client"

import * as React from "react"
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
// Pastikan path MapUploadCard kamu bener ya
import { MapUploadCard } from "@/components/admin/map-upload-card" 
import { supabase } from "@/lib/supabase"

// Samain EVENT_ID-nya kayak di AdminPage
const EVENT_ID = "120d91dd-426d-451e-9e70-ad14e719a2ef"

interface Venue {
  id: string
  name: string
}

export default function MapSettingsPage() {
  const [venues, setVenues] = React.useState<Venue[]>([])
  const [newVenueName, setNewVenueName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Ambil data venue dari Supabase
  React.useEffect(() => {
    let isMounted = true

    const fetchVenues = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("venues")
        .select("id, name")
        .eq("event_id", EVENT_ID)
        .order("created_at", { ascending: true }) // Atau order by name

      if (!error && data && isMounted) {
        setVenues(data)
      }
      if (isMounted) setIsLoading(false)
    }

    fetchVenues()

    return () => {
      isMounted = false
    }
  }, [])

  // Fungsi tambah venue
  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVenueName.trim()) return

    setIsSubmitting(true)

    const { data, error } = await supabase
      .from("venues")
      .insert([
        {
          event_id: EVENT_ID,
          name: newVenueName.trim(),
        },
      ])
      .select()
      .single()

    if (!error && data) {
      setVenues((prev) => [...prev, { id: data.id, name: data.name }])
      setNewVenueName("") // Kosongin input setelah sukses
    } else {
      console.error("Error adding venue:", error)
      alert("Gagal menambahkan venue. Cek console log.")
    }

    setIsSubmitting(false)
  }

  // Fungsi hapus venue
  const handleDeleteVenue = async (id: string) => {
    if (!window.confirm("Yakin mau hapus venue ini? Jadwal yang pakai venue ini mungkin bakal error/hilang venue-nya.")) return

    const { error } = await supabase
      .from("venues")
      .delete()
      .eq("id", id)

    if (!error) {
      setVenues((prev) => prev.filter((v) => v.id !== id))
    } else {
      console.error("Error deleting venue:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Map & Venue Settings</h1>
        <p className="text-muted-foreground">
          Upload event map and manage venue locations.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* KOLOM 1: Murni buat Map Upload */}
        <div className="space-y-6">
          <MapUploadCard />
        </div>

        {/* KOLOM 2: Buat ngatur daftar Venue */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Venue Locations
              </CardTitle>
              <CardDescription>
                Daftar lokasi ini akan muncul di dropdown saat admin membuat jadwal acara.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Form Tambah Venue */}
              <form onSubmit={handleAddVenue} className="flex gap-2">
                <Input
                  placeholder="Contoh: Main Stage, Meeting Room A..."
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting || !newVenueName.trim()}>
                  {isSubmitting ? <Spinner className="size-4" /> : <Plus className="size-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-2">Add</span>
                </Button>
              </form>

              {/* List Venue */}
              <div className="rounded-md border">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading venues...
                  </div>
                ) : venues.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Belum ada venue. Silakan tambah di atas.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {venues.map((venue) => (
                      <li
                        key={venue.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium">{venue.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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