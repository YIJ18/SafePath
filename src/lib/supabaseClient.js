
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://przytoqgxdrrbxmodzoh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByenl0b3FneGRycmJ4bW9kem9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzAxNTIsImV4cCI6MjA2MjE0NjE1Mn0.KXWuRX7y4_4My8rov2Se-AqRI4AO9jqZZIb4VKu6_sM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  