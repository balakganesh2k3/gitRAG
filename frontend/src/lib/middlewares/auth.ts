import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes - require both authentication and admin role
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    
    // Check for admin role in user metadata
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Allow public access to the chat widget
  if (request.nextUrl.pathname.startsWith("/widget")) {
    return res
  }

  // Protect API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/widget/:path*"],
}
