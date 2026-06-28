import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ogtyffrokangokeqlufr.supabase.co'
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndHlmZnJva2FuZ29rZXFsdWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzE1NjIsImV4cCI6MjA5ODA0NzU2Mn0.fdHAQlS9OM0bEwjpPB0rJOSFPlhhX7gButoxPWy-Fts'

export const supabase = createClient(supabaseUrl, supabaseKey)
export const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/quick-handler`
