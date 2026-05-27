import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rregfrhtlmfktliijzpd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWdmcmh0bG1ma3RsaWlqenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTAzNTEsImV4cCI6MjA4Njk2NjM1MX0.XuN7GMEHjLURt8THBzhLqTwo1s-srZG8ufhHM3mrAZM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('ground_truth').insert([{
    match_id: 'TEST-123',
    battler_a: 'Battler A',
    battler_b: 'Battler B',
    predicted_winner: 'Battler A',
    actual_winner: 'Battler B',
    confidence: 50,
    mvp_pokemon: 'Pikachu',
    replay_link: 'link',
    hit: false
  }]).select();
  
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

run();
