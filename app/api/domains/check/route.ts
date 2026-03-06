import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
    }

    try {
        const projectId = process.env.VERCEL_PROJECT_ID;
        const teamId = process.env.VERCEL_TEAM_ID;
        const token = process.env.VERCEL_TOKEN;

        // If no Vercel token, we can just return a mock success for local development
        if (!projectId || !token) {
            console.warn('Vercel credentials missing. Mocking verification success.');
            return NextResponse.json({ verified: true });
        }

        const fetchUrl = teamId
            ? `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}?teamId=${teamId}`
            : `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`;

        const res = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            return NextResponse.json({ verified: false, error: 'Failed to verify domain with Vercel' });
        }

        const data = await res.json();
        
        // Vercel returns verified: true when DNS is configured correctly
        if (data.verified) {
            return NextResponse.json({ verified: true });
        } else {
            return NextResponse.json({ verified: false });
        }
    } catch (e: any) {
        console.error('Domain Verification Error:', e);
        return NextResponse.json({ verified: false, error: e.message });
    }
}
