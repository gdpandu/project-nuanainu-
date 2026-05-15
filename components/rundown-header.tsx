"use client";

import { Map, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  eventName: string; // <-- Tambahan props buat nerima nama event
  onViewMap: () => void;
};

export function RundownHeader({ eventName, onViewMap }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-4 md:px-0 pt-4">
      
      {/* JUDUL EVENT (SEKARANG DINAMIS) */}
      <div>
        <h1 className="text-2xl font-bold text-foreground capitalize">
          {eventName || "Nuanu Event"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live Rundown</p>
      </div>
      
      {/* TOMBOL KANAN (Bahasa & Map) */}
      <div className="flex items-center gap-3">
        {/* Tombol Bahasa (Sesuai gambar desain lu) */}
        <Button variant="outline" size="sm" className="hidden sm:flex rounded-full px-4 border-border/60 bg-white">
          <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="font-medium">EN</span>
        </Button>
        
        {/* Tombol View Map */}
        <Button 
          size="sm" 
          onClick={onViewMap} 
          className="bg-[#2b664d] hover:bg-[#204d3a] text-white rounded-full px-5 shadow-sm"
        >
          <Map className="w-4 h-4 mr-2" />
          View Map
        </Button>
      </div>

    </div>
  );
}