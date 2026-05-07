"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";


interface RundownHeaderProps {
  onViewMap?: () => void;
  title?: string; // 🔥 FIX: tambah ini
}

export function RundownHeader({
  onViewMap,
  title = "Nuanu Event",
}: RundownHeaderProps) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />

      <div className="relative px-4 py-3">
        <div className="flex items-center justify-between gap-3">

          {/* Event Title (DYNAMIC) */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Live Rundown
            </p>
          </div>

          {/* MAP BUTTON */}
          <Button
            onClick={onViewMap}
            className="flex items-center gap-2 px-4 py-2 h-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">View Map</span>
          </Button>

        </div>
      </div>
    </motion.header>
  );
}