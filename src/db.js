import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Audit Log ----
export async function addAuditLog(action, record, oldVal, newVal) {
  const { data, error } = await supabase.from('audit_logs').insert([{
    action,
    affected_record: record,
    old_value: oldVal,
    new_value: newVal
  }]).select();
  if (error) console.error('addAuditLog error:', error);
  window.dispatchEvent(new Event('db_updated'));
}

export async function getAuditLogs() {
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
  if (error) console.error('getAuditLogs error:', error);
  return data || [];
}

// ---- Engine Output ----
export async function saveEngineOutput(engine, data) {
  const { data: entry, error } = await supabase.from('engine_outputs').insert([{
    engine,
    data
  }]).select();
  if (error) console.error('saveEngineOutput error:', error);
  
  await addAuditLog('CREATE', `engine_output:${engine}`, null, entry?.[0]);
  return entry?.[0];
}

export async function getEngineOutputs(engine) {
  const { data, error } = await supabase.from('engine_outputs').select('*').eq('engine', engine).order('timestamp', { ascending: false }).limit(50);
  if (error) console.error('getEngineOutputs error:', error);
  return data || [];
}

// ---- Predictions ----
export async function savePrediction(matchId, battlerA, battlerB, predictedWinner, replayLink) {
  const { data: entry, error } = await supabase.from('predictions').insert([{
    match_id: matchId,
    battler_a: battlerA,
    battler_b: battlerB,
    predicted_winner: predictedWinner,
    replay_link: replayLink
  }]).select();
  if (error) console.error('savePrediction error:', error);
  
  await addAuditLog('CREATE', `prediction:${matchId}`, null, entry?.[0]);
  window.dispatchEvent(new Event('db_updated'));
}

// ---- Ground Truth (Battle Results) ----
export async function saveBattleResult(matchId, battlerA, battlerB, predicted, actual, confidence, mvp, replayLink) {
  const hit = predicted === actual;
  const { data: entry, error } = await supabase.from('ground_truth').insert([{
    match_id: matchId,
    battler_a: battlerA,
    battler_b: battlerB,
    predicted_winner: predicted,
    actual_winner: actual,
    confidence,
    mvp_pokemon: mvp,
    replay_link: replayLink,
    hit
  }]).select();
  if (error) console.error('saveBattleResult error:', error);
  
  await addAuditLog('CREATE', `battle_result:${matchId}`, null, entry?.[0]);
  return { hit };
}

export async function getBattleLog() {
  const { data, error } = await supabase.from('ground_truth').select('*').order('timestamp', { ascending: false });
  if (error) console.error('getBattleLog error:', error);
  return data || [];
}

// ---- Stats ----
export async function getStats() {
  const { data, error } = await supabase.from('ground_truth').select('*');
  if (error) {
    console.error('getStats error:', error);
    return { accuracy: 0, correct: 0, total: 0, brierScore: 0, logLoss: 0 };
  }
  const total = data.length;
  const correct = data.filter(r => r.hit).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  let brierScore = 0;
  let logLoss = 0;
  if (total > 0) {
    let sumBrier = 0;
    let sumLogLoss = 0;
    data.forEach(b => {
      const prob = Math.max(Math.min((b.confidence || 50) / 100, 0.999), 0.001);
      const actual = b.hit ? 1 : 0;
      sumBrier += Math.pow(prob - actual, 2);
      sumLogLoss += -(actual * Math.log(prob) + (1 - actual) * Math.log(1 - prob));
    });
    brierScore = sumBrier / total;
    logLoss = sumLogLoss / total;
  }

  return { accuracy, correct, total, brierScore, logLoss };
}
