const { Client } = require('pg');

async function createProfiles() {
  const client = new Client({
    connectionString: 'postgresql://postgres:PikachuDay_2026$@db.yckielyejqkzheixodca.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log("Connection successful!");

    await client.query(`
      -- Create a table for public profiles
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid references auth.users not null primary key,
        username text unique not null,
        section text,
        created_at timestamp with time zone default now()
      );

      -- Enable RLS on profiles
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
      CREATE POLICY "Public profiles are viewable by everyone."
        ON public.profiles FOR SELECT
        USING ( true );

      DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
      CREATE POLICY "Users can insert their own profile."
        ON public.profiles FOR INSERT
        WITH CHECK ( auth.uid() = id );

      DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
      CREATE POLICY "Users can update own profile."
        ON public.profiles FOR UPDATE
        USING ( auth.uid() = id );

      -- Create a trigger function that copies data from auth.users to public.profiles
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, username, section)
        VALUES (
          new.id,
          split_part(new.email, '@', 1),
          new.raw_user_meta_data->>'section'
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Drop the trigger if it exists
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

      -- Attach the trigger to the auth.users table
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);
    
    console.log("Profiles table and trigger created successfully!");
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

createProfiles();
