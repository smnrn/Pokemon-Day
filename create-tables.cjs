const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://postgres:PikachuDay_2026$@db.yckielyejqkzheixodca.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log("Connection successful!");
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS engine_outputs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        engine text NOT NULL,
        data jsonb NOT NULL,
        timestamp timestamp with time zone DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        match_id text NOT NULL,
        battler_a text NOT NULL,
        battler_b text NOT NULL,
        predicted_winner text NOT NULL,
        timestamp timestamp with time zone DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS ground_truth (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        match_id text NOT NULL,
        battler_a text NOT NULL,
        battler_b text NOT NULL,
        predicted_winner text NOT NULL,
        actual_winner text,
        confidence numeric,
        mvp_pokemon text,
        replay_link text,
        hit boolean,
        timestamp timestamp with time zone DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        audit_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id text NOT NULL,
        action text NOT NULL,
        affected_record text NOT NULL,
        old_value jsonb,
        new_value jsonb,
        timestamp timestamp with time zone DEFAULT now()
      );

      ALTER TABLE engine_outputs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE predictions ADD COLUMN IF NOT EXISTS replay_link text;
      ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
      ALTER TABLE ground_truth DISABLE ROW LEVEL SECURITY;
      ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
    `);
    
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
