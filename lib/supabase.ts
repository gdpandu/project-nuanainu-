import { createClient } from "@supabase/supabase-js";

// Sekarang kita panggil lewat variabel lingkungan, bukan diketik langsung
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pakai tanda seru (!) buat mastiin ke TypeScript kalau nilainya ada
export const supabase = createClient(supabaseUrl!, supabaseKey!);
