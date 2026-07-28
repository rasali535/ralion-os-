const { Client } = require('pg');
const client = new Client('postgresql://postgres:EgywNLJWv2zjGGw7@db.yidsfihagwttlmhfynmf.supabase.co:5432/postgres');
client.connect().then(async () => {
  try {
    console.log("Dropping public schema...");
    await client.query("DROP SCHEMA public CASCADE;");
    console.log("Recreating public schema...");
    await client.query("CREATE SCHEMA public;");
    await client.query("GRANT ALL ON SCHEMA public TO postgres;");
    await client.query("GRANT ALL ON SCHEMA public TO public;");
    // Supabase specific roles
    await client.query("GRANT ALL ON SCHEMA public TO anon;");
    await client.query("GRANT ALL ON SCHEMA public TO authenticated;");
    await client.query("GRANT ALL ON SCHEMA public TO service_role;");
    console.log("Done.");
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});
