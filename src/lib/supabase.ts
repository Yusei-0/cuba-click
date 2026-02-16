import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

const supabaseUrl = "https://pmoiftzrylwkklplhymz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtb2lmdHpyeWx3a2tscGxoeW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMzU5OTEsImV4cCI6MjA4NjcxMTk5MX0.7I230AskXEhzsjZBAOGeel-QiW58eGnDiXmTkhYO1D8";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
