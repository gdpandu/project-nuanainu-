"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Users,
  Leaf,
  Sparkles,
  Coffee,
  Music,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Rundown = {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  venue_id: string;
  event_id?: string;
  category?: string;
};

export type Venue = {
  id: string;
  name: string;
  event_id?: string;
};

type Props = {
  data: Rundown[];
  venues: Venue[];
};

export function EventTimeline({ data, venues }: Props) {
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const activeVenue = selectedVenue || (venues?.length > 0 ? venues[0].id : "");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    return data
      .filter((e) => e.venue_id === activeVenue)
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [data, activeVenue]);

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryIcon = (event: Rundown) => {
    const text = (event.category || event.title).toLowerCase();
    if (text.includes("ceremony") || text.includes("opening")) return Sparkles;
    if (text.includes("workshop") || text.includes("eco")) return Leaf;
    if (text.includes("panel") || text.includes("networking")) return Users;
    if (text.includes("break") || text.includes("food")) return Coffee;
    if (text.includes("performance") || text.includes("music")) return Music;
    return Sparkles; 
  };

  const isEventNow = (start: string, end?: string | null) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : startTime + 60 * 60 * 1000;
    const now = currentTime.getTime();
    
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="pt-4 pb-24">
      {/* VENUE TABS */}
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-0">
        {venues?.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVenue(v.id)}
            className={cn(
              "px-5 py-2 rounded-full text-sm transition-all duration-300 whitespace-nowrap border shadow-sm",
              activeVenue === v.id
                ? "bg-[#2b664d] text-white border-[#2b664d] font-medium scale-105" // Efek membesar dikit di tab aktif
                : "bg-white text-foreground border-border hover:bg-muted/50 hover:scale-105"
            )}
          >
            {v.name}
          </button>
        ))}
      </div>

      {/* TIMELINE LIST */}
      <div className="space-y-0 px-4 md:px-0">
        {filteredEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-10">
            Tidak ada jadwal di lokasi ini.
          </p>
        ) : (
          filteredEvents.map((event, index) => {
            const Icon = getCategoryIcon(event);
            const isNow = isEventNow(event.start_time, event.end_time);
            const isLast = index === filteredEvents.length - 1;

            return (
              // TAMBAHIN CLASS "group cursor-pointer" DI SINI
              <div key={event.id} className="relative flex gap-4 group cursor-pointer">
                
                {/* BAGIAN KIRI: GARIS & IKON */}
                <div className="relative flex flex-col items-center">
                  {!isLast && (
                    <div className="absolute top-10 bottom-[-1.5rem] w-px bg-border z-0 transition-colors duration-300 group-hover:bg-[#2b664d]/30" />
                  )}
                  
                  {/* Lingkaran Ikon - Tambahin efek scale dan shadow pas di hover */}
                  <div
                    className={cn(
                      "relative z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:shadow-md",
                      isNow
                        ? "bg-[#c46c4d] border-[#c46c4d] text-white" 
                        : "bg-white border-border text-[#2b664d]"    
                    )}
                  >
                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                </div>

                {/* BAGIAN KANAN: KARTU EVENT */}
                <div className="flex-1 pb-6">
                  {/* Kartu - Tambahin efek melayang (-translate-y-1) dan border highlight */}
                  <div
                    className={cn(
                      "rounded-2xl border p-5 transition-all duration-300 shadow-sm group-hover:-translate-y-1 group-hover:shadow-md",
                      isNow
                        ? "bg-[#faeee8] border-[#e8c9bd] group-hover:border-[#c46c4d]/50" 
                        : "bg-white border-border group-hover:border-[#2b664d]/30"        
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/5 text-xs font-medium text-muted-foreground transition-colors group-hover:bg-black/10">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(event.start_time)} 
                        {event.end_time ? ` - ${formatTime(event.end_time)}` : ""}
                      </div>

                      {isNow && (
                        <span className="px-2.5 py-1 bg-[#c46c4d] text-white text-[10px] font-bold rounded-full tracking-wider uppercase shadow-sm animate-pulse">
                          • Now
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-foreground text-base md:text-lg transition-colors group-hover:text-[#2b664d]">
                      {event.title}
                    </h3>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground/90 mt-1.5 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* PENUTUP TIMELINE */}
        {filteredEvents.length > 0 && (
          <div className="relative flex gap-4 pt-2">
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-muted-foreground transition-transform duration-300 hover:rotate-12 hover:scale-110 cursor-pointer">
                <Moon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 flex items-center">
              <p className="text-sm text-muted-foreground">
                End of scheduled events at this venue
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}