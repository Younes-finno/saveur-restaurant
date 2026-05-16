import { createClient } from "@supabase/supabase-js";

// ← ضع بياناتك هنا بعد ما تسوي الپروجكت في Supabase (راجع SETUP.md)
const SUPABASE_URL = "https://kywuhukfuikcollvmxwk.supabase.co";
const SUPABASE_KEY = "sb_publishable_i7i_GgVbvXyuaNKal0sBnA_CkxoC7Uy";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
