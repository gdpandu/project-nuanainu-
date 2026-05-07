"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { RundownHeader } from "@/components/rundown-header";
import { EventTimeline } from "@/components/event-timeline";
import { TelegramFab } from "@/components/telegram-fab";
import { MapModal } from "@/components/map-modal";

/* ================= TYPES ================= */
type EventType = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
};

type Venue = {
  id: string; // Tadi id-nya number, gue sesuaikan jadi string mengikuti struktur DB lu sebelumnya
  name: string;
  event_id: string;
};

type Rundown = {
  id: string;
  event_id: string;
  venue_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  category?: string; // Tambahan category biar aman
};

export default function RundownPage() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [event, setEvent] = useState<EventType | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [rundown, setRundown] = useState<Rundown[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcode slug event untuk halaman visitor
  const eventSlug = "nuanu-festival";

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      /* ================= EVENT ================= */
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", eventSlug)
        .maybeSingle();

      if (!mounted) return;

      if (!eventData) {
        console.log("❌ EVENT TIDAK DITEMUKAN");
        setLoading(false);
        return;
      }

      setEvent(eventData);

      /* ================= VENUES ================= */
      const { data: venuesData } = await supabase
        .from("venues")
        .select("*")
        .eq("event_id", eventData.id);

      /* ================= RUNDOWN ================= */
      const { data: rundownData } = await supabase
        .from("rundown")
        .select("*")
        .eq("event_id", eventData.id)
        .order("start_time", { ascending: true });

      if (!mounted) return;

      setVenues(venuesData ?? []);
      setRundown(rundownData ?? []);
      setLoading(false);
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground animate-pulse">Memuat jadwal...</p>
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive font-medium">
        Event tidak ditemukan ❌
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* BACKGROUND EFFECT AESTHETIC */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      {/* --- INI YANG DIUBAH BRO: max-w-3xl DIGANTI JADI max-w-6xl w-full px-4 md:px-8 --- */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-8 pb-24 pt-6">
        
        {/* KOMPONEN HEADER */}
        <RundownHeader onViewMap={() => setIsMapOpen(true)} />

        {/* KOMPONEN TIMELINE / JADWAL */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm border border-border/50 rounded-[32px] p-4 md:p-8 shadow-sm">
          <EventTimeline data={rundown} venues={venues} />
        </div>

      </div>

      {/* KOMPONEN MODAL MAPS */}
      <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

      {/* KOMPONEN FLOATING BUTTON TELEGRAM */}
      <TelegramFab telegramUrl="https://t.me/nuanu_support" />
    </div>
  );
}