import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://iaadxqlhvrbztfhvvebb.supabase.co";

const supabaseKey = "sb_publishable_jke-bj-GM3RaXRhjR3Ji3w_AWC0uIti";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);