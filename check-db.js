const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser
const env = {};
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const domain = 'makemypodcastsite.com';
    console.log(`Checking podcasts for domain: ${domain}`);

    const { data, error } = await supabase
        .from('podcasts')
        .select('id, title, custom_domain')
        .or(`id.eq.${domain},custom_domain.eq.${domain}`)
        .maybeSingle();

    if (error) {
        console.error('Error fetching by domain:', error);
    } else {
        console.log('Result for domain:', data);
    }

    // List all podcasts with non-null custom domains
    const { data: list, error: err2 } = await supabase
        .from('podcasts')
        .select('id, title, custom_domain')
        .not('custom_domain', 'is', 'null');

    if (err2) {
        console.error('Error listing all:', err2);
    } else {
        console.log('All podcasts with custom domains:', list);
    }
}

check();
