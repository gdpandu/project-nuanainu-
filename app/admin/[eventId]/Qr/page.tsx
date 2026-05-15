"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { QrCode, Printer, ExternalLink, Copy, Check, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function UserDashboardQrPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const [copied, setCopied] = React.useState(false)
  
  // --- FIX HYDRATION ERROR START ---
  const [baseUrl, setBaseUrl] = React.useState("")

  React.useEffect(() => {
    // Kita set origin-nya pas komponen sudah "mounted" di browser
    setBaseUrl(window.location.origin)
  }, [])

  // Kalau baseUrl belum siap, tampilin loading atau kosongin dulu link-nya
  const userDashboardUrl = baseUrl ? `${baseUrl}` : ""
  // --- FIX HYDRATION ERROR END ---

  const qrImageUrl = userDashboardUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(userDashboardUrl)}&color=2b664d`
    : ""

  const handleCopy = () => {
    if (!userDashboardUrl) return
    navigator.clipboard.writeText(userDashboardUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-2 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-[#2b664d]">User Dashboard QR</h1>
        <p className="text-muted-foreground">Scan QR ini untuk pengunjung mengakses Dashboard Event.</p>
      </div>

      <Card className="shadow-2xl border-t-8 border-t-[#2b664d] overflow-hidden bg-white">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto size-16 bg-[#f0f9f4] rounded-full flex items-center justify-center mb-4">
            <Smartphone className="size-8 text-[#2b664d]" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-800">Event Digital Guide</CardTitle>
          <CardDescription className="text-lg">Scan to access the full event experience</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 space-y-8">
          
          {/* QR CODE AREA */}
          <div className="p-4 bg-white rounded-2xl shadow-[0_0_50px_rgba(43,102,77,0.1)] border border-zinc-100 min-h-[256px] flex items-center justify-center">
            {qrImageUrl ? (
              <img 
                src={qrImageUrl} 
                alt="User Dashboard QR" 
                className="size-64 md:size-72"
              />
            ) : (
              <div className="size-64 flex items-center justify-center text-muted-foreground">Generating QR...</div>
            )}
          </div>

          {/* LINK DISPLAY */}
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="flex-1 text-xs font-mono truncate text-zinc-600">
                {userDashboardUrl || "Loading link..."}
              </span>
              <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!userDashboardUrl} className="size-8">
                {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm print:hidden">
            <Button 
              variant="outline" 
              disabled={!userDashboardUrl}
              onClick={() => window.open(userDashboardUrl, '_blank')}
            >
              <ExternalLink className="mr-2 size-4" /> Preview
            </Button>
            <Button 
              className="bg-[#2b664d] hover:bg-[#204d3a] text-white" 
              disabled={!userDashboardUrl}
              onClick={() => window.print()}
            >
              <Printer className="mr-2 size-4" /> Print QR
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}