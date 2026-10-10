import { createClient } from '@supabase/supabase-js'

// These are public browser credentials. Database access is protected by the
// Row Level Security policies in supabase/migrations/001_catalog_and_enquiries.sql.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mwmelfutklbnzrvspfpj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13bWVsZnV0a2xibnpydnNwZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mjc2ODQsImV4cCI6MjEwNzIwMzY4NH0.lFJE6US_qGx30KNdb_48AAoaQ5rTAP9QSpfkybDx7CQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
