import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://pjopebzgpkitflxagufy.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb3BlYnpncGtpdGZseGFndWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzUzMjYsImV4cCI6MjA3NDY1MTMyNn0.M5W4BrvHPNAw-EBtzkuRCCXB3WeUJDvKdPlxcikxtwU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);