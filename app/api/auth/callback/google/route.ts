import { NextRequest } from 'next/server';
import { handleGoogleOAuthCallback } from '@/lib/google-oauth-callback';

export async function GET(req: NextRequest) {
  return handleGoogleOAuthCallback(req);
}
