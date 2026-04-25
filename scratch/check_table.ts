import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  const { error } = await supabase.from('health_records').select('*').limit(1);
  if (error) {
    console.log("TABLE_NOT_FOUND: health_records");
  } else {
    console.log("TABLE_FOUND: health_records");
  }
}

checkTable();
