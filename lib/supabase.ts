import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://suzxhdlxzxgivkujbcml.supabase.co";
const supabaseKey = "sb_publishable_h0UdqFLxAOfuXV4xfQEwiw_NtUi9cse";

export const supabase = createClient(supabaseUrl, supabaseKey);