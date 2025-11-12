// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Si está logueado y está en la ruta /, redirigir a /system
    if (token && pathname === "/") {
      return NextResponse.redirect(new URL("/system", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // ← Solo verifica que haya token
    },
  }
);

export const config = {
  matcher: ["/", "/system/:path*"], // ← Incluye / y protege todo /system/...
};
