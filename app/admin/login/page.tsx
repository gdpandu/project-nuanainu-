"use client"

import * as React from "react"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase" // <-- Wajib import supabase

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 1. Bersihkan email dari spasi yang nggak sengaja kepencet (depan/belakang)
    const cleanEmail = email.trim()

    // 2. Cek di console (F12) apa sih yang SEBENARNYA dikirim?
    console.log("Mencoba login dengan Email:", `"${cleanEmail}"`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail, // <-- Pakai email yang udah dibersihin
        password: password, // Password nggak usah di-trim, siapa tau emang pakai spasi
      })

      if (error) {
        // Biar tau pasti errornya apa dari mesin Supabase
        alert(`Login gagal: ${error.message}`) 
      } else if (data.session) {
        // Sukses!
        router.refresh() 
        router.push("/admin") 
      }
    } catch (error) {
      alert("Terjadi kesalahan pada sistem jaringan.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk masuk ke Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input 
                  id="password" 
                  type="password" 
                   placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </Field>
            </FieldGroup>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memeriksa..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}