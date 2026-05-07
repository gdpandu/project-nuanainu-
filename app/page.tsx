"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const eventSlug = "nuanu-festival"; // 🔥 sementara (bisa dynamic nanti)

    const { error } = await supabase.from("smart_event").insert([
      {
        name,
        phone,
        event_slug: eventSlug,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      console.log(error);
      alert("Gagal menyimpan ❌");
      return;
    }

    // ✅ redirect ke flow kamu
    router.push(`/event/${eventSlug}`);
  };

  return (
    <main className="min-h-screen flex flex-col">
      
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-center">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Nuanu Event
          </span>
        </nav>
      </header>

      {/* FORM */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl bg-card p-8 shadow-lg md:p-10">
            
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Welcome to Nuanu Event
              </h1>
              <p className="text-muted-foreground">
                Fill the form to get rundown and map information
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">

                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 h-14 w-full"
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

          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 px-6 py-6">
        <div className="text-center text-sm text-muted-foreground">
          Nuanu Creative City, Bali
        </div>
      </footer>

    </main>
  );
}