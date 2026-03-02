import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const domain = 'makemypodcastsite.com'
    console.log(`Checking podcasts for domain: ${domain}`)

    const { data, error } = await supabase
        .from('podcasts')
        .select('id, title, custom_domain')
        .eq('custom_domain', domain)
        .maybeSingle()

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Result:', data)
    }

    // Also check if any podcast HAS a custom domain at all
    const { data: allWithDomains, error: err2 } = await supabase
        .from('podcasts')
        .select('id, title, custom_domain')
        .not('custom_domain', 'is', null)

    console.log('All podcasts with custom domains:', allWithDomains || err2)
}

check()
