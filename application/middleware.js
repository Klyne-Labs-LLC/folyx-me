import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  
  // Simple test - log all requests
  console.log('🚀 MIDDLEWARE RUNNING - hostname:', hostname, 'path:', url.pathname);
  
  // Check if this is a subdomain request
  if (hostname) {
    const subdomain = getSubdomain(hostname);
    
    // Debug logging
    console.log('🔍 Subdomain detected:', subdomain);
    
    // If it's a subdomain (not app.folyx.me or folyx.me)
    if (subdomain && subdomain !== 'app' && subdomain !== 'www') {
      console.log('✅ Rewriting subdomain:', subdomain, 'to /portfolio/' + subdomain);
      // Rewrite to the portfolio page with the subdomain as slug
      url.pathname = `/portfolio/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  return res;
}

function getSubdomain(hostname) {
  // Handle localhost development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null;
  }
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  
  // For folyx.me: parts = ['subdomain', 'folyx', 'me']
  // For app.folyx.me: parts = ['app', 'folyx', 'me']
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
