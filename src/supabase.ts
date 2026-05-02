import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhmlmgdemwwmdwteuicb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobWxtZ2RlbXd3bWR3dGV1aWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjQwNzgsImV4cCI6MjA5MTY0MDA3OH0.j4XXB6KtMVSaWDKbmtZcgTFOepmMIUSIA2U4wi0gSaU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
