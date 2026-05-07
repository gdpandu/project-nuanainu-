"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation" // <-- Tambah useParams
import {
  CalendarDays,
  ChevronLeft,
  Leaf,
  MapPin,
  Settings,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

// Komponen Navigasi Utama
function SidebarNav() {
  const pathname = usePathname()
  const params = useParams() 
  const eventId = params.eventId as string // <-- Ambil eventId dari URL

  // Pindahin navItems ke dalam sini biar bisa baca eventId
  const navItems = [
    {
      title: "Rundown",
      href: `/admin/${eventId}`, // <-- Jadinya dinamis!
      icon: CalendarDays,
    },
    {
      title: "Map Settings",
      href: `/admin/${eventId}/map-settings`, // <-- Dinamis per event
      icon: MapPin,
    },
  ]

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.title}
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function AdminSidebarContent() {
  const { state } = useSidebar()
  const params = useParams()
  const eventId = params.eventId as string

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border pb-4">
        {/* Tombol Nuanu diklik balik ke list Event */}
        <Link href="/admin" className="flex items-center gap-3 px-2 mt-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-4" />
          </div>
          <div
            className={cn(
              "flex flex-col transition-opacity duration-200",
              state === "collapsed" && "opacity-0"
            )}
          >
            <span className="text-sm font-semibold">Nuanu</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Event Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Tombol Back sekarang baliknya ke Dashboard Utama Admin */}
            <SidebarMenuButton asChild tooltip="Back to Event List">
              <Link href="/admin">
                <ChevronLeft className="size-4" />
                <span>Back to Events</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            {/* Link Settings juga dibikin dinamis */}
            <SidebarMenuButton asChild tooltip="Event Settings">
              <Link href={`/admin/${eventId}/settings`}>
                <Settings className="size-4" />
                <span>Event Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function EventAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AdminSidebarContent />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex-1" />
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}