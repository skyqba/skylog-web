import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://eyvbhzfhhwpwxtkqumug.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dmJoemZoaHdwd3h0a3F1bXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjAxNDcsImV4cCI6MjA5MjczNjE0N30.WebOyF4WSbAnOuKfejCzG5s1MKRimkW2Gyg3lbyYUhA'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
