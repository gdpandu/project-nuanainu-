"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, ImageIcon } from "lucide-react"
import Image from "next/image" // <-- Import komponen Image dari Next.js
import { Button } from "@/components/ui/button"

// Tambahin props buat nerima data dinamis
interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  mapUrl?: string | null
  venues?: { id: string; name: string }[]
}

export function MapModal({ isOpen, onClose, mapUrl, venues = [] }: MapModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleEscape)
    }
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-4 z-[101] flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-lg max-h-[90vh] bg-card rounded-3xl shadow-2xl shadow-foreground/10 overflow-hidden pointer-events-auto flex flex-col">
              {/* Header */}
              <div className="relative px-5 py-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Event Map
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Nuanu Creative City
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors"
                    aria-label="Close map"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Map Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                
                {/* TAMPILAN MAP DINAMIS */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-secondary/50 shadow-inner border border-border">
                  {mapUrl ? (
                    <Image 
                      src={mapUrl} 
                      alt="Event Map" 
                      fill 
                      className="object-contain" // object-contain biar gambarnya gak kepotong
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm font-medium">Map Belum Tersedia</p>
                      <p className="text-xs opacity-70">Admin belum mengunggah peta event</p>
                    </div>
                  )}
                  {/* Map Overlay for styling */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-border/30 ring-inset" />
                </div>

                {/* Map Legend (List Venue Dinamis) */}
                <div className="mt-4 p-4 bg-secondary/30 rounded-2xl">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">#</span>
                    </span>
                    Lokasi / Venue
                  </h3>
                  
                  {venues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada lokasi yang terdaftar.</p>
                  ) : (
                    <ul className="space-y-2">
                      {venues.map((venue, index) => (
                        <li key={venue.id} className="flex items-start gap-3 text-sm">
                          <span className="shrink-0 w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground leading-relaxed pt-0.5">
                            {venue.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50 shrink-0">
                <Button
                  onClick={onClose}
                  className="w-full h-12 bg-[#2b664d] hover:bg-[#204d3a] text-white rounded-xl shadow-md transition-all"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}