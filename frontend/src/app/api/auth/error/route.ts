import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { search } = new URL(req.url);
  // Preserve any error query param e.g., ?error=OAuthCallback
  return NextResponse.redirect(new URL(`/auth/error${search}`, req.url));
}
