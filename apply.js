const { Client } = require('pg');
const fs = require('fs');
const DB_URL = 'postgresql://postgres:EgywNLJWv2zjGGw7@db.yidsfihagwttlmhfynmf.supabase.co:5432/postgres';

async function runMigration(filePath, label) {
  const client = new Client(DB_URL);
  await client.connect();
  try {
    console.log(`\n[${label}] Reading migration...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    console.log(`[${label}] ✅ Applied successfully`);
  } catch (e) {
    console.error(`[${label}] ❌ Failed:`, e.message);
  } finally {
    await client.end();
  }
}

async function main() {
  await runMigration('./supabase/migrations/20260728000005_marketplace_enterprise.sql', 'Phase 8 & 9 Marketplace & Enterprise');
  console.log('\n✅ All migrations complete');
}

main();
