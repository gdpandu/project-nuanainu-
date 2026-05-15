"use client"

import * as React from "react"
import { Upload, X, Map as MapIcon } from "lucide-react"
import Image from "next/image"

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
import { supabase } from "@/lib/supabase"

interface MapUploadCardProps {
  eventId: string
}

export function MapUploadCard({ eventId }: MapUploadCardProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [mapUrl, setMapUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    let isMounted = true

    const fetchMap = async () => {
      if (!eventId) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("events")
          .select("maps_url")
          .eq("id", eventId)
          .single() 

        if (error) {
          console.error("❌ ERROR DATABASE:", error.message)
        } else if (data && data.maps_url) {
          if (isMounted) setMapUrl(data.maps_url)
        }
      } catch (err) {
        console.error("❌ CATCH ERROR:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchMap()

    return () => {
      isMounted = false
    }
  }, [eventId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !eventId) return

    // Cek ukuran file (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File kegedean bro! Maksimal 5MB ya.")
      return
    }

    setIsUploading(true)
    console.log("Memulai upload untuk event:", eventId)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${eventId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Proses Upload ke Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('maps')
        .upload(filePath, file, {
          upsert: true // Biar kalau ada file sama langsung ditiban
        })

      if (uploadError) {
        console.error("❌ Gagal Upload ke Storage:", uploadError)
        throw new Error(`Storage Error: ${uploadError.message}`)
      }

      console.log("✅ File masuk ke storage:", uploadData)

      // 2. Ambil Link Public
      const { data: { publicUrl } } = supabase.storage
        .from('maps')
        .getPublicUrl(filePath)

      // 3. Update ke Tabel Events
      const { error: dbError } = await supabase
        .from("events")
        .update({
          maps_url: publicUrl,
        })
        .eq("id", eventId)

      if (dbError) {
        console.error("❌ Gagal Update Database:", dbError)
        throw new Error(`Database Error: ${dbError.message}`)
      }

      setMapUrl(publicUrl)
      alert("Mantap! Map berhasil di-upload 🔥")

    } catch (error) {
      const err = error as Error
      alert(`Waduh Error: ${err.message}`)
    } finally {
      setIsUploading(false)
      // Reset input file biar bisa pilih file yang sama lagi kalau mau
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }
  const handleDelete = async () => {
    if (!window.confirm("Yakin mau hapus map event ini?")) return
    setIsUploading(true)

    try {
      const { error } = await supabase
        .from("events")
        .update({
          maps_url: null,
        })
        .eq("id", eventId)

      if (!error) {
        setMapUrl(null)
      } else {
        throw error
      }
    } catch (error) {
      // PENYELESAIAN ERROR 'any' DI SINI
      const err = error as Error
      console.error("Error deleting map:", err)
      alert(`Gagal hapus: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapIcon className="size-5 text-[#2b664d]" />
          Event Map
        </CardTitle>
        <CardDescription>
          Upload denah atau peta utama untuk event ini. Hanya 1 peta per event.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner className="size-6" />
          </div>
        ) : mapUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted shadow-sm">
              <Image 
                src={mapUrl} 
                alt="Event Map" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={handleDelete} disabled={isUploading}>
                {isUploading ? <Spinner className="mr-2 size-4" /> : <X className="mr-2 size-4" />}
                Remove Map
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-8 text-center bg-white hover:bg-muted/30 transition-colors">
            <div className="rounded-full bg-[#2b664d]/10 p-3 text-[#2b664d]">
              <Upload className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Click to upload map</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG or SVG (max. 5MB)
              </p>
            </div>
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleUpload}
              disabled={isUploading}
             />
            <Button 
              className="bg-[#2b664d] hover:bg-[#204d3a] text-white" 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Spinner className="mr-2 size-4" /> : null}
              {isUploading ? "Uploading..." : "Select File"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}