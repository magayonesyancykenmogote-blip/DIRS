import { createClient } from '@supabase/supabase-js';

// initialize the Supabase client using environment variables
// make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in .env
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// export types that are used elsewhere in the app
export type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
};
