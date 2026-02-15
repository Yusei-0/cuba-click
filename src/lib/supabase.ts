import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

const supabaseUrl = "https://mcrnkeumzsjtlaxhpjhf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcm5rZXVtenNqdGxheGhwamhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjgwNzMsImV4cCI6MjA4NTEwNDA3M30.YepQdlyYOwpR55zwCRQom6HJTNhJI0THjSqZdf6kNDY";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
