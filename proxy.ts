import { NextResponse, type NextRequest } from "next/server";

function getOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  // If forwardedHost exists and is an external domain
  if (forwardedHost && !forwardedHost.includes("localhost") && !forwardedHost.includes("127.0.0.1")) {
    return `${proto}://${forwardedHost}`;
  }

  // If host header is an external domain
  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }

  // In production or when behind a reverse proxy that sent localhost as Host
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (process.env.NODE_ENV === "production") {
    if (siteUrl && !siteUrl.includes("localhost")) {
      return siteUrl.replace(/\/+$/, "");
    }
    return "https://minithailandbd.webdevss.tech";
  }

  // Development: preserve localhost with appropriate protocol and port
  return request.nextUrl.origin || request.url;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_access_token")?.value;
  const { pathname } = request.nextUrl;
  const origin = getOrigin(request);

  if (pathname === "/admin/login" && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", origin));
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !token) {
    const loginUrl = new URL("/admin/login", origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
