import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Missing domain' }, { status: 400 });
    }

    try {
        const projectId = process.env.VERCEL_PROJECT_ID;
        const teamId = process.env.VERCEL_TEAM_ID;
        const token = process.env.VERCEL_TOKEN;

        if (!projectId || !token) {
            // For dev/demo, always return verified if tokens missing
            return NextResponse.json({ verified: true });
        }

        const fetchUrl = teamId
            ? `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}?teamId=${teamId}`
            : `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`;

        const res = await fetch(fetchUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            return NextResponse.json({ verified: false });
        }

        const data = await res.json();
        return NextResponse.json({ verified: data.verified });
    } catch (error: any) {
        return NextResponse.json({ verified: false, error: error.message });
    }
}
