const { Client } = require('pg');

async function cleanIrrelevantTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:PikachuDay_2026$@db.yckielyejqkzheixodca.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log("Connection successful!");

    // Drop the irrelevant kv_store table seen in the screenshot
    await client.query(`
      DROP TABLE IF EXISTS kv_store_26b03c13;
    `);
    
    console.log("Successfully dropped kv_store_26b03c13 to keep the database fully in sync with the system needs!");
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

cleanIrrelevantTables();
