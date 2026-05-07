"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams, useRouter } from "next/navigation" 
import {
  CalendarDays,
  ChevronLeft,
  Leaf,
  MapPin,
  Settings,
  LogOut, // <-- Icon LogOut
} from "lucide-react"

import { supabase } from "@/lib/supabase" // <-- Wajib ada buat fungsi logout
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

function SidebarNav() {
  const pathname = usePathname()
  const params = useParams()
  const eventId = params.eventId as string

  const navItems = [
    {
      title: "Rundown",
      href: `/admin/${eventId}`,
      icon: CalendarDays,
    },
    {
      title: "Map Setting",
      href: `/admin/${eventId}/map-settings`,
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
  const router = useRouter() // <-- Panggil router buat redirect

  // --- FUNGSI LOGOUT HARUS ADA DI DALAM SINI ---
  const handleLogout = async () => {
    // Hapus sesi dari Supabase
    await supabase.auth.signOut()
    // Tendang ke halaman login
    router.replace("/admin/login")
  }
  // ---------------------------------------------

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-white">
      <SidebarHeader className="border-b border-border pb-4">
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Events">
              <Link href="/admin">
                <ChevronLeft className="size-4" />
                <span>Back to Events</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href={`/admin/${eventId}/settings`}>
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* TOMBOL LOGOUT */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Logout" 
              onClick={handleLogout} 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AdminSidebar({ children }: { children: React.ReactNode }) {
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