const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://postgres:PikachuDay_2026$@db.yckielyejqkzheixodca.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log("Connection successful!");
    
    // Drop existing tables to start fresh with strict user_id constraints
    await client.query(`
      DROP TABLE IF EXISTS audit_logs, ground_truth, predictions, engine_outputs;
    `);

    // Create tables with user_id referencing auth.users
    await client.query(`
      CREATE TABLE engine_outputs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
        engine text NOT NULL,
        data jsonb NOT NULL,
        timestamp timestamp with time zone DEFAULT now()
      );

      CREATE TABLE predictions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
        match_id text NOT NULL,
        battler_a text NOT NULL,
        battler_b text NOT NULL,
        predicted_winner text NOT NULL,
        replay_link text,
        timestamp timestamp with time zone DEFAULT now()
      );

      CREATE TABLE ground_truth (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
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

      CREATE TABLE audit_logs (
        audit_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
        action text NOT NULL,
        affected_record text NOT NULL,
        old_value jsonb,
        new_value jsonb,
        timestamp timestamp with time zone DEFAULT now()
      );

      -- Enable RLS
      ALTER TABLE engine_outputs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ground_truth ENABLE ROW LEVEL SECURITY;
      ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

      -- Create Policies
      CREATE POLICY "Users can fully manage their own engine_outputs" ON engine_outputs FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY "Users can fully manage their own predictions" ON predictions FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY "Users can fully manage their own ground_truth" ON ground_truth FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY "Users can fully manage their own audit_logs" ON audit_logs FOR ALL USING (auth.uid() = user_id);
    `);
    
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
