import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') || '';

  // Allow same-origin and explicit allowed origins if needed
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', origin || '*');
  res.headers.set('Vary', 'Origin');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: res.headers });
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};

