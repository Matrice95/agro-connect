import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let clientUrl = supabaseUrl;
let clientKey = supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please connect to Supabase using the "Connect to Supabase" button in the top right.');
  // Provide fallback values for development
  clientUrl = 'https://msvqxmdyyatmgueexcmp.supabase.co';
  clientKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdnF4bWR5eWF0bWd1ZWV4Y21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MTA4NTksImV4cCI6MjA1NTE4Njg1OX0.uaI3kyYtjz5VSMXTh-kSKGE9KmyPcQj6uWuIA7rv3Sc';
  console.info('Using fallback credentials for development');
}

export const supabase = createClient(clientUrl, clientKey);