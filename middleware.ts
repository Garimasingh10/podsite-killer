import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

export default function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
    const hostname = req.headers.get('host') || 'localhost:3000';

    // Only for development: we might want to test the custom domain locally, but for now we assume localhost:3000 is our main app
    const isMainApp =
        hostname === 'localhost:3000' ||
        hostname === process.env.NEXT_PUBLIC_APP_DOMAIN ||
        hostname === 'app.podsitekiller.com' ||
        hostname.includes('vercel.app');

    // If hitting the main app (e.g., localhost:3000/dashboard)
    if (isMainApp) {
        return NextResponse.next();
    }

    // Otherwise, it's a custom domain (namanspodcast.com) or subdomain (naman.podsitekiller.com)
    // We want to route them to `/[customDomain]` which we will handle in `app/(public)/[subdomain]/page.tsx`

    // Clean hostname for mapping
    // If it's a subdomain on our app domain (e.g., naman.podsitekiller.com), we could extract 'naman' instead.
    // But let's route exactly by the full hostname and let the server component resolve it.
    const cleanHostname = hostname.replace('www.', '');

    return NextResponse.rewrite(new URL(`/${cleanHostname}${url.pathname === '/' ? '' : url.pathname}`, req.url));
}
