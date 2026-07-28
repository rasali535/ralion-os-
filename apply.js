const { Client } = require('pg');
const fs = require('fs');
const client = new Client('postgresql://postgres:EgywNLJWv2zjGGw7@db.yidsfihagwttlmhfynmf.supabase.co:5432/postgres');
client.connect().then(async () => {
  try {
    console.log("Reading Ralion Core migration file...");
    const sql = fs.readFileSync('./supabase/migrations/20260728000001_ralion_core.sql', 'utf8');
    console.log("Applying migration...");
    await client.query(sql);
    console.log("Migration applied successfully!");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    client.end();
  }
});
