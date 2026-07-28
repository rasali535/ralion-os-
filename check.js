const { Client } = require('pg');
const client = new Client('postgresql://postgres:EgywNLJWv2zjGGw7@db.yidsfihagwttlmhfynmf.supabase.co:5432/postgres');
client.connect().then(() => {
  client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'").then(res => {
    console.log(res.rows);
    client.end();
  });
});
