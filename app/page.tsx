"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

// Import Select Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function EventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const urlEventSlug = searchParams.get("event");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk daftar event (kalau gak ada slug di URL)
  const [availableEvents, setAvailableEvents] = useState<{name: string, slug: string}[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState("");

  // Ambil daftar event dari database kalau slug di URL kosong
  useEffect(() => {
    if (!urlEventSlug) {
      const fetchEvents = async () => {
        const { data } = await supabase.from("events").select("name, slug").order("created_at", { ascending: false });
        if (data) setAvailableEvents(data);
      };
      fetchEvents();
    }
  }, [urlEventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pastikan ada slug (dari URL atau dari dropdown)
    const finalSlug = urlEventSlug || selectedEventSlug;

    if (!name.trim() || !phone.trim() || !finalSlug) {
      alert("Silakan lengkapi data dan pilih event.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("smart_event").insert([
      {
        name,
        phone,
        event_slug: finalSlug, 
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      console.log(error);
      alert("Gagal menyimpan data ❌");
      return;
    }

    // Redirect ke halaman event yang dipilih
    router.push(`/event/${finalSlug}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-5">
        
        {/* INPUT NAMA */}
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 rounded-xl"
          />
        </Field>

        {/* INPUT TELEPON */}
        <Field>
          <FieldLabel>Phone Number</FieldLabel>
          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="h-12 rounded-xl"
          />
        </Field>

        {/* DROPDOWN PILIH EVENT (Hanya muncul kalau gak ada slug di URL) */}
        {!urlEventSlug && (
          <Field>
            <FieldLabel>Select Event</FieldLabel>
            <Select onValueChange={setSelectedEventSlug} required>
              <SelectTrigger className="h-12 rounded-xl bg-white border-border">
                <SelectValue placeholder="Which event are you attending?" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {availableEvents.map((ev) => (
                  <SelectItem key={ev.slug} value={ev.slug}>
                    {ev.name}
                  </SelectItem>
                ))}
                {availableEvents.length === 0 && (
                  <p className="p-2 text-xs text-muted-foreground text-center">No active events found.</p>
                )}
              </SelectContent>
            </Select>
          </Field>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || (!urlEventSlug && !selectedEventSlug)}
          className="mt-4 h-14 w-full rounded-xl bg-[#2b664d] hover:bg-[#204d3a] text-white text-base font-semibold shadow-lg shadow-green-900/10"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-5 w-5" />
              Entering...
            </span>
          ) : (
             "Enter Event"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f8fcf9]">
      
      {/* HEADER */}
      <header className="px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-center">
          <span className="text-xl font-bold tracking-tight text-[#2b664d] flex items-center gap-2">
            <span className="text-2xl">🍃</span> Nuanu Event
          </span>
        </nav>
      </header>

      {/* FORM SECTION */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#2b664d]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="rounded-[32px] bg-white p-8 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100 md:p-10">
            
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Welcome to Nuanu
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please provide your details to access the event rundown and maps.
              </p>
            </div>

            <Suspense fallback={<div className="flex justify-center py-10"><Spinner className="size-8" /></div>}>
              <EventForm />
            </Suspense>

          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 bg-white px-6 py-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nuanu Creative City, Bali
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-widest">
            Experience Sustainability & Innovation
          </p>
        </div>
      </footer>

    </main>
  );
}