"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import type { ScheduleItem } from "./schedule-table"

interface AddScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // UPDATE: Tambahkan 'date: string' di payload onSubmit
  onSubmit: (data: Omit<ScheduleItem, "id"> & { venue_id: string; date: string }) => Promise<void> | void
  editItem?: ScheduleItem | null
  venues: { id: string; name: string }[]
}

export function AddScheduleModal({
  open,
  onOpenChange,
  onSubmit,
  editItem,
  venues,
}: AddScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // UPDATE: Tambahkan 'date' ke initial state
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    date: "", // <-- Tambahan baru
    time: "",
    category: "workshop" as ScheduleItem["category"],
    venue_id: "", 
  })

  React.useEffect(() => {
    const defaultVenueId = venues.length > 0 ? venues[0].id : ""

    const initializeForm = () => {
      if (editItem) {
        setFormData({
          title: editItem.title,
          description: editItem.description,
          date: editItem.date || "", // <-- Load date saat mode edit
          time: editItem.time,
          category: editItem.category,
          venue_id: (editItem as ScheduleItem & { venue_id?: string }).venue_id || defaultVenueId, 
        })
      } else {
        setFormData({
          title: "",
          description: "",
          date: "", // <-- Reset date saat bikin baru
          time: "",
          category: "workshop",
          venue_id: defaultVenueId,
        })
      }
    }

    setTimeout(initializeForm, 0)
    
  }, [editItem, open, venues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.venue_id) {
      alert("Harap pilih Venue (Lokasi) terlebih dahulu!")
      return
    }

    if (!formData.date) {
      alert("Harap pilih Tanggal terlebih dahulu!")
      return
    }

    setIsSubmitting(true)

    // formData sekarang udah include 'date', jadi aman pas dikirim ke AdminPage
    await onSubmit(formData)
    
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {editItem ? "Edit Schedule Item" : "Add New Schedule"}
          </DialogTitle>
          <DialogDescription>
            {editItem
              ? "Update the schedule item details below."
              : "Create a new schedule item for the event rundown."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="e.g., Morning Yoga Session"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe the session or activity..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </Field>

            {/* UPDATE: Jadikan 2 kolom buat Date dan Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="date">Date</FieldLabel>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="time">Time</FieldLabel>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  required
                />
              </Field>
            </div>

            {/* UPDATE: Jadikan 2 kolom buat Category dan Venue */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select
                  value={formData.category}
                  onValueChange={(value: ScheduleItem["category"]) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceremony">Ceremony</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="venue">Venue</FieldLabel>
                <Select
                  value={formData.venue_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, venue_id: value }))
                  }
                >
                  <SelectTrigger id="venue">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
            <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Will automatically translate to <strong>ID</strong> &{" "}
              <strong>RU</strong> via AI
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  {editItem ? "Updating..." : "Creating..."}
                </>
              ) : editItem ? (
                "Update Schedule"
              ) : (
                "Add Schedule"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}