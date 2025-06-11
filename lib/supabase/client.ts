import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = "https://njeztgeetwkskuqusuxd.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZXp0Z2VldHdrc2t1cXVzdXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTE2NjYsImV4cCI6MjA2NTIyNzY2Nn0.Bv95TxZriyrZ2oRfcaIH2LRCXc3Y3RBE90ha9ZPRWLU"

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
