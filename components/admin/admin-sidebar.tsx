"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" 
import {
  CalendarDays,
  Leaf,
  MapPin,
  Settings,
  LogOut,
  BrainCircuit, 
  LayoutDashboard,
  Settings2 // <-- Import ikon baru buat Bot Settings
} from "lucide-react"

import { supabase } from "@/lib/supabase"
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

// Komponen Navigasi Utama (Hanya muncul jika eventId ada)
function SidebarNav({ eventId, pathname }: { eventId: string; pathname: string }) {
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
    {
      title: "QnA Setting",
      href: `/admin/${eventId}/Qna`, 
      icon: BrainCircuit,
    },
    // --- MENU BARU: BOT SETTINGS ---
    {
      title: "Bot Settings",
      href: `/admin/${eventId}/bot-settings`, 
      icon: Settings2,
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
            <Link 
              href={item.href} 
              className={cn(pathname === item.href && "text-[#2b664d] font-bold")}
            >
              <item.icon className={cn("size-4", pathname === item.href && "text-[#2b664d]")} />
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
  const pathname = usePathname() 
  const router = useRouter()
  
  // HACK SAKTI: Ambil ID event langsung dari URL!
  const eventId = pathname.split('/')[2]

  // FUNGSI LOGOUT (Udah mantap nih bawaan lu)
  const handleLogout = async () => {
    if(!confirm("Yakin ingin keluar?")) return
    await supabase.auth.signOut()
    router.replace("/admin/login")
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-white">
      {/* HEADER: LOGO */}
      <SidebarHeader className="border-b border-border pb-4">
        <Link href="/admin" className="flex items-center gap-3 px-2 mt-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b664d] text-white shadow-sm">
            <Leaf className="size-4" />
          </div>
          <div className={cn("flex flex-col transition-opacity duration-200", state === "collapsed" && "opacity-0")}>
            <span className="text-sm font-bold text-[#2b664d]">Nuanu</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Admin Panel</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* CONTENT: NAVIGASI */}
      <SidebarContent>
        {eventId && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-widest font-bold">Event Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarNav eventId={eventId} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* FOOTER: SETTINGS & LOGOUT */}
      <SidebarFooter className="border-t border-border pt-4 pb-4 px-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="All Events" isActive={pathname === '/admin'}>
              <Link href="/admin">
                <LayoutDashboard className="size-4" />
                <span>All Events</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {eventId && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname?.includes('/settings') && !pathname?.includes('bot-settings')}>
                <Link href={`/admin/${eventId}/settings`}>
                  <Settings className="size-4" />
                  <span>Event Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <div className="my-2 border-t border-border/50 mx-2" />

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
      <div className="flex min-h-screen w-full bg-[#f8fcf9]">
        <AdminSidebarContent />
        <main className="flex-1 overflow-auto">
          {/* TOPBAR */}
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-white/80 px-6 backdrop-blur-md">
            <SidebarTrigger className="text-[#2b664d]" />
            <div className="flex-1" />
          </div>
          
          {/* CONTENT AREA */}
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}