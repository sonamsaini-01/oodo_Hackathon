
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware');
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(path);
  const isDashboardRoute = path.startsWith('/dashboard') || 
    ['/assets', '/allocations', '/bookings', '/maintenance', '/audits', '/reports', '/notifications', '/office-map', '/ai-assistant', '/organization'].includes(path);

  // If user is logged in and tries to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT logged in and tries to access dashboard routes, redirect to login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

