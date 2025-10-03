import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import { SessionView } from './session-view';

// Verify and extract fingerprint from signed token
function verifyFingerprint(token: string): string | null {
  const [fingerprint, signature] = token.split('.');
  if (!fingerprint || !signature) return null;

  const secret = process.env.COOKIE_SECRET || 'fallback-secret-change-in-production';
  const hmac = createHmac('sha256', secret);
  hmac.update(fingerprint);
  const expectedSignature = hmac.digest('hex');

  if (signature !== expectedSignature) return null;
  return fingerprint;
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ cid: string }>;
}) {
  const { cid } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('apology_session')?.value;

  // If no auth cookie, redirect to home
  if (!token) {
    redirect('/');
  }

  // Extract fingerprint from signed token
  const fingerprint = verifyFingerprint(token);
  if (!fingerprint) {
    redirect('/');
  }

  return <SessionView cid={cid} fingerprint={fingerprint} />;
}
