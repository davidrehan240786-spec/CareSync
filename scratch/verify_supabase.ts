import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySync() {
  console.log("🚀 Starting Supabase Sync Verification...");
  
  // Use a random UUID for testing
  const testId = '00000000-0000-0000-0000-000000000001';
  
  const payload = {
    id: testId,
    full_name: "Test Validation User",
    email: "test_validation@example.com",
    age: 30,
    gender: "non-binary",
    phone_number: "+1234567890",
    blood_group: "O+",
    smoking: false,
    alcohol_consumption: true,
    exercise_frequency: "Daily",
    emergency_contact_name: "Emergency Contact",
    emergency_contact_phone: "911",
    created_at: new Date().toISOString()
  };

  console.log("📝 Attempting insert with payload:", payload);

  const { data, error } = await supabase
    .from('users')
    .upsert(payload);

  if (error) {
    console.error("❌ Sync Failed!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("Error Hint:", error.hint);
    process.exit(1);
  }

  console.log("✅ Sync Successful! Data stored in Supabase.");
  
  console.log("🔍 Verifying retrieval...");
  const { data: retrieved, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', testId)
    .single();

  if (fetchError) {
    console.error("❌ Retrieval Failed:", fetchError.message);
    process.exit(1);
  }

  console.log("✅ Retrieval Successful! Stored Name:", retrieved.full_name);
  
  // Clean up
  console.log("🧹 Cleaning up test data...");
  await supabase.from('users').delete().eq('id', testId);
  console.log("✨ Validation Complete.");
}

verifySync();
