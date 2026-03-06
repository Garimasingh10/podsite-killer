import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  console.log('--- Auth Callback Start (HTML Bridge Mode) ---');

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=no_code`);
  }

  const pendingCookies: { name: string; value: string; options: any }[] = [];
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          console.log('Auth Callback - Queueing cookies:', cookiesToSet.map(c => c.name));
          pendingCookies.push(...cookiesToSet);

          // Also set on server side for completeness
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  // Micro-delay to ensure setAll internal callbacks complete (Next.js 15+ quirk)
  if (pendingCookies.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (error) {
    console.error('Auth Callback - Exchange failed:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    
    // Handle specific error cases
    let errorMsg = error.message;
    if (error.message.includes('invalid_grant') || error.message.includes('code')) {
      errorMsg = 'Authentication code expired or invalid. Please try logging in again.';
    } else if (error.message.includes('provider')) {
      errorMsg = 'Authentication provider error. Please try again or use email/password.';
    }
    
    return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  // Verify we got a user and session
  if (!data?.user || !data?.session) {
    console.error('Auth Callback - No user or session after exchange');
    return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent('Session not established. Please try again.')}`);
  }

  console.log('Auth Callback - Success:', {
    userId: data.user.id,
    email: data.user.email,
    hasSession: !!data.session,
  });

  // Send welcome email EXACTLY ONCE upon first verified login
  if (data.user.email && !data.user.user_metadata?.welcome_email_sent) {
    console.log('Auth Callback - First time verification/login! Sending Welcome Email...');
    
    // We run the fetch directly to Resend instead of internal API route looping
    // to prevent serverless function timeouts/drops.
    try {
      if (process.env.RESEND_API_KEY) {
        const { getWelcomeEmailHtml, sendResend } = await import('@/lib/emails');
        const html = getWelcomeEmailHtml();
        await sendResend(data.user.email, 'Welcome to PodSite 🚀', html);
        
        // Mark user as having received the welcome blast
        await supabase.auth.updateUser({
          data: { welcome_email_sent: true }
        });
        console.log('Welcome Email dispatched successfully.');
      } else {
        console.warn('RESEND_API_KEY missing - skipping welcome email');
      }
    } catch (emailErr) {
      console.error('Failed to dispatch welcome email:', emailErr);
    }
  }

  // HTML Bridge: Sets cookies via JS and THEN redirects.
  // This is the "Nuclear" fix for race conditions in server-side redirects.
  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Verifying Studio Session...</title></head>
      <body style="background: #020617; color: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="text-align: center;">
          <div style="margin-bottom: 20px;">Setting up your studio...</div>
          <script>
            console.log('HTML Bridge - Setting cookies...');
            ${pendingCookies.map(c => `
              document.cookie = "${c.name}=${c.value}; Path=/; SameSite=Lax; Max-Age=${c.options?.maxAge ?? 3600}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}";
            `).join('')}
            
            // Verify cookies are set before redirect
            setTimeout(() => {
              console.log('HTML Bridge - Cookies set, redirecting to ${next}');
              window.location.href = "${next}";
            }, 100);
          </script>
        </div>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      // Still staple to headers as a fallback
      ...Object.fromEntries(pendingCookies.map(c => [
        'Set-Cookie',
        `${c.name}=${c.value}; Path=/; SameSite=Lax; Max-Age=${c.options?.maxAge ?? 3600}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      ]))
    },
  });
}

