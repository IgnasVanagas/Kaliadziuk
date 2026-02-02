import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

function readEnvFile(filePath) {
  const env = {};
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value;
  }
  return env;
}

async function main() {
  const env = readEnvFile('.env');
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from('products_active_localized')
    .select('product_id, locale, price_cents, name')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
}

await main();
