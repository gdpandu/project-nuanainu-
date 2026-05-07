"use client"

import * as React from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Ini simulasi loading nyimpen data.
    // Nanti bisa kamu ganti pakai fungsi update ke Supabase ya bro!
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings berhasil disimpan!")
    }, 1000)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Manage your event details and administrator preferences.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Informasi utama tentang event Nuanu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="eventName">Event Name</FieldLabel>
                <Input id="eventName" defaultValue="Nuanu Event 2026" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                  <Input id="startDate" type="date" defaultValue="2026-05-15" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="endDate">End Date</FieldLabel>
                  <Input id="endDate" type="date" defaultValue="2026-05-17" />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Support Email</FieldLabel>
                <Input id="email" type="email" defaultValue="admin@nuanu.com" />
              </Field>
            </FieldGroup>

            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}