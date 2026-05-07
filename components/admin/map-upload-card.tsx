"use client"

import * as React from "react"
import { Upload, X, Map as MapIcon } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // <-- TAMBAHIN BARIS INI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/lib/supabase"

// Samain EVENT_ID-nya!
const EVENT_ID = "120d91dd-426d-451e-9e70-ad14e719a2ef"

export function MapUploadCard() {
  const [isUploading, setIsUploading] = React.useState(false)
  const [mapUrl, setMapUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // 1. Ambil Map yang udah ada (Per Event)
  React.useEffect(() => {
    let isMounted = true

    const fetchMap = async () => {
      const { data, error } = await supabase
        .from("event_maps")
        .select("image_url")
        .eq("event_id", EVENT_ID)
        .single() // Karena UNIQUE, pasti max cuma 1 data

      if (!error && data && isMounted) {
        setMapUrl(data.image_url)
      }
      if (isMounted) setIsLoading(false)
    }

    fetchMap()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Fungsi Upload Map Baru
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Bikin nama file unik pakai timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `${EVENT_ID}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload ke bucket 'maps'
      const { error: uploadError } = await supabase.storage
        .from('maps')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Ambil Public URL gambarnya
      const { data: { publicUrl } } = supabase.storage
        .from('maps')
        .getPublicUrl(filePath)

      // Upsert (Insert kalau belum ada, Update kalau udah ada) ke event_maps
      const { error: dbError } = await supabase
        .from("event_maps")
        .upsert({
          event_id: EVENT_ID,
          image_url: publicUrl,
        }, { onConflict: 'event_id' })

      if (dbError) throw dbError

      setMapUrl(publicUrl)
      alert("Map berhasil di-upload!")

    } catch (error) {
      console.error("Error uploading map:", error)
      alert("Gagal upload map. Pastikan bucket 'maps' sudah dibuat dan public.")
    } finally {
      setIsUploading(false)
    }
  }

  // 3. Fungsi Hapus Map
  const handleDelete = async () => {
    if (!window.confirm("Yakin mau hapus map event ini?")) return
    setIsUploading(true)

    // Cukup hapus record di database (file di storage bisa dibiarin atau dihapus juga)
    const { error } = await supabase
      .from("event_maps")
      .delete()
      .eq("event_id", EVENT_ID)

    if (!error) {
      setMapUrl(null)
    }
    setIsUploading(false)
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="size-5" />
          Event Map
        </CardTitle>
        <CardDescription>
          Upload denah atau peta utama untuk event ini. Hanya 1 peta per event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner className="size-6" />
          </div>
        ) : mapUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              {/* Gambar peta ditampilkan di sini */}
              <Image 
                src={mapUrl} 
                alt="Event Map" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="destructive" onClick={handleDelete} disabled={isUploading}>
                {isUploading ? <Spinner className="mr-2 size-4" /> : <X className="mr-2 size-4" />}
                Remove Map
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center bg-muted/50 hover:bg-muted transition-colors">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Upload className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Click to upload map</p>
              <p className="text-xs text-muted-foreground mt-1">
                SVG, PNG, JPG or GIF (max. 5MB)
              </p>
            </div>
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="map-upload" 
              onChange={handleUpload}
              disabled={isUploading}
             />
            <Button asChild variant="secondary" disabled={isUploading}>
              <label htmlFor="map-upload" className="cursor-pointer">
                {isUploading ? <Spinner className="mr-2 size-4" /> : null}
                {isUploading ? "Uploading..." : "Select File"}
              </label>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}