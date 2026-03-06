import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Resend signup confirmation email.
 * Supabase sends this via your configured SMTP (e.g. Resend).
 * Ensure in Supabase: Auth → Email → "Confirm email" ON, and SMTP set to Resend.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    if (error) {
      console.error('Resend confirmation error:', error.message);
      return NextResponse.json(
        { error: error.message || 'Failed to resend verification email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent. Check your inbox and spam folder.',
      ...data,
    });
  } catch (e: any) {
    console.error('Resend confirmation exception:', e);
    return NextResponse.json(
      { error: e?.message || 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
